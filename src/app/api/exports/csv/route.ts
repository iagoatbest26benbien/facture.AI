import { NextResponse } from "next/server";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? `${new Date().getFullYear()}-01-01`;
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0,10);

  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("invoices")
    .select("invoice_date, invoice_number, total_ht, total_vat, total_ttc, clients(name)")
    .eq("user_id", user.id)
    .gte("invoice_date", from)
    .lte("invoice_date", to)
    .order("invoice_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => [
    r.invoice_date,
    r.invoice_number,
    r.clients?.name ?? "",
    Number(r.total_ht ?? 0).toFixed(2),
    Number(r.total_vat ?? 0).toFixed(2),
    Number(r.total_ttc ?? 0).toFixed(2),
  ]);

  const csv = [
    ["Date", "Numéro", "Client", "Montant HT", "TVA", "TTC"],
    ...rows,
  ].map((r) => r.join(",")).join("\n");

  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
