import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getUserFromAuthHeader } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("profiles").upsert({
    id: user.id,
    company_name: body.company_name,
    address: body.address ?? null,
    phone: body.phone ?? null,
    siret: body.siret ?? null,
    vat_number: body.vat_number ?? null,
    email: body.email ?? user.email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
