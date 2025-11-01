import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

function isRequesterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS || "";
  const allowed = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(String(email).toLowerCase());
}

export async function POST(req: Request) {
  const requester = await getUserFromAuthHeader(req);
  if (!requester || !isRequesterAdmin(requester.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { userId, email, isPro } = await req.json().catch(() => ({}));
  if (!userId && !email) {
    return NextResponse.json({ error: "userId or email required" }, { status: 400 });
  }
  const admin = createAdminSupabaseClient();
  let targetId: string | null = null;
  if (userId) {
    targetId = String(userId);
  } else if (email) {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = data.users.find((u: any) => (u.email || "").toLowerCase() === String(email).toLowerCase());
    targetId = found?.id ?? null;
  }
  if (!targetId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { error } = await admin.from("profiles").update({ is_pro: Boolean(isPro) }).eq("id", targetId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


