import { NextResponse } from "next/server";
export const runtime = "nodejs";
import { getUserFromAuthHeader } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { pdf } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/components/pdf/InvoiceTemplate";
import React from "react";

export async function POST(req: Request) {
  try {
    const user = await getUserFromAuthHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { invoiceId } = await req.json();
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    const admin = createAdminSupabaseClient();
    const { data: invoice, error } = await admin
      .from("invoices")
      .select("*, clients(name, email, address)")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: items } = await admin
      .from("invoice_items")
      .select("description, enhanced_description, quantity, unit_price, vat_rate")
      .eq("invoice_id", invoiceId);

    const data = {
      clientId: invoice.client_id,
      clientName: (invoice as any).clients?.name ?? "",
      clientEmail: (invoice as any).clients?.email ?? "",
      clientAddress: (invoice as any).clients?.address ?? "",
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      items: (items ?? []).map((it) => ({
        description: it.description,
        enhancedDescription: it.enhanced_description ?? undefined,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
        vatRate: Number(it.vat_rate) as 0 | 10 | 20,
      })),
      totalHT: Number(invoice.total_ht ?? 0),
      totalVAT: Number(invoice.total_vat ?? 0),
      totalTTC: Number(invoice.total_ttc ?? 0),
      legalMentions: "TVA non applicable, art. 293 B du CGI",
      paymentTerms: "Paiement à 30 jours",
      lateFees: "Pénalité 3x taux légal + 40€",
    };

    // Type cast to satisfy @react-pdf/renderer Document typing
    const file = await pdf(React.createElement(InvoiceTemplate as unknown as React.ComponentType<any>, { data: data as any }) as any).toBuffer();
    return new NextResponse(file as any, { headers: { "Content-Type": "application/pdf" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
