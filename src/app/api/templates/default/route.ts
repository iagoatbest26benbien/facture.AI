import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { buildDefaultTemplate } from "@/lib/template";

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("invoice_templates")
    .select("id, name, json, is_default")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .limit(1)
    .maybeSingle();
  if (existing) return NextResponse.json({ template: existing });

  const json = buildDefaultTemplate();
  const { data, error } = await admin
    .from("invoice_templates")
    .insert({ user_id: user.id, name: "Classique", json, is_default: true })
    .select("id, name, json, is_default")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}


