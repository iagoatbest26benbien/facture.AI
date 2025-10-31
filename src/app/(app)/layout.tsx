import type { ReactNode } from "react";
import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Factures" },
  { href: "/clients", label: "Clients" },
  { href: "/settings", label: "Paramètres" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-[280px_1fr] bg-slate-50">
      <aside className="border-r bg-white">
        <div className="h-16 flex items-center px-4 text-lg font-semibold">FacturIA</div>
        <nav className="px-2 py-2 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 hover:bg-slate-100">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  );
}
