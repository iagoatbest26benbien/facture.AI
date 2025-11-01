"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import type { InvoiceFormValues, InvoiceTemplateJSON } from "@/types";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

const InvoicePreviewClient = dynamic<{ data: InvoiceFormValues; template?: InvoiceTemplateJSON }>(
  () => import("@/components/pdf/InvoicePreviewClient"),
  { ssr: false }
);

const sampleData: InvoiceFormValues = {
  issuerType: "profile",
  issuerName: "FacturIA",
  issuerEmail: "support@factureai.vercel.app",
  issuerAddress: "Paris, France",
  issuerSiret: "",
  clientType: "custom",
  clientId: undefined,
  clientName: "ACME",
  clientEmail: "contact@acme.com",
  clientAddress: "10 rue de Rivoli, 75001 Paris",
  clientSiret: "",
  invoiceNumber: "FAC-202511-001",
  invoiceDate: new Date().toISOString().slice(0,10),
  dueDate: new Date(Date.now()+1000*60*60*24*30).toISOString().slice(0,10),
  items: [{ description: "Création de site vitrine 3 pages", enhancedDescription: "", quantity: 1, unitPrice: 800, vatRate: 20 }],
  totalHT: 800,
  totalVAT: 160,
  totalTTC: 960,
  legalMentions: "TVA non applicable, art. 293 B du CGI",
  paymentTerms: "Paiement à 30 jours",
  lateFees: "Pénalité 3x taux légal + 40€",
};

export default function TemplateEditorPage() {
  const [tpl, setTpl] = useState<InvoiceTemplateJSON | null>(null);
  const [name, setName] = useState("Classique");
  const [raw, setRaw] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/templates/default", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      if (d?.template?.json) {
        setTpl(d.template.json);
        setName(d.template.name ?? "Classique");
        setRaw(JSON.stringify(d.template.json, null, 2));
      }
    })();
  }, []);

  const parsed = useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as InvoiceTemplateJSON) : null;
    } catch {
      return null;
    }
  }, [raw]);

  async function save() {
    if (!parsed) return toast.error("JSON invalide");
    setSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/templates/save", { method: "POST", headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" }, body: JSON.stringify({ json: parsed, name }) });
      const d = await res.json().catch(() => ({}));
      setSaving(false);
      if (!res.ok) return toast.error(d?.error ?? `Erreur (${res.status})`);
      toast.success("Template enregistré");
    } catch (e: any) {
      setSaving(false);
      toast.error(e?.message ?? "Erreur");
    }
  }

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>JSON du template</Label>
          <textarea className="w-full border rounded-md p-2 min-h-[500px] font-mono text-xs" value={raw} onChange={(e) => setRaw(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={!parsed || saving} onClick={save}>{saving ? "Enregistrement..." : "Enregistrer comme défaut"}</Button>
          </div>
        </div>
      </Card>
      <Card className="p-2 h-[85dvh]">
        <div className="text-sm text-slate-600 px-2 py-1">Aperçu</div>
        <div className="h-[80dvh]">
          <InvoicePreviewClient data={sampleData} template={parsed || tpl || undefined} />
        </div>
      </Card>
    </div>
  );
}


