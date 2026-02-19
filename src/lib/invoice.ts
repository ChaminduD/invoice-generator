export type Discount =
  | { type: "amount"; value: number }
  | { type: "percent"; value: number };

export type BankDetails = {
  name: string;
  accountNumber: string;
  bank: string;
  branch: string;
};

export type LineItem = {
  id: string;
  description: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  date: string;
  items: LineItem[];
  discount: Discount | null;
  showBankDetails: boolean;
  bankDetails: BankDetails;
  business: BusinessProfile;
  invoiceNumber: string;
  customerName: string;
  showTotalInWords: boolean;
};

export type BusinessProfile = {
  name: string;
  phone: string;
  email?: string;
  social?: string;
};