"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    // Create profile row
    const userId = data.user?.id;
    if (userId) {
      await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, company_name: companyName, email }) });
    }

    setLoading(false);
    toast.success("Vérifiez votre email pour confirmer votre compte.");
    router.push("/login");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Créer un compte</h1>
      <form onSubmit={handleRegister} className="mt-6 space-y-3">
        <div>
          <Label>Nom de l'entreprise</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button disabled={loading} className="w-full">{loading ? "Création..." : "Créer mon compte"}</Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">Déjà inscrit ? <a className="text-blue-600" href="/login">Se connecter</a></p>
    </div>
  );
}
