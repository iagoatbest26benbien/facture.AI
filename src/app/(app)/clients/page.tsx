"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import ClientForm from "@/components/forms/ClientForm";
import { Card } from "@/components/ui/card";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/clients", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      setClients(d.clients ?? []);
    };
    load().catch(() => setClients([]));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 md:col-span-2">
          <h3 className="font-semibold">Liste</h3>
          <div className="mt-3 divide-y text-sm">
            {clients.map((c) => (
              <div key={c.id} className="py-3 grid grid-cols-3 gap-2">
                <div className="font-medium">{c.name}</div>
                <div>{c.email ?? "—"}</div>
                <div>{c.address ?? "—"}</div>
              </div>
            ))}
            {clients.length === 0 && <div className="text-slate-500">Aucun client</div>}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Nouveau client</h3>
          <div className="mt-3">
            <ClientForm onCreated={async () => {
              const supabase = createBrowserSupabaseClient();
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch("/api/clients", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
              const d = await res.json().catch(() => ({}));
              setClients(d.clients ?? []);
            }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
