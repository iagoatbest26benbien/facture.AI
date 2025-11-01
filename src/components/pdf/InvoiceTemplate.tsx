import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceFormValues } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  row: { display: "flex", flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  header: { fontSize: 16, marginBottom: 12 },
  table: { marginTop: 16, borderTopWidth: 1, borderColor: "#e2e8f0" },
  tableRow: { display: "flex", flexDirection: "row", borderBottomWidth: 1, borderColor: "#e2e8f0" },
  cell: { padding: 6, flex: 1 },
});

export function InvoiceTemplate({ data }: { data: InvoiceFormValues }) {
  const items = data.items ?? [];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Facture {data.invoiceNumber}</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text>De :</Text>
            <Text>{data.issuerName || ""}</Text>
            <Text>{data.issuerAddress || ""}</Text>
            <Text>{data.issuerEmail || ""}</Text>
          </View>
          <View style={styles.col}>
            <Text>À :</Text>
            <Text>{data.clientName}</Text>
            <Text>{data.clientAddress}</Text>
            <Text>{data.clientEmail}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 3 }]}>Description</Text>
            <Text style={styles.cell}>Qté</Text>
            <Text style={styles.cell}>PU</Text>
            <Text style={styles.cell}>TVA</Text>
            <Text style={styles.cell}>Total</Text>
          </View>
          {items.map((it, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 3 }]}>{it.enhancedDescription || it.description}</Text>
              <Text style={styles.cell}>{it.quantity}</Text>
              <Text style={styles.cell}>{it.unitPrice.toFixed(2)} €</Text>
              <Text style={styles.cell}>{it.vatRate}%</Text>
              <Text style={styles.cell}>{(it.quantity * it.unitPrice).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 16, display: "flex", alignItems: "flex-end" }}>
          <Text>Total HT: {data.totalHT.toFixed(2)} €</Text>
          <Text>TVA: {data.totalVAT.toFixed(2)} €</Text>
          <Text style={{ fontSize: 12 }}>Total TTC: {data.totalTTC.toFixed(2)} €</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text>{data.legalMentions}</Text>
          <Text>Conditions de paiement: {data.paymentTerms}</Text>
          <Text>Frais de retard: {data.lateFees}</Text>
        </View>
      </Page>
    </Document>
  );
}
