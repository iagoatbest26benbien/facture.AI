import { NextResponse } from "next/server";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ profile: null });
  const admin = createAdminSupabaseClient();
  const { data } = await admin.from("profiles").select("company_name, email, address, phone, siret, vat_number").eq("id", user.id).single();
  return NextResponse.json({ profile: data ?? null });
}
