export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Entertainment'
  | 'Groceries'
  | 'Other';

export type PaymentMethod =
  | 'GPay'
  | 'PhonePe'
  | 'Paytm'
  | 'UPI';

export interface Transaction {
  id: string;
  rawMessage: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  payer: string;
  date: string;
  isPotentialSharedExpense: boolean;
  aiConfidence: number;
}