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
  created_at?: string;
}
