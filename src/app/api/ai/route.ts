import { NextResponse } from "next/server";
import { enhanceDescription } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description, profession } = await req.json();
    if (!description) return NextResponse.json({ error: "Missing description" }, { status: 400 });
    const text = await enhanceDescription(String(description), String(profession || "auto-entrepreneur"));
    return NextResponse.json({ text });
  } catch (e: any) {
    const msg = process.env.CLAUDE_API_KEY ? (e?.message ?? "IA error") : "Configurer CLAUDE_API_KEY dans .env.local";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
