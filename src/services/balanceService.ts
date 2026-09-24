import { Transaction } from '../models/Transaction';

export interface Balance {
  person: string;
  amount: number;
}

/**
 * Calculate balances for one expense.
 *
 * Positive amount = person should receive money.
 * Negative amount = person owes money.
 *
 * Example:
 *
 * Sai paid ₹840
 *
 * Sai:   +₹540
 * Rahul: -₹200
 * Priya: -₹180
 * Arjun: -₹160
 *
 * Total = ₹0
 */
export function calculateBalances(
  transaction: Transaction,
  participants: string[],
  customAmounts?: Record<string, number>,
): Balance[] {
  const balances: Record<string, number> = {};

  participants.forEach((person) => {
    balances[person] = 0;
  });

  /*
   * If custom amounts are provided,
   * use those exact amounts.
   *
   * Otherwise calculate an equal split.
   */
  const equalShare =
    transaction.amount / participants.length;

  balances[transaction.payer] +=
    transaction.amount;

  participants.forEach((person) => {
    const amountOwed =
      customAmounts &&
      typeof customAmounts[person] === 'number'
        ? customAmounts[person]
        : equalShare;

    balances[person] -= amountOwed;
  });

  return Object.entries(balances).map(
    ([person, amount]) => ({
      person,
      amount: Number(amount.toFixed(2)),
    }),
  );
}