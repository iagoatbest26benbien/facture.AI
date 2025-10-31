import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getUserFromAuthHeader } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("clients")
    .select("id, name, email, address")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const admin = createAdminSupabaseClient();
  // Ensure profile exists for foreign key (clients.user_id -> profiles.id)
  const { data: prof, error: profErr } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
  if (!prof) {
    const fallbackName = user.email ?? "Mon entreprise";
    const { error: createProfErr } = await admin.from("profiles").insert({ id: user.id, company_name: fallbackName, email: user.email ?? null });
    if (createProfErr) return NextResponse.json({ error: createProfErr.message }, { status: 500 });
  }
  const { error } = await admin.from("clients").insert({
    user_id: user.id,
    name: body.name,
    email: body.email ?? null,
    address: body.address ?? null,
    phone: body.phone ?? null,
    siret: body.siret ?? null,
    notes: body.notes ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
