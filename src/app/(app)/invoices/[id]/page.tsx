"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { DownloadPdfButton } from "./DownloadPdfButton";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [invoice, setInvoice] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!id) return;
      const res = await fetch(`/api/invoices/${id}`, { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      setInvoice(d.invoice ?? null); setItems(d.items ?? []);
    };
    load().catch(() => {});
  }, [id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{invoice?.invoice_number}</h1>
        {id ? <DownloadPdfButton invoiceId={id} /> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold">Client</h3>
          <div className="mt-2 text-sm text-slate-600">
            <div>{invoice?.client_name}</div>
            <div>{invoice?.client_email}</div>
            <div>{invoice?.client_address}</div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold">Résumé</h3>
          <div className="mt-2 text-sm text-slate-600">
            <div>Total HT: {(Number(invoice?.total_ht ?? 0)).toFixed(2)} €</div>
            <div>TVA: {(Number(invoice?.total_vat ?? 0)).toFixed(2)} €</div>
            <div className="font-medium">Total TTC: {(Number(invoice?.total_ttc ?? 0)).toFixed(2)} €</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold">Lignes</h3>
        <div className="mt-3 divide-y text-sm">
          {(items ?? []).map((it, idx) => (
            <div key={idx} className="py-3 grid grid-cols-6 gap-2">
              <div className="col-span-3">{it.enhanced_description || it.description}</div>
              <div>{it.quantity}</div>
              <div>{Number(it.unit_price).toFixed(2)} €</div>
              <div>{it.vat_rate}%</div>
              <div className="text-right">{(Number(it.unit_price) * Number(it.quantity)).toFixed(2)} €</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
