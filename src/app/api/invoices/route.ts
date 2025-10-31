import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getUserFromAuthHeader } from "@/lib/auth";

export const runtime = "nodejs";

function pad(n: number) {
  return n.toString().padStart(3, "0");
}

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("invoices")
    .select("id, invoice_number, status, total_ttc, client_id, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => ({
    id: r.id,
    invoice_number: r.invoice_number,
    status: r.status,
    total_ttc: Number(r.total_ttc ?? 0),
    client_name: r.clients?.name ?? null,
  }));

  return NextResponse.json({ invoices: rows });
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Enforce free plan limit: 3 invoices per month
  const admin = createAdminSupabaseClient();
  const { data: profile } = await admin.from("profiles").select("is_pro").eq("id", user.id).single();
  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
  const { data: invoicesCount } = await admin
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("invoice_date", startOfMonth.toISOString().slice(0,10));

  const count = (invoicesCount as any)?.length ?? 0; // head:true, many drivers return null for data
  if (!profile?.is_pro && count >= 3) {
    return NextResponse.json({ error: "Limite atteinte: 3 factures / mois en gratuit" }, { status: 402 });
  }

  // Generate invoice number FAC-YYYY-XXX
  const year = new Date().getFullYear();
  const { count: yearCount } = await admin
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("invoice_date", `${year}-01-01`)
    .lte("invoice_date", `${year}-12-31`);
  const invoiceNumber = body?.invoiceNumber || `FAC-${year}-${pad((yearCount ?? 0) + 1)}`;

  const items = Array.isArray(body.items) ? body.items : [];
  const totalHT = items.reduce((s: number, it: any) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const totalVAT = items.reduce((s: number, it: any) => s + (Number(it.quantity) * Number(it.unitPrice) * Number(it.vatRate || 0)) / 100, 0);
  const totalTTC = totalHT + totalVAT;

  const { data: inv, error } = await admin
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: body.clientId ?? null,
      invoice_number: invoiceNumber,
      invoice_date: body.invoiceDate,
      due_date: body.dueDate,
      status: "draft",
      total_ht: totalHT,
      total_vat: totalVAT,
      total_ttc: totalTTC,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const itemsToInsert = items.map((it: any) => ({
    invoice_id: inv.id,
    description: it.description,
    enhanced_description: it.enhancedDescription ?? null,
    quantity: Number(it.quantity),
    unit_price: Number(it.unitPrice),
    vat_rate: Number(it.vatRate || 0),
    total: Number(it.quantity) * Number(it.unitPrice),
  }));

  const { error: itemsError } = await admin.from("invoice_items").insert(itemsToInsert);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ id: inv.id });
}
