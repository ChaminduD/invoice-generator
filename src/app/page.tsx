"use client"

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice";
import { calcTotal } from "@/lib/calc";
import { formatRs } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice>({
    date: "2026-02-14",
    items: [
      {
        id: crypto.randomUUID(),
        description: "Sofa (Sample)",
        size: "6ft",
        quantity: 1,
        unitPrice: 50000,
      },
    ],
    discount: null,
    showBankDetails: false,
    bankDetails: {
      name: "Sample Name",
      accountNumber: "0000000000",
      bank: "Sample Bank",
      branch: "Sample Branch",
    },
  });

  const { subtotal, discountAmount, total } = calcTotal(invoice.items, invoice.discount);

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="min-h-dvh p-4">
        <h1>Invoice Generator</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section aria-labelledby="editor-title">
            <Card>
              <CardHeader>
                <CardTitle id="editor-title">Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="qty-0">Quantity</Label>
                <Input id="qty-0" type="number" value={invoice.items[0].quantity} min={1} step={1} inputMode="numeric" onChange={(e) => {
                  const qty = Math.max(1, Math.floor(Number(e.target.value)));
                  const items = [...invoice.items];
                  items[0] = { ...items[0], quantity: qty };
                  setInvoice({ ...invoice, items });
                }}/>
                <Label htmlFor="price-0">Price</Label>
                <Input id="price-0" type="number" value={invoice.items[0].unitPrice} min={0} step={1} inputMode="numeric" onChange={(e) => {
                  const unitPrice = Math.max(0, Math.floor(Number(e.target.value)));
                  const items = [...invoice.items];
                  items[0] = { ...items[0], unitPrice };
                  setInvoice({ ...invoice, items });
                }} />
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="preview-title">
            <Card>
              <CardHeader>
                <CardTitle id="preview-title">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                Subtotal: {formatRs(subtotal)} <br />
                Discount: {formatRs(discountAmount)} <br />
                Total: {formatRs(total)}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
