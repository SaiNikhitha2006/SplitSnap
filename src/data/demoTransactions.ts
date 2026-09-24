import { Transaction } from '../models/Transaction';

export const demoTransactions: Transaction[] = [
  {
    id: 'txn-001',
    rawMessage:
      'GPay: You paid ₹840 to Barbeque Nation. UPI transaction successful.',
    merchant: 'Barbeque Nation',
    amount: 840,
    category: 'Food',
    paymentMethod: 'GPay',
    payer: 'Sai',
    date: 'Today, 7:42 PM',
    isPotentialSharedExpense: true,
    aiConfidence: 94,
  },

  {
    id: 'txn-002',
    rawMessage:
      'PhonePe: You paid ₹320 to Uber. UPI payment successful.',
    merchant: 'Uber',
    amount: 320,
    category: 'Travel',
    paymentMethod: 'PhonePe',
    payer: 'Rahul',
    date: 'Today, 5:20 PM',
    isPotentialSharedExpense: true,
    aiConfidence: 91,
  },

  {
    id: 'txn-003',
    rawMessage:
      'GPay: Payment of ₹1200 made to PVR Cinemas.',
    merchant: 'PVR Cinemas',
    amount: 1200,
    category: 'Entertainment',
    paymentMethod: 'GPay',
    payer: 'Priya',
    date: 'Yesterday, 8:15 PM',
    isPotentialSharedExpense: true,
    aiConfidence: 96,
  },

  {
    id: 'txn-004',
    rawMessage:
      'PhonePe: ₹560 paid to Blinkit. Transaction successful.',
    merchant: 'Blinkit',
    amount: 560,
    category: 'Groceries',
    paymentMethod: 'PhonePe',
    payer: 'Arjun',
    date: 'Yesterday, 6:30 PM',
    isPotentialSharedExpense: true,
    aiConfidence: 89,
  },
];