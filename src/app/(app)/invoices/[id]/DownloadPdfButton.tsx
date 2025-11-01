"use client";
import { Button } from "@/components/ui/button";

export function DownloadPdfButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  async function handle() {
    const { createBrowserSupabaseClient } = await import("@/lib/supabase-browser");
    const supabase = createBrowserSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" }, body: JSON.stringify({ invoiceId }) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeNumber = (invoiceNumber || "").replace(/\s+/g, " ").trim();
    a.href = url; a.download = `Facture ${safeNumber || invoiceId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }
  return <Button onClick={handle}>Télécharger le PDF</Button>;
}
