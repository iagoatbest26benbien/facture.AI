import Link from "next/link";
import { Card } from "@/components/ui/card";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  status: string;
  total_ttc: number;
  client_name: string | null;
}

export function RecentInvoices({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Dernières factures</h3>
        <Link href="/invoices" className="text-sm text-blue-600">Voir toutes</Link>
      </div>
      <div className="mt-4 divide-y">
        {invoices.length === 0 && <div className="text-sm text-slate-500">Aucune facture pour le moment.</div>}
        {invoices.map((inv) => (
          <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between py-3 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{inv.invoice_number}</span>
              <span className="text-slate-500">{inv.client_name ?? "—"}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs capitalize">{inv.status}</span>
              <span className="font-medium">{inv.total_ttc.toFixed(2)} €</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
