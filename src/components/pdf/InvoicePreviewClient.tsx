"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/components/pdf/InvoiceTemplate";
import type { InvoiceFormValues } from "@/types";

export default function InvoicePreviewClient({ data }: { data: InvoiceFormValues }) {
  // Guard against SSR hydration issues and ensure predictable size
  return (
    <div className="w-full h-full min-h-[400px]">
      <PDFViewer className="w-full h-full border">
        <InvoiceTemplate data={data} />
      </PDFViewer>
    </div>
  );
}


