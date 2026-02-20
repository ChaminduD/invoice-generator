import type { Invoice } from "@/lib/invoice";
import { calcTotal } from "@/lib/calc";
import { formatRs } from "@/lib/format";
import { totalToWordsRs } from "@/lib/total-words";

export function InvoicePaper({ invoice }: { invoice: Invoice }) {
  const { subtotal, discountAmount, total } = calcTotal(invoice.items, invoice.discount);

  return (
    <div className="w-[794px] min-h-[1123px] bg-white p-10 text-black flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        {/* Left: Logo + Business contact */}
        <div className="space-y-2">
          <img
            src="/logo.png"
            alt={`${invoice.business.name} logo`}
            className="h-12 w-auto object-contain"
          />

          {/* Contact info */}
          <div className="text-sm leading-5">
            <div className="font-medium">{invoice.business.name}</div>
            <div>
              <span className="text-black/70">Call/WhatsApp: </span>
              <span>{invoice.business.phone}</span>
            </div>
            
            {invoice.business.email ?
              <div>
                <span className="text-black/70">Email: </span>
                <span>{invoice.business.email}</span>
              </div> : null}
            {invoice.business.social ?
              <div>
                <span className="text-black/70">FB | IG | TikTok | YT: </span>
                <span>{invoice.business.social}</span>
              </div> : null}
          </div>
        </div>

        {/* Right: Title + Date */}
        <div className="text-right">
          <h1 className="text-2xl font-semibold tracking-tight">INVOICE</h1>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              <span className="text-black/70">Invoice No: </span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-black/70">Date: </span>
              <span>{invoice.date}</span>
            </div>
            {invoice.customerName ? (
              <div>
                <span className="text-black/70">Bill To: </span>
                <span>{invoice.customerName}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4 h-1 w-full rounded bg-primary" />

      {/* Items table */}
      <div className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/20">
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
                <tr key={item.id} className="border-b border-black/10 align-top">
                  <td className="py-2 pr-2">
                    <div className="font-medium">{item.description || "—"}</div>
                    <div className="text-xs text-black/60">{item.size}</div>
                  </td>
                  <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-2 text-right tabular-nums">{formatRs(item.unitPrice)}</td>
                  <td className="py-2 text-right tabular-nums">{formatRs(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 ml-auto w-[320px] space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-black/70">Subtotal</span>
            <span className="tabular-nums">{formatRs(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-black/70">Discount</span>
              <span className="tabular-nums">- {formatRs(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-black/20 pt-2 text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatRs(total)}</span>
          </div>
        </div>

        {invoice.showTotalInWords && (
            <div className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-xs text-black/70">
              <span className="font-medium">Total in words: </span>
              <span className="capitalize text-black">{totalToWordsRs(total)}</span>
            </div>
          )}

        {/* Account Details table (only if enabled) */}
        {invoice.showBankDetails && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold">Account Details</h2>

            <table className="mt-2 w-full text-sm text-black/70">
              <thead>
                <tr className="border-b border-black/20 text-black">
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Account Number</th>
                  <th className="py-2 text-left font-medium">Bank</th>
                  <th className="py-2 text-left font-medium">Branch</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/10">
                  <td className="py-2">{invoice.bankDetails.name}</td>
                  <td className="py-2">{invoice.bankDetails.accountNumber}</td>
                  <td className="py-2">{invoice.bankDetails.bank}</td>
                  <td className="py-2">{invoice.bankDetails.branch}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-8 text-xs text-black/60">
        <div className="border-t border-black/10 pt-3 text-center">
          Thank you for choosing Greenwood Furniture!
        </div>
      </div>
    </div>
  );
}
