import { NextResponse } from "next/server";

export async function POST() {
  // Placeholder webhook to be configured in production
  return NextResponse.json({ ok: true });
}
