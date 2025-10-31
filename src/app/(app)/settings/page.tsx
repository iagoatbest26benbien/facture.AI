"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ company_name: "", email: "", address: "", phone: "", siret: "", vat_number: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/me", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      if (d.profile) {
        const p = d.profile as any;
        setValues((v) => ({
          ...v,
          company_name: p.company_name ?? "",
          email: p.email ?? "",
          address: p.address ?? "",
          phone: p.phone ?? "",
          siret: p.siret ?? "",
          vat_number: p.vat_number ?? "",
        }));
      }
    };
    load().catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/settings/profile", { method: "POST", headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" }, body: JSON.stringify(values) });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data.error ?? "Erreur");
    }
    toast.success("Enregistré");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">Abonnement</div>
          <div className="text-sm text-slate-600">Plan actuel: <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs">Gratuit</span></div>
        </div>
        <Button onClick={async () => {
          const supabase = createBrowserSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : '' } });
          let data: any = {};
          try { data = await res.json(); } catch {}
          if (res.ok && data.url) {
            window.location.href = data.url;
          } else {
            const msg = data?.error ?? 'Configurer STRIPE_PRICE_ID dans .env.local pour activer le checkout';
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('sonner').toast.error(msg);
          }
        }}>Passer Pro</Button>
      </div>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-lg p-4">
        <div>
          <Label>Nom de l'entreprise</Label>
          <Input value={values.company_name} onChange={(e) => setValues({ ...values, company_name: e.target.value })} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label>Adresse</Label>
          <Input value={values.address} onChange={(e) => setValues({ ...values, address: e.target.value })} />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        </div>
        <div>
          <Label>SIRET</Label>
          <Input value={values.siret} onChange={(e) => setValues({ ...values, siret: e.target.value })} />
        </div>
        <div>
          <Label>Numéro de TVA</Label>
          <Input value={values.vat_number} onChange={(e) => setValues({ ...values, vat_number: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={loading}>{loading ? "Sauvegarde..." : "Enregistrer"}</Button>
        </div>
      </form>
    </div>
  );
}
