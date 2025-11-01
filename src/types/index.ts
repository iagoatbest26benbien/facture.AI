export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  description: string;
  enhancedDescription?: string;
  quantity: number;
  unitPrice: number;
  vatRate: 0 | 10 | 20;
}

export interface InvoiceFormValues {
  // Issuer (sender)
  issuerType?: "profile" | "custom";
  issuerName?: string;
  issuerEmail?: string;
  issuerAddress?: string;
  issuerSiret?: string;

  // Client
  clientType?: "select" | "custom";
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientSiret?: string;

  // Invoice
  invoiceNumber: string;
  invoiceDate: string; // ISO string for form
  dueDate: string; // ISO string for form

  // Items
  items: InvoiceItem[];

  // Totals
  totalHT: number;
  totalVAT: number;
  totalTTC: number;

  // Legal
  legalMentions: string;
  paymentTerms: string;
  lateFees: string;

  // Template (optional for Canva-like editor)
  templateId?: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  siret?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  invoice_date: string; // ISO
  due_date: string; // ISO
  status: InvoiceStatus;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
  pdf_url?: string | null;
  template_id?: string | null;
  created_at?: string;
}

// ===== Template DSL (P0 minimal) =====
export type TemplateElementType = "text" | "image" | "rect" | "table";

export interface TemplateBaseElement {
  id: string;
  type: TemplateElementType;
  x: number; y: number; width?: number; height?: number; rotation?: number;
  opacity?: number;
}

export interface TemplateTextElement extends TemplateBaseElement {
  type: "text";
  value: string; // may include {{bindings}}
  fontFamily?: string; fontSize?: number; color?: string; align?: "left" | "center" | "right";
  bold?: boolean; italic?: boolean;
}

export interface TemplateRectElement extends TemplateBaseElement {
  type: "rect";
  fill?: string; stroke?: string; strokeWidth?: number; radius?: number;
}

export interface TemplateImageElement extends TemplateBaseElement {
  type: "image";
  src: string; // url
  objectFit?: "cover" | "contain";
}

export interface TemplateTableColumn {
  key: string; // e.g. description | quantity | unitPrice | vatRate | total
  title: string;
  width?: number; // relative weight
  align?: "left" | "center" | "right";
}

export interface TemplateTableElement extends TemplateBaseElement {
  type: "table";
  columns: TemplateTableColumn[];
  showHeader?: boolean;
}

export type TemplateElement = TemplateTextElement | TemplateRectElement | TemplateImageElement | TemplateTableElement;

export interface InvoiceTemplateJSON {
  version: 1;
  page: { width: number; height: number; padding?: number };
  elements: TemplateElement[];
}
