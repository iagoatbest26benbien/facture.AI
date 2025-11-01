"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { withSiteUrl } from "@/lib/url";

export default function ForgotPage() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: withSiteUrl("/login") });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Email envoyé si l'adresse existe.");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Mot de passe oublié</h1>
      <form onSubmit={handleReset} className="mt-6 space-y-3">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button disabled={loading} className="w-full">{loading ? "Envoi..." : "Envoyer l'email de réinitialisation"}</Button>
      </form>
    </div>
  );
}
