"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { withSiteUrl } from "@/lib/url";

function LoginContent() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    router.push(redirect);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: withSiteUrl("/login") } });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Magic link envoyé. Consultez votre boîte mail.");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Se connecter</h1>
      <Tabs defaultValue="password" className="mt-6">
        <TabsList>
          <TabsTrigger value="password">Email & mot de passe</TabsTrigger>
          <TabsTrigger value="magic">Magic link</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <form onSubmit={handlePasswordLogin} className="mt-4 space-y-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button disabled={loading} className="w-full">{loading ? "Connexion..." : "Se connecter"}</Button>
          </form>
          <div className="mt-3 text-sm">
            <a href="/forgot" className="text-blue-600">Mot de passe oublié ?</a>
          </div>
        </TabsContent>
        <TabsContent value="magic">
          <form onSubmit={handleMagicLink} className="mt-4 space-y-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button disabled={loading} className="w-full">{loading ? "Envoi..." : "Envoyer le lien magique"}</Button>
          </form>
        </TabsContent>
      </Tabs>
      <p className="mt-4 text-sm text-slate-600">Pas de compte ? <a className="text-blue-600" href="/register">Inscrivez-vous</a></p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
