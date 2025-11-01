import type { InvoiceFormValues, InvoiceTemplateJSON, TemplateElement, TemplateTextElement, TemplateTableElement } from "@/types";

export function evaluateBinding(text: string, data: any): string {
  return text.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    try {
      const path = String(expr).split(".").map((s) => s.trim());
      let cur: any = data;
      for (const p of path) {
        if (cur == null) return "";
        if (p === "total") {
          // convenience alias for item total
          return String(((cur as any).quantity || 0) * ((cur as any).unitPrice || 0));
        }
        cur = cur[p];
      }
      return cur == null ? "" : String(cur);
    } catch {
      return "";
    }
  });
}

export function buildDefaultTemplate(): InvoiceTemplateJSON {
  return {
    version: 1,
    page: { width: 595, height: 842, padding: 32 },
    elements: [
      { id: "title", type: "text", x: 32, y: 24, value: "Facture {{invoiceNumber}}", fontSize: 18, bold: true } as TemplateTextElement,
      { id: "issuer", type: "text", x: 32, y: 64, value: "De :\n{{issuerName}}\n{{issuerAddress}}\n{{issuerEmail}}", fontSize: 10 } as TemplateTextElement,
      { id: "client", type: "text", x: 320, y: 64, value: "À :\n{{clientName}}\n{{clientAddress}}\n{{clientEmail}}", fontSize: 10 } as TemplateTextElement,
      { id: "table", type: "table", x: 32, y: 140, width: 531, height: 300, columns: [
        { key: "description", title: "Description", width: 3 },
        { key: "quantity", title: "Qté", width: 1, align: "center" },
        { key: "unitPrice", title: "PU", width: 1, align: "right" },
        { key: "vatRate", title: "TVA", width: 1, align: "right" },
        { key: "total", title: "Total", width: 1, align: "right" },
      ], showHeader: true } as TemplateTableElement,
      { id: "totals", type: "text", x: 380, y: 460, value: "Total HT: {{totalHT}} €\nTVA: {{totalVAT}} €\nTotal TTC: {{totalTTC}} €", fontSize: 12 } as TemplateTextElement,
      { id: "mentions", type: "text", x: 32, y: 520, value: "{{legalMentions}}\nConditions: {{paymentTerms}}\nFrais de retard: {{lateFees}}", fontSize: 10 } as TemplateTextElement,
    ],
  };
}


