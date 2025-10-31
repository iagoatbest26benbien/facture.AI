import InvoiceForm from "@/components/forms/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nouvelle facture</h1>
      </div>
      <InvoiceForm />
    </div>
  );
}
