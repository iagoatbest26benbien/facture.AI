import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, json, name } = await req.json().catch(() => ({}));
  if (!json) return NextResponse.json({ error: "Missing json" }, { status: 400 });
  const admin = createAdminSupabaseClient();
  if (id) {
    const { error } = await admin.from("invoice_templates").update({ json, name: name ?? undefined, is_default: true }).eq("id", id).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id });
  } else {
    // unset existing defaults
    await admin.from("invoice_templates").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
    const { data, error } = await admin
      .from("invoice_templates")
      .insert({ user_id: user.id, name: name ?? "Personnalisé", json, is_default: true })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  }
}


