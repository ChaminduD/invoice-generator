"use client"

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Invoice } from "@/lib/invoice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { validateForExport } from "@/lib/validate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toPng } from "html-to-image";
import { InvoicePaper } from "@/components/InvoicePaper";
import { BUSINESS } from "@/config/business";

const PROFILE_KEY = "invoice_profile_v1";
const INVOICE_DRAFT_KEY = "invoice_draft_v1";
const PAPER_W = 794;
const PAPER_H = 1123;

export default function Home() {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const defaults: Invoice ={
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
      business: BUSINESS,
    };

    //only runs in the browser
    if (typeof window === "undefined") return defaults;

    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return defaults;

      const saved = JSON.parse(raw) as {
        showBankDetails?: boolean;
        bankDetails?: Partial<Invoice["bankDetails"]>;
      };

      return {
        ...defaults,
        showBankDetails: saved.showBankDetails ?? defaults.showBankDetails,
        bankDetails: { ...defaults.bankDetails, ...(saved.bankDetails ?? {}) },
      };
    } catch {
      return defaults;
    }
  });
  const [exportErrors, setExportErrors] = useState<string[]>([]);
  const [previewScale, setPreviewScale] = useState(1);

  const exportRef = useRef<HTMLDivElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          showBankDetails: invoice.showBankDetails,
          bankDetails: invoice.bankDetails,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [invoice.showBankDetails, invoice.bankDetails]);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? PAPER_W;
      const scale = Math.min(1, width / PAPER_W);
      setPreviewScale(scale);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const updateBankDetails = (
    patch: Partial<Invoice["bankDetails"]>
  ) => {
    setInvoice((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...patch },
    }));
  }

  const removeItem = (index: number) => {
    setInvoice((prev) => {
      if(prev.items.length <= 1) return prev; // Prevent removing the last item
      const items = prev.items.filter((_, i) => i !== index);
      return {...prev, items};
    })
  }

  const runExport = async (kind: "pdf" | "png") => {
    const errors = validateForExport(invoice);

    if (errors.length > 0) {
      setExportErrors(errors);
      return;
    }

    setExportErrors([]);

    if (kind === "png") {
      const node = exportRef.current;
      if (!node) return;

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#ffffff",
        });

        const link = document.createElement("a");
        link.download = `invoice-${invoice.date || "draft"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
        setExportErrors(["PNG export failed. Please try again."]);
      }

      return;
    }

    if (kind === "pdf") {
      try {
        localStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(invoice));
        window.open("/print", "_blank", "noopener,noreferrer");
      } catch {
        setExportErrors(["PDF export failed. Please try again."]);
      }
      return;
    }
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

                {/* Bank details */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Account Details</p>
                      <p className="text-xs text-muted-foreground">
                        Saved on this device
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="show-bank" className="text-sm">
                        Show
                      </Label>
                      <Switch
                        id="show-bank"
                        checked={invoice.showBankDetails}
                        onCheckedChange={(checked) => 
                          setInvoice((prev) => ({ ...prev, showBankDetails: checked }))
                        }
                      />
                    </div>
                  </div>

                  {invoice.showBankDetails && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="acc-name">Name</Label>
                        <Input
                          id="acc-name"
                          value={invoice.bankDetails.name}
                          onChange={(e) => updateBankDetails({ name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="acc-number">Account number</Label>
                        <Input
                          id="acc-number"
                          value={invoice.bankDetails.accountNumber}
                          inputMode="numeric"
                          onChange={(e) => updateBankDetails({ accountNumber: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank</Label>
                        <Input
                          id="bank-name"
                          value={invoice.bankDetails.bank}
                          onChange={(e) => updateBankDetails({ bank: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-branch">Branch</Label>
                        <Input
                          id="bank-branch"
                          value={invoice.bankDetails.branch}
                          onChange={(e) => updateBankDetails({ branch: e.target.value })}
                        />
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
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => runExport("pdf")}>
                    Download PDF
                  </Button>
                  <Button type="button" variant="outline" onClick={() => runExport("png")}>
                    Download PNG
                  </Button>
                </div>

                {exportErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTitle>Fix these before exporting</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {exportErrors.map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Visible preview (auto-scaled to fit) */}
                <div ref={previewWrapRef} className="w-full">
                  <div
                    className="relative overflow-hidden rounded-md bg-zinc-100"
                    style={{ height: PAPER_H * previewScale }}
                  >
                    <div
                      className="absolute left-1/2 top-0 origin-top"
                      style={{ transform: `translateX(-50%) scale(${previewScale})` }}
                    >
                      <InvoicePaper invoice={invoice} />
                    </div>
                  </div>
                </div>

                {/* Hidden export canvas (always unscaled) */}
                <div className="fixed left-[-99999px] top-0">
                  <div ref={exportRef} className="inline-block bg-white">
                    <InvoicePaper invoice={invoice} />
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
