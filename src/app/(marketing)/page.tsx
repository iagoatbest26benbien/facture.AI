"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, FileSpreadsheet, BarChart3, Shield, CheckCircle2, Zap, Smartphone, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, text: "✨ Descriptions professionnelles par IA" },
  { icon: FileText, text: "⚡ Génération PDF en 1 clic" },
  { icon: BarChart3, text: "📊 Dashboard temps réel" },
  { icon: Shield, text: "🔒 100% conforme légalement" },
  { icon: FileSpreadsheet, text: "💰 Suivi des paiements" },
  { icon: Smartphone, text: "📱 Accessible partout" },
];

const steps = [
  { title: "Décrivez", text: "Laissez l'IA enrichir vos prestations en quelques secondes." },
  { title: "Vérifiez", text: "Calcule automatiquement les totaux et ajoute les mentions légales." },
  { title: "Générez", text: "Téléchargez un PDF pro et envoyez-le à votre client." },
];

const testimonials = [
  { name: "Sofia — Designer", text: "Je gagne 10 minutes par facture, c'est un no-brainer." },
  { name: "Mehdi — Développeur", text: "Les descriptions font pro et j'ai zéro erreur de calcul." },
  { name: "Camille — Consultante", text: "J'adore l'aperçu PDF en direct. Ultra rassurant." },
];

export default function Page() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-semibold tracking-tight"
          >
            Facturez en 30 secondes, pas 30 minutes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-slate-600 max-w-2xl"
          >
            L'IA rédige, calcule et génère vos factures professionnelles instantanément.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex items-center gap-3"
          >
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">Voir les tarifs</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {features.map((f) => (
              <Card key={f.text} className="p-4 flex items-center gap-3">
                <f.icon className="h-5 w-5 text-blue-600" />
                <span>{f.text}</span>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Comment ça marche</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <Card key={s.title} className="p-5">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-semibold">{i + 1}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-600 text-sm">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Tarifs</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs text-blue-700 border-blue-200">Populaire <Zap className="h-3 w-3" /></div>
              <h3 className="mt-3 text-xl font-semibold">Pro</h3>
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
      </section>

      <section className="bg-slate-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Ils adorent</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-5">
                <p className="text-slate-700">“{t.text}”</p>
                <div className="mt-4 text-sm text-slate-500">{t.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
