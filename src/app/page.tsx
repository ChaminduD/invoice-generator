"use client"

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice";
import { calcTotal } from "@/lib/calc";
import { formatRs } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

                {/* Discount */}
                <div className="border-t pt-4 space-y-3">
                  {invoice.discount === null ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => 
                        setInvoice((prev) => ({
                          ...prev,
                          discount: { type: "amount", value: 0 },
                        }))
                      }
                    >
                      Add discount
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Discount</p>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setInvoice((prev) => ({
                              ...prev,
                              discount: null,
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={invoice.discount.type}
                            onValueChange={(val) => 
                              setInvoice((prev) => ({
                                ...prev,
                                discount: {
                                  type: val as "amount" | "percent",
                                  value: prev.discount?.value ?? 0,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Rs.</SelectItem>
                              <SelectItem value="percent">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            value={invoice.discount.value}
                            onChange={(e) => {
                              const n = Math.max(0, Math.floor(Number(e.target.value)));
                              const discount = invoice.discount;

                              if(!discount) return;

                              const value = discount.type === "percent" ? Math.min(n, 100) : n; // Cap percentage at 100

                                setInvoice((prev) => ({
                                  ...prev,
                                  discount: { ...discount, value },
                                }));
                            }}
                          />
                          {invoice.discount.type === "percent" && (
                            <p className="text-xs text-muted-foreground">Max 100%</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
          <section aria-labelledby="preview-title">
            <Card>
              <CardHeader>
                <CardTitle id="preview-title">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Description</th>
                      <th className="py-2 text-right font-medium">Qty</th>
                      <th className="py-2 text-right font-medium">Unit Price</th>
                      <th className="py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoice.items.map((item) => {
                      const lineTotal = item.quantity * item.unitPrice;

                      return (
                        <tr key={item.id} className="border-b align-top">
                          <td className="py-2 pr-2">
                            <div className="font-medium">{item.description || "—"}</div>
                            <div className="text-xs text-muted-foreground">{item.size}</div>
                          </td>

                          <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                          <td className="py-2 text-right tabular-nums">{formatRs(item.unitPrice)}</td>
                          <td className="py-2 text-right tabular-nums">{formatRs(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatRs(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="tabular-nums">- {formatRs(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total</span>
                    <span className="tabular-nums">{formatRs(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
