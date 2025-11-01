import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { generateInvoiceDraftFromPrompt } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const draft = await generateInvoiceDraftFromPrompt(prompt);
    return NextResponse.json({ draft });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "AI error" }, { status: 500 });
  }
}


