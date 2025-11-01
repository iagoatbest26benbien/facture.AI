"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { InvoiceTemplateJSON, TemplateElement, TemplateTextElement, TemplateRectElement } from "@/types";
import { buildDefaultTemplate } from "@/lib/template";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import dynamic from "next/dynamic";
import type { InvoiceFormValues } from "@/types";
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

type Draggable = TemplateElement & { width?: number; height?: number };

export default function StudioPage() {
  const [tpl, setTpl] = useState<InvoiceTemplateJSON>(buildDefaultTemplate());
  const [name, setName] = useState("Personnalisé");
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Load default template
  useEffect(() => {
    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch("/api/templates/default", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
        const d = await res.json();
        if (d?.template?.json) { setTpl(d.template.json); setName(d.template.name ?? name); }
      } catch {}
    })();
  }, []);

  // Autoscale page to fit right column
  useEffect(() => {
    function onResize() {
      const w = 595, h = 842; // A4 points
      const el = pageRef.current?.parentElement;
      if (!el) return;
      const pad = 24;
      const sx = (el.clientWidth - pad) / w;
      const sy = (el.clientHeight - pad) / h;
      setScale(Math.min(sx, sy, 1));
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const elements = tpl.elements as Draggable[];
  const updateElement = useCallback((id: string, patch: Partial<Draggable>) => {
    setTpl((t) => ({ ...t, elements: t.elements.map((e) => (e.id === id ? { ...e, ...patch } as any : e)) }));
  }, []);

  const addText = () => {
    const id = `text_${Date.now()}`;
    const el: TemplateTextElement = { id, type: "text", x: 40, y: 160, value: "Nouveau texte", fontSize: 12 };
    setTpl((t) => ({ ...t, elements: [...t.elements, el] }));
    setSelectedId(id);
  };
  const addRect = () => {
    const id = `rect_${Date.now()}`;
    const el: TemplateRectElement = { id, type: "rect", x: 32, y: 140, width: 200, height: 60, fill: "#f1f5f9" };
    setTpl((t) => ({ ...t, elements: [...t.elements, el] }));
    setSelectedId(id);
  };

  async function save() {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/templates/save", { method: "POST", headers: { "Content-Type": "application/json", Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" }, body: JSON.stringify({ json: tpl, name }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d?.error ?? `Erreur (${res.status})`);
      toast.success("Template enregistré");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur");
    }
  }

  function startDrag(e: React.MouseEvent, el: Draggable) {
    e.stopPropagation();
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { dx: e.clientX - box.left, dy: e.clientY - box.top };
    setSelectedId(el.id);
    setIsDragging(true);
  }
  function onMove(e: React.MouseEvent) {
    if (!isDragging || !selectedId) return;
    const parent = pageRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const el = elements.find((x) => x.id === selectedId);
    if (!el) return;
    const x = (e.clientX - rect.left - dragOffset.current.dx) / scale;
    const y = (e.clientY - rect.top - dragOffset.current.dy) / scale;
    updateElement(selectedId, { x: Math.max(0, x), y: Math.max(0, y) });
  }
  function stopDrag() { setIsDragging(false); }

  const pageStyle: React.CSSProperties = {
    width: 595, height: 842, transform: `scale(${scale})`, transformOrigin: "top left",
    background: "#fff", position: "relative", boxShadow: "0 0 0 1px #e2e8f0 inset"
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 select-none">
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Nom du template</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={addText}>Ajouter un texte</Button>
          <Button variant="secondary" onClick={addRect}>Ajouter un bloc</Button>
          <Button onClick={save}>Enregistrer</Button>
        </div>
        {selectedId ? (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const el = elements.find((x) => x.id === selectedId);
              if (!el) return null;
              return (
                <>
                  <div>
                    <Label>X</Label>
                    <Input type="number" value={Math.round((el as any).x || 0)} onChange={(e) => updateElement(el.id, { x: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input type="number" value={Math.round((el as any).y || 0)} onChange={(e) => updateElement(el.id, { y: Number(e.target.value) })} />
                  </div>
                  {el.type === "text" ? (
                    <div className="md:col-span-2">
                      <Label>Texte</Label>
                      <Input value={(el as TemplateTextElement).value} onChange={(e) => updateElement(el.id, { value: e.target.value } as any)} />
                    </div>
                  ) : null}
                  {el.type === "rect" ? (
                    <>
                      <div>
                        <Label>Largeur</Label>
                        <Input type="number" value={(el as any).width || 0} onChange={(e) => updateElement(el.id, { width: Number(e.target.value) })} />
                      </div>
                      <div>
                        <Label>Hauteur</Label>
                        <Input type="number" value={(el as any).height || 0} onChange={(e) => updateElement(el.id, { height: Number(e.target.value) })} />
                      </div>
                    </>
                  ) : null}
                </>
              );
            })()}
          </div>
        ) : null}
      </Card>

      <Card className="p-4 h-[85dvh] overflow-auto" onMouseMove={onMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
        <div ref={pageRef} style={pageStyle} onMouseDown={() => setSelectedId(null)}>
          {elements.map((el) => {
            const common: React.CSSProperties = { position: "absolute", left: el.x, top: el.y, cursor: "move", outline: el.id === selectedId ? "1px solid #3b82f6" : undefined, padding: 2 };
            if (el.type === "text") {
              const t = el as TemplateTextElement;
              return (
                <div key={el.id} style={common} onMouseDown={(e) => startDrag(e, el as any)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                  <div style={{ fontSize: t.fontSize ?? 12, color: t.color ?? "#000" }}>{t.value}</div>
                </div>
              );
            }
            if (el.type === "rect") {
              const r = el as TemplateRectElement;
              return (
                <div key={el.id} style={{ ...common, width: r.width || 120, height: r.height || 60, background: r.fill ?? "#e2e8f0", border: r.stroke ? `1px solid ${r.stroke}` : undefined }} onMouseDown={(e) => startDrag(e, el as any)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }} />
              );
            }
            // For unsupported (image/table) show placeholder box
            return (
              <div key={el.id} style={{ ...common, width: (el as any).width || 160, height: (el as any).height || 40, background: "#f8fafc", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }} onMouseDown={(e) => startDrag(e, el as any)}>
                {el.type.toUpperCase()} (placeholder)
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}


