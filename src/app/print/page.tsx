"use client"

import { useEffect, useMemo } from "react";
import type { Invoice } from "@/lib/invoice";
import { InvoicePaper } from "@/components/InvoicePaper";

const INVOICE_PRINT_KEY = "invoice_print_v1";

function slugify(s: string) {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 30);
}

function pdfTitle(invoice: Invoice) {
  const parts = [invoice.invoiceNumber, invoice.date || "draft"];
  const customer = slugify(invoice.customerName || "");
  if (customer) parts.push(customer);
  return parts.join("_");
}

export default function PrintPage() {
    const invoice = useMemo<Invoice | null>(() => {
        try {
            const raw = localStorage.getItem(INVOICE_PRINT_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as Invoice;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        if (invoice) document.title = pdfTitle(invoice);
    }, [invoice]);

    useEffect(() => {
        // give the browser a moment to render before printing
        const t = setTimeout(() => window.print(), 200);
        return () => clearTimeout(t);
    }, []);

    if (!invoice) {
        return (
            <main className="min-h-dvh p-6">
                <p>No invoice data found</p>
            </main>
        );
    }

    return (
         <main className="min-h-dvh bg-white p-0">
            <InvoicePaper invoice={invoice} />
         </main>
    )
}