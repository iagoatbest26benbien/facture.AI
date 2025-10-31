import { NextRequest, NextResponse } from "next/server";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
export const runtime = "nodejs";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const { data: invoice, error } = await admin
    .from("invoices")
    .select("*, clients(name,email,address)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: items } = await admin
    .from("invoice_items")
    .select("description, enhanced_description, quantity, unit_price, vat_rate")
    .eq("invoice_id", id);

  const payload = {
    invoice: invoice && {
      ...invoice,
      client_name: (invoice as any).clients?.name ?? null,
      client_email: (invoice as any).clients?.email ?? null,
      client_address: (invoice as any).clients?.address ?? null,
    },
    items: items ?? [],
  };

  return NextResponse.json(payload);
}


