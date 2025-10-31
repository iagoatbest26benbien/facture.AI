"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ClientForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
      },
      body: JSON.stringify({ name, email, address }),
    });
    setLoading(false);
    if (!res.ok) {
      let data: any = {};
      try { data = await res.json(); } catch {}
      return toast.error(data?.error ?? `Erreur (${res.status})`);
    }
    toast.success("Client créé");
    setName(""); setEmail(""); setAddress("");
    onCreated?.();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label>Nom</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>Adresse</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <Button disabled={loading} className="w-full">{loading ? "Création..." : "Créer"}</Button>
    </form>
  );
}
