"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { InvoiceTemplateJSON } from "@/types";
const InvoicePreviewClient = dynamic<{ data: InvoiceFormValues; template?: InvoiceTemplateJSON }>(
  () => import("@/components/pdf/InvoicePreviewClient"),
  { ssr: false }
);
import type { InvoiceFormValues } from "@/types";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const defaultItem = { description: "", enhancedDescription: "", quantity: 1, unitPrice: 0, vatRate: 0 as 0 | 10 | 20 };

export default function InvoiceForm() {
  const router = useRouter();
  const [clients, setClients] = useState<{ id: string; name: string; email?: string; address?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [templateJson, setTemplateJson] = useState<any | undefined>(undefined);
  const [values, setValues] = useState<InvoiceFormValues>({
    issuerType: "profile",
    issuerName: "",
    issuerEmail: "",
    issuerAddress: "",
    issuerSiret: "",
    clientType: "select",
    clientId: undefined,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientSiret: "",
    invoiceNumber: (() => {
      const now = new Date();
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      return `FAC-${yyyymm}-001`;
    })(),
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    items: [defaultItem],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    legalMentions: "TVA non applicable, art. 293 B du CGI",
    paymentTerms: "Paiement à 30 jours",
    lateFees: "Pénalité 3x taux légal + 40€",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      // Load clients + me + template
      const [clientsRes, meRes, tplRes] = await Promise.all([
        fetch("/api/clients", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } }),
        fetch("/api/me", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } }),
        fetch("/api/templates/default", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } }),
      ]);
      const clientsData = await clientsRes.json().catch(() => ({}));
      setClients(clientsData.clients ?? []);
      // Prefill issuer from profile
      const meData = await meRes.json().catch(() => ({}));
      if (meData?.profile) {
        setValues((v) => ({
          ...v,
          issuerName: meData.profile.company_name ?? "",
          issuerEmail: meData.profile.email ?? "",
          issuerAddress: meData.profile.address ?? "",
          issuerSiret: meData.profile.siret ?? "",
        }));
      }
      const tplData = await tplRes.json().catch(() => ({}));
      if (tplData?.template) {
        setTemplateJson(tplData.template.json);
        setValues((v) => ({ ...v, templateId: tplData.template.id }));
      }
    };
    load().catch(() => setClients([]));
  }, []);

  const totals = useMemo(() => {
    const totalHT = values.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const totalVAT = values.items.reduce((sum, it) => sum + (it.quantity * it.unitPrice * it.vatRate) / 100, 0);
    const totalTTC = totalHT + totalVAT;
    return { totalHT, totalVAT, totalTTC };
  }, [values.items]);

  useEffect(() => {
    setValues((v) => ({ ...v, ...totals }));
  }, [totals.totalHT, totals.totalVAT, totals.totalTTC]);

  async function enhance(idx: number) {
    const item = values.items[idx];
    if (!item.description) return toast.error("Ajoutez une description d'abord");
    const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: item.description, profession: "auto-entrepreneur" }) });
    let data: any = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) return toast.error(data?.error ?? `Erreur IA (${res.status})`);
    const enhanced = String(data.text ?? "");
    setValues((v) => ({
      ...v,
      items: v.items.map((it, i) => (i === idx ? { ...it, description: enhanced, enhancedDescription: enhanced } : it)),
    }));
  }

  function updateItem(idx: number, patch: Partial<typeof defaultItem>) {
    setValues((v) => ({ ...v, items: v.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  }

  function addItem() {
    setValues((v) => ({ ...v, items: [...v.items, { ...defaultItem }] }));
  }

  function removeItem(idx: number) {
    setValues((v) => ({ ...v, items: v.items.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" },
      body: JSON.stringify(values),
    });
    let data: any = {};
    try { data = await res.json(); } catch {}
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Erreur lors de la création");
    toast.success("Facture créée");
    router.push(`/invoices/${data.id}`);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Émetteur</Label>
              <Tabs defaultValue={values.issuerType} onValueChange={(v) => setValues({ ...values, issuerType: v as any })} className="mt-1">
                <TabsList>
                  <TabsTrigger value="profile">Mon entreprise</TabsTrigger>
                  <TabsTrigger value="custom">Personnalisé</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nom</Label>
                      <Input value={values.issuerName} onChange={(e) => setValues({ ...values, issuerName: e.target.value })} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={values.issuerEmail} onChange={(e) => setValues({ ...values, issuerEmail: e.target.value })} disabled />
                    </div>
                    <div>
                      <Label>SIRET</Label>
                      <Input value={values.issuerSiret ?? ""} onChange={(e) => setValues({ ...values, issuerSiret: e.target.value })} disabled />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Adresse</Label>
                      <Input value={values.issuerAddress} onChange={(e) => setValues({ ...values, issuerAddress: e.target.value })} disabled />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nom</Label>
                      <Input value={values.issuerName} onChange={(e) => setValues({ ...values, issuerName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={values.issuerEmail} onChange={(e) => setValues({ ...values, issuerEmail: e.target.value })} />
                    </div>
                    <div>
                      <Label>SIRET</Label>
                      <Input value={values.issuerSiret ?? ""} onChange={(e) => setValues({ ...values, issuerSiret: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Adresse</Label>
                      <Input value={values.issuerAddress} onChange={(e) => setValues({ ...values, issuerAddress: e.target.value })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="md:col-span-2">
              <Label>Client</Label>
              <Tabs defaultValue={values.clientType} onValueChange={(v) => setValues({ ...values, clientType: v as any })} className="mt-1">
                <TabsList>
                  <TabsTrigger value="select">Mes clients</TabsTrigger>
                  <TabsTrigger value="custom">Personnalisé</TabsTrigger>
                </TabsList>
                <TabsContent value="select" className="mt-3">
                  <Select onValueChange={(v) => {
                    const c = clients.find((x) => x.id === v);
                    setValues((val) => ({ ...val, clientId: v, clientName: c?.name ?? "", clientEmail: c?.email ?? "", clientAddress: c?.address ?? "" }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="custom" className="mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nom</Label>
                      <Input value={values.clientName} onChange={(e) => setValues({ ...values, clientName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={values.clientEmail} onChange={(e) => setValues({ ...values, clientEmail: e.target.value })} />
                    </div>
                    <div>
                      <Label>SIRET</Label>
                      <Input value={values.clientSiret ?? ""} onChange={(e) => setValues({ ...values, clientSiret: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Adresse</Label>
                      <Input value={values.clientAddress} onChange={(e) => setValues({ ...values, clientAddress: e.target.value })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <Label>Numéro de facture</Label>
              <Input value={values.invoiceNumber} onChange={(e) => setValues({ ...values, invoiceNumber: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={values.invoiceDate} onChange={(e) => setValues({ ...values, invoiceDate: e.target.value })} />
            </div>
            <div>
              <Label>Échéance</Label>
              <Input type="date" value={values.dueDate} onChange={(e) => setValues({ ...values, dueDate: e.target.value })} />
            </div>
          </div>
          {null}
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Lignes</h3>
            <Button type="button" onClick={addItem}>Ajouter une ligne</Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brief IA</Label>
              <textarea className="w-full border rounded-md p-2 min-h-[96px]" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ex: Faire une facture pour mon client ACME pour création de site vitrine 3 pages, 2 jours à 350€ / jour, TVA 20%, échéance 30 jours..." />
              <div>
                <Button type="button" disabled={aiLoading || !aiPrompt.trim()} onClick={async () => {
                  try {
                    setAiLoading(true);
                    const supabase = createBrowserSupabaseClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch("/api/ai/invoice-draft", { method: "POST", headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" }, body: JSON.stringify({ prompt: aiPrompt }) });
                    setAiLoading(false);
                    if (!res.ok) {
                      let d: any = {}; try { d = await res.json(); } catch {}
                      return toast.error(d?.error ?? `Erreur IA (${res.status})`);
                    }
                    const { draft } = await res.json();
                    const items = Array.isArray(draft?.items) && draft.items.length > 0 ? draft.items.map((it: any) => ({
                      description: String(it.description || ""),
                      enhancedDescription: String(it.description || ""),
                      quantity: Math.max(1, Number(it.quantity || 1)),
                      unitPrice: Math.max(0, Number(it.unitPrice || 0)),
                      vatRate: (Number(it.vatRate || 0) as 0 | 10 | 20),
                    })) : values.items;
                    const maybeClientName = draft?.client?.name ? String(draft.client.name) : "";
                    const found = clients.find((c) => c.name.toLowerCase() === maybeClientName.toLowerCase());
                    setValues((v) => ({
                      ...v,
                      clientType: found ? "select" : "custom",
                      clientId: found ? found.id : undefined,
                      clientName: found ? found.name : (draft?.client?.name ?? v.clientName),
                      clientEmail: found ? (found.email ?? "") : (draft?.client?.email ?? v.clientEmail),
                      clientAddress: found ? (found.address ?? "") : (draft?.client?.address ?? v.clientAddress),
                      invoiceDate: draft?.invoiceDate ? String(draft.invoiceDate).slice(0,10) : v.invoiceDate,
                      dueDate: draft?.dueDate ? String(draft.dueDate).slice(0,10) : v.dueDate,
                      paymentTerms: draft?.paymentTerms ?? v.paymentTerms,
                      legalMentions: draft?.legalMentions ?? v.legalMentions,
                      items,
                    }));
                    toast.success("Formulaire pré-rempli par l'IA");
                  } catch (e: any) {
                    setAiLoading(false);
                    toast.error(e?.message ?? "Erreur IA");
                  }
                }}>{aiLoading ? "Génération..." : "Pré-remplir avec l'IA"}</Button>
              </div>
            </div>
            {values.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-3">
                  <Label>Description</Label>
                  <Input value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Ex: Création de site web" />
                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => enhance(idx)}>Améliorer avec l'IA</Button>
                    {it.enhancedDescription ? <span className="text-xs text-green-600">OK</span> : null}
                  </div>
                </div>
                <div>
                  <Label>Qté</Label>
                  <Input type="number" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>PU (€)</Label>
                  <Input type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>TVA</Label>
                  <Select value={String(it.vatRate)} onValueChange={(v) => updateItem(idx, { vatRate: Number(v) as 0 | 10 | 20 })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right font-medium md:col-span-1">{(it.quantity * it.unitPrice).toFixed(2)} €</div>
                <div className="md:col-span-6">
                  {values.items.length > 1 && (
                    <Button type="button" variant="secondary" onClick={() => removeItem(idx)}>Supprimer</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Mentions légales</Label>
            <Input value={values.legalMentions} onChange={(e) => setValues({ ...values, legalMentions: e.target.value })} />
          </div>
          <div>
            <Label>Conditions de paiement</Label>
            <Input value={values.paymentTerms} onChange={(e) => setValues({ ...values, paymentTerms: e.target.value })} />
          </div>
          <div>
            <Label>Frais de retard</Label>
            <Input value={values.lateFees} onChange={(e) => setValues({ ...values, lateFees: e.target.value })} />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <div className="text-sm text-slate-600">
            <div>Total HT: <span className="font-medium">{values.totalHT.toFixed(2)} €</span></div>
            <div>TVA: <span className="font-medium">{values.totalVAT.toFixed(2)} €</span></div>
            <div>Total TTC: <span className="font-semibold">{values.totalTTC.toFixed(2)} €</span></div>
          </div>
          <Button disabled={loading}>{loading ? "Création..." : "Créer la facture"}</Button>
        </div>
      </form>

      <Card className="p-2 h-[80dvh]">
        <Tabs defaultValue="preview">
          <div className="flex items-center justify-between px-2 pb-2">
            <TabsList>
              <TabsTrigger value="preview">Aperçu PDF</TabsTrigger>
            </TabsList>
            <a href="/templates/studio" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Personnaliser le template</a>
          </div>
          <TabsContent value="preview" className="h-[75dvh]">
            <InvoicePreviewClient data={values} template={templateJson} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
