import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceFormValues, InvoiceTemplateJSON, TemplateElement, TemplateTextElement, TemplateRectElement, TemplateImageElement, TemplateTableElement } from "@/types";
import { evaluateBinding } from "@/lib/template";

const styles = StyleSheet.create({ page: { padding: 0, fontSize: 10 } });

function renderElement(el: TemplateElement, data: InvoiceFormValues) {
  const common: any = { left: el.x, top: el.y, position: "absolute", opacity: el.opacity ?? 1, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined };
  if ((el as any).width) common.width = (el as any).width;
  if ((el as any).height) common.height = (el as any).height;

  switch (el.type) {
    case "text": {
      const t = el as TemplateTextElement;
      return (<Text key={el.id} style={{ ...common, fontFamily: t.fontFamily, fontSize: t.fontSize ?? 10, color: t.color ?? "#000", textAlign: t.align ?? "left" }}>{evaluateBinding(t.value, data)}</Text>);
    }
    case "rect": {
      const r = el as TemplateRectElement;
      return (<View key={el.id} style={{ ...common, backgroundColor: r.fill ?? "transparent", borderColor: r.stroke ?? "transparent", borderWidth: r.strokeWidth ?? 0, borderRadius: r.radius ?? 0 }} />);
    }
    case "image": {
      const im = el as TemplateImageElement;
      return (<Image key={el.id} src={im.src} style={{ ...common, objectFit: im.objectFit ?? "contain" }} />);
    }
    case "table": {
      const tbl = el as TemplateTableElement;
      const cols = tbl.columns;
      const totalWeight = cols.reduce((s, c) => s + (c.width ?? 1), 0);
      const row = (cells: React.ReactNode[], key: string | number) => (
        <View key={key} style={{ display: "flex", flexDirection: "row" }}>{cells}</View>
      );
      const cell = (content: React.ReactNode, w: number, align?: string, idx?: number) => (
        <View key={String(idx)} style={{ width: `${(w / totalWeight) * 100}%`, padding: 6, borderBottomWidth: 1, borderColor: "#e2e8f0" }}>
          <Text style={{ textAlign: align as any }}>{content}</Text>
        </View>
      );
      const header = tbl.showHeader !== false ? row(cols.map((c, i) => cell(c.title, c.width ?? 1, c.align, i)), "h") : null;
      const lines = (data.items || []).map((it, i) => row(cols.map((c, j) => {
        const value = c.key === "total" ? (it.quantity * it.unitPrice).toFixed(2) : (c.key === "unitPrice" ? it.unitPrice.toFixed(2) : (c.key === "vatRate" ? `${it.vatRate}%` : (c.key === "description" ? (it.enhancedDescription || it.description) : (it as any)[c.key])));
        const aligned = c.align || (c.key === "description" ? "left" : c.key === "quantity" ? "center" : "right");
        return cell(String(value), c.width ?? 1, aligned, j);
      }), i));
      return (
        <View key={el.id} style={{ ...common }}>
          {header}
          {lines}
        </View>
      );
    }
  }
}

export function TemplateDocument({ data, template }: { data: InvoiceFormValues; template: InvoiceTemplateJSON }) {
  const pagePadding = template.page?.padding ?? 0;
  return (
    <Document>
      <Page size={{ width: template.page.width, height: template.page.height }} style={styles.page}>
        <View style={{ position: "relative", left: pagePadding, top: pagePadding, width: template.page.width - pagePadding * 2, height: template.page.height - pagePadding * 2 }}>
          {template.elements.map((el) => renderElement(el, data))}
        </View>
      </Page>
    </Document>
  );
}


