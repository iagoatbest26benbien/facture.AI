import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Tarifs</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Gratuit</h3>
          <p className="text-slate-600 mt-1">3 factures offertes / mois</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-semibold">0€</span>
            <span className="text-slate-500">/mois</span>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "3 factures / mois",
              "Génération PDF",
              "Mentions légales automatiques",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {t}</li>
            ))}
          </ul>
          <Button asChild className="mt-6 w-full">
            <Link href="/register">Essayer gratuitement</Link>
          </Button>
        </Card>

        <Card className="p-6 border-blue-200">
          <h3 className="text-xl font-semibold">Pro</h3>
          <p className="text-slate-600 mt-1">Factures illimitées</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-semibold">19€</span>
            <span className="text-slate-500">/mois</span>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Factures illimitées",
              "IA avancée pour descriptions",
              "Dashboard et exports",
              "Support prioritaire",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {t}</li>
            ))}
          </ul>
          <Button asChild className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/register">Passer Pro</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
