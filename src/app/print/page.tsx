"use client"

import { useEffect, useMemo } from "react";
import type { Invoice } from "@/lib/invoice";
import { InvoicePaper } from "@/components/InvoicePaper";

const INVOICE_DRAFT_KEY = "invoice_draft_v1";

export default function PrintPage() {
    const invoice = useMemo<Invoice | null>(() => {
        try {
            const raw = localStorage.getItem(INVOICE_DRAFT_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as Invoice;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        if (invoice) document.title = `Invoice ${invoice.date}`;
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