import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { generateInvoiceDraftFromPrompt } from "@/lib/openai";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    // Check Pro status
    const { data: profile } = await admin.from("profiles").select("is_pro").eq("id", user.id).single();
    const isPro = Boolean(profile?.is_pro);

    // Enforce monthly limit for non-Pro: 3 AI drafts per month
    if (!isPro) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
      const { count: used } = await admin
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("kind", "invoice_draft")
        .gte("created_at", startOfMonth.toISOString());
      if ((used ?? 0) >= 3) {
        return NextResponse.json({ error: "Limite IA atteinte: 3 brief IA / mois en gratuit" }, { status: 402 });
      }
    }

    const draft = await generateInvoiceDraftFromPrompt(prompt);

    // Record usage
    await admin.from("ai_usage").insert({ user_id: user.id, kind: "invoice_draft" });

    return NextResponse.json({ draft, isPro });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "AI error" }, { status: 500 });
  }
}


