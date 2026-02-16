import type { Invoice } from "./invoice";

export function validateForExport(invoice: Invoice): string[] {
    const errors: string[] = [];

    // Must have at least 1 item with something meaningful
    if (invoice.items.length === 0) errors.push("Add at least one item.");

    invoice.items.forEach((it, i) => {
        if (!it.description.trim()) errors.push(`Item ${i + 1}: description is required.`);
        if (!it.size.trim()) errors.push(`Item ${i + 1}: size is required.`);
        if (it.quantity < 1) errors.push(`Item ${i + 1}: quantity must be at least 1.`);
        if (it.unitPrice < 0) errors.push(`Item ${i + 1}: price cannot be negative.`);
    });

    if (invoice.showBankDetails) {
        const b = invoice.bankDetails;
        if (!b.name.trim()) errors.push("Account Details: name is required.");
        if (!b.accountNumber.trim()) errors.push("Account Details: account number is required.");
        if (!b.bank.trim()) errors.push("Account Details: bank is required.");
        if (!b.branch.trim()) errors.push("Account Details: branch is required.");
    }

    return errors;
}