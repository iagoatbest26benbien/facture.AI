"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/invoices", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      setInvoices(d.invoices ?? []);
    };
    load().catch(() => setInvoices([]));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes factures</h1>
        <Button asChild><Link href="/invoices/new">Nouvelle facture</Link></Button>
      </div>

      <div className="bg-white border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Montant TTC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell><Link className="text-blue-600" href={`/invoices/${inv.id}`}>{inv.invoice_number}</Link></TableCell>
                <TableCell>{inv.client_name}</TableCell>
                <TableCell><span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs capitalize">{inv.status}</span></TableCell>
                <TableCell className="text-right">{inv.total_ttc.toFixed(2)} €</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
