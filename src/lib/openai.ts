import { Anthropic } from "@anthropic-ai/sdk";

// Simple in-memory cache with TTL to save tokens
interface CacheEntry { value: string; expiresAt: number }
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const globalForCache = globalThis as unknown as { __aiCache?: Map<string, CacheEntry> };
const aiCache = globalForCache.__aiCache ?? (globalForCache.__aiCache = new Map<string, CacheEntry>());

export const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// Model priority with optional env override (CLAUDE_MODEL can be comma-separated)
function getClaudeModels(): string[] {
  const override = process.env.CLAUDE_MODEL?.trim();
  if (override) {
    const list = override.split(",").map((m) => m.trim()).filter(Boolean);
    if (list.length) return list;
  }
  return [
    "claude-3-5-sonnet-latest",
    "claude-3-5-haiku-latest",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
    "claude-3-opus-20240229",
  ];
}

async function callClaudeWithFallback(params: { system?: string; user: string }, opts?: { maxTokens?: number; temperature?: number }): Promise<string> {
  const models = getClaudeModels();
  let lastErr: any = null;
  for (const model of models) {
    try {
      const res = await anthropic.messages.create({
        model,
        system: params.system,
        max_tokens: opts?.maxTokens ?? 400,
        temperature: opts?.temperature ?? 0.2,
        messages: [{ role: "user", content: params.user }],
      });
      const text = (res as any)?.content?.[0]?.text;
      if (typeof text === "string" && text.trim()) return text.trim();
    } catch (e: any) {
      lastErr = e;
      const code = e?.status ?? e?.code;
      const msg: string = e?.message ?? "";
      // If model not found/accessible, try next
      if (code === 404 || /not.?found/i.test(msg) || (/model/i.test(msg) && /not/i.test(msg))) continue;
      break;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error("Claude empty response");
}

export async function enhanceDescription(description: string, profession?: string): Promise<string> {
  const key = `${description.trim()}__${profession?.trim() ?? ""}`;
  const now = Date.now();
  const hit = aiCache.get(key);
  if (hit && hit.expiresAt > now) return hit.value;

  const prompt = `Tu es un expert en rédaction de factures professionnelles.\n\nTransforme cette description courte en description détaillée et professionnelle pour une facture :\n"${description}"\n\nContexte : ${profession ?? "auto-entrepreneur"}\n\nRègles :\n- 2-3 phrases maximum\n- Vocabulaire professionnel\n- Mentionner la valeur ajoutée\n- Pas de prix ni de dates`;

  try {
    const text = await callClaudeWithFallback({ user: prompt }, { maxTokens: 200, temperature: 0.3 });
    const value = text || description;
    aiCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch (err) {
    return description; // graceful fallback
  }
}

export interface InvoiceDraft {
  client?: { name?: string; email?: string; address?: string };
  items?: Array<{ description: string; quantity: number; unitPrice: number; vatRate?: number }>;
  invoiceDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  legalMentions?: string;
}

export async function generateInvoiceDraftFromPrompt(prompt: string): Promise<InvoiceDraft> {
  const system = `Tu es un assistant expert en facturation française pour auto-entrepreneurs.
Retourne UNIQUEMENT du JSON valide sans texte autour. Schéma strict:
{
  "client": { "name": string, "email"?: string, "address"?: string },
  "items": [ { "description": string, "quantity": number, "unitPrice": number, "vatRate"?: number } ],
  "invoiceDate"?: string, // ISO (YYYY-MM-DD) si possible
  "dueDate"?: string, // ISO (YYYY-MM-DD) si possible
  "paymentTerms"?: string,
  "legalMentions"?: string
}
Règles:
- quantity >= 1, unitPrice >= 0
- vatRate ∈ {0,10,20} (arrondis si besoin)
- Si date absente, laisse vide
- Déduis les items avec des descriptions claires et professionnelles en français.`;
  const text = await callClaudeWithFallback({ system, user: `Brief utilisateur:\n${prompt}` }, { maxTokens: 800, temperature: 0.2 }).catch(() => "{}");
  try {
    const raw = JSON.parse(text);
    const sanitizeNumber = (n: any): number => {
      const v = Number(String(n).replace(",", "."));
      return Number.isFinite(v) ? v : 0;
    };
    const normVat = (n: any): number => {
      const v = Math.round(sanitizeNumber(n));
      if (v <= 0) return 0; if (v < 15) return 10; return 20;
    };

    const draft: InvoiceDraft = {
      client: raw?.client ? {
        name: String(raw.client.name || "").trim() || undefined,
        email: raw.client.email ? String(raw.client.email) : undefined,
        address: raw.client.address ? String(raw.client.address) : undefined,
      } : undefined,
      items: Array.isArray(raw?.items) ? raw.items.map((it: any) => ({
        description: String(it?.description || "").slice(0, 500),
        quantity: Math.max(1, Math.round(sanitizeNumber(it?.quantity))),
        unitPrice: Math.max(0, Number(sanitizeNumber(it?.unitPrice).toFixed(2))),
        vatRate: normVat(it?.vatRate ?? 0),
      })) : undefined,
      invoiceDate: raw?.invoiceDate ? String(raw.invoiceDate).slice(0, 10) : undefined,
      dueDate: raw?.dueDate ? String(raw.dueDate).slice(0, 10) : undefined,
      paymentTerms: raw?.paymentTerms ? String(raw.paymentTerms) : undefined,
      legalMentions: raw?.legalMentions ? String(raw.legalMentions) : undefined,
    };
    return draft;
  } catch {
    return {};
  }
}
