import { Anthropic } from "@anthropic-ai/sdk";

// Simple in-memory cache with TTL to save tokens
interface CacheEntry { value: string; expiresAt: number }
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const globalForCache = globalThis as unknown as { __aiCache?: Map<string, CacheEntry> };
const aiCache = globalForCache.__aiCache ?? (globalForCache.__aiCache = new Map<string, CacheEntry>());

export const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function enhanceDescription(description: string, profession?: string): Promise<string> {
  const key = `${description.trim()}__${profession?.trim() ?? ""}`;
  const now = Date.now();
  const hit = aiCache.get(key);
  if (hit && hit.expiresAt > now) return hit.value;

  const prompt = `Tu es un expert en rédaction de factures professionnelles.\n\nTransforme cette description courte en description détaillée et professionnelle pour une facture :\n"${description}"\n\nContexte : ${profession ?? "auto-entrepreneur"}\n\nRègles :\n- 2-3 phrases maximum\n- Vocabulaire professionnel\n- Mentionner la valeur ajoutée\n- Pas de prix ni de dates`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = (res.content?.[0] as any)?.text?.trim?.() ?? "";
    const value = text || description;
    aiCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch (err) {
    return description; // graceful fallback
  }
}
