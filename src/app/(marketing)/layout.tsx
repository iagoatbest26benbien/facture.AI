import type { ReactNode } from "react";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <header className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-xl">FacturIA</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing">Tarifs</Link>
            <Link href="/login" className="text-blue-600">Se connecter</Link>
            <Link href="/register" className="rounded-md bg-blue-600 text-white px-3 py-1.5">Commencer gratuitement</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-500">© {new Date().getFullYear()} FacturIA — Mentions légales</div>
      </footer>
    </div>
  );
}
