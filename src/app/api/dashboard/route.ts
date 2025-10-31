import { NextResponse } from "next/server";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

  const { data: invoicesThisMonth } = await admin
    .from("invoices")
    .select("total_ttc, status")
    .eq("user_id", user.id)
    .gte("invoice_date", startOfMonth.toISOString().slice(0, 10));

  const totalTTC = (invoicesThisMonth ?? [])
    .filter((i) => i.total_ttc)
    .reduce((sum, i) => sum + Number(i.total_ttc), 0);

  const numInvoices = invoicesThisMonth?.length ?? 0;
  const unpaid = (invoicesThisMonth ?? []).filter((i) => i.status !== "paid").length;
  const avg = numInvoices > 0 ? totalTTC / numInvoices : 0;

  const { data: recent } = await admin
    .from("invoices")
    .select("id, invoice_number, status, total_ttc, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const rows = (recent ?? []).map((r: any) => ({
    id: r.id,
    invoice_number: r.invoice_number,
    status: r.status,
    total_ttc: Number(r.total_ttc ?? 0),
    client_name: r.clients?.name ?? null,
  }));

  return NextResponse.json({
    stats: [
      { label: "CA du mois", value: `${totalTTC.toFixed(2)} €` },
      { label: "Factures", value: String(numInvoices) },
      { label: "En attente", value: String(unpaid) },
      { label: "Moyenne", value: `${avg.toFixed(2)} €` },
    ],
    recent: rows,
  });
}


