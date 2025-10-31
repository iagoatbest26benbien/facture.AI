import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { getUserFromAuthHeader } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID non configuré" }, { status: 500 });
  }

  const user = await getUserFromAuthHeader(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
      customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? origin}/settings?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? origin}/pricing`,
  });
  return NextResponse.json({ url: session.url });
  } catch (e: any) {
    const message = e?.message || e?.error?.message || "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
