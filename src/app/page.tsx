"use client"

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice";
import { calcTotal } from "@/lib/calc";
import { formatRs } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      description: "",
      size: "",
      quantity: 1,
      unitPrice: 0,
    };

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (index: number, patch: Partial<(typeof invoice.items)[number]>) => {
    setInvoice((prev) => {
      const items = [...prev.items];
      items[index] = {...items[index], ...patch};
      return {...prev, items};
    });
  };

  const removeItem = (index: number) => {
    setInvoice((prev) => {
      if(prev.items.length <= 1) return prev; // Prevent removing the last item
      const items = prev.items.filter((_, i) => i !== index);
      return {...prev, items};
    })
  }

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="min-h-dvh p-4">
        <h1>Invoice Generator</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section aria-labelledby="editor-title">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle id="editor-title">Editor</CardTitle>
                <Button type="button" onClick={addItem}>
                  Add item
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Item {index + 1}</p>

                      {invoice.items.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`desc-${index}`}>Description</Label>
                      <Input
                        id={`desc-${index}`}
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`size-${index}`}>Size</Label>
                      <Input
                        id={`size-${index}`}
                        type="text"
                        value={item.size}
                        onChange={(e) => updateItem(index, { size: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`qty-${index}`}>Quantity</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        value={item.quantity}
                        min={1}
                        step={1}
                        inputMode="numeric"
                        onChange={(e) => updateItem(index, { quantity: Math.max(1, Math.floor(Number(e.target.value))) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`price-${index}`}>Price</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={item.unitPrice}
                        min={0}
                        step={1}
                        inputMode="numeric"
                        onChange={(e) => updateItem(index, { unitPrice: Math.max(0, Math.floor(Number(e.target.value))) })}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="preview-title">
            <Card>
              <CardHeader>
                <CardTitle id="preview-title">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                Description: {invoice.items[0].description} <br />
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
