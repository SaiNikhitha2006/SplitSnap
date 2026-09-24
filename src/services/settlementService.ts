import { Balance } from './balanceService';

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateSettlements(
  balances: Balance[],
): Settlement[] {
  const debtors = balances
    .filter((item) => item.amount < -0.01)
    .map((item) => ({
      person: item.person,
      amount: Math.abs(item.amount),
    }));

  const creditors = balances
    .filter((item) => item.amount > 0.01)
    .map((item) => ({
      person: item.person,
      amount: item.amount,
    }));

  const settlements: Settlement[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(
      debtor.amount,
      creditor.amount,
    );

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: Number(amount.toFixed(2)),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) {
      debtorIndex++;
    }

    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
}