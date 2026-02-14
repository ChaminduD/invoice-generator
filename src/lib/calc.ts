import type { Discount, LineItem } from "./invoice";

export function calcSubtotal(items: LineItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calcDiscountAmount(subtotal: number, discount: Discount | null): number {
    if(!discount) return 0;

    const raw =
        discount.type === "amount"
            ? discount.value
            : subtotal * (discount.value / 100);
    
    // Prevent negative or over subtotal discounts
    return Math.min(Math.max(raw, 0), subtotal);
}

export function calcTotal(items: LineItem[], discount: Discount | null) {
    const subtotal = calcSubtotal(items);
    const discountAmount = calcDiscountAmount(subtotal, discount);
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, total };
}