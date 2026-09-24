import AsyncStorage from '@react-native-async-storage/async-storage';

import { Transaction } from '../models/Transaction';

export interface SharedExpense {
  id: string;
  transaction: Transaction;
  participants: string[];

  // Exact amount assigned to each participant.
  // Example:
  // {
  //   Sai: 300,
  //   Rahul: 200,
  //   Priya: 180,
  //   Arjun: 160
  // }
  amounts: Record<string, number>;
}

const STORAGE_KEY = '@splitsnap_expenses';

/**
 * Add a new shared expense
 *
 * If custom amounts are not provided,
 * the expense is automatically split equally.
 */
export async function addExpense(
  transaction: Transaction,
  participants: string[],
  customAmounts?: Record<string, number>,
): Promise<SharedExpense> {
  const equalAmount =
    transaction.amount / participants.length;

  const amounts: Record<string, number> = {};

  participants.forEach((person) => {
    if (
      customAmounts &&
      typeof customAmounts[person] === 'number'
    ) {
      amounts[person] = Number(
        customAmounts[person].toFixed(2),
      );
    } else {
      amounts[person] = Number(
        equalAmount.toFixed(2),
      );
    }
  });

  const expense: SharedExpense = {
    id: `${transaction.id}-${Date.now()}`,
    transaction,
    participants: [...participants],
    amounts,
  };

  try {
    const existingData =
      await AsyncStorage.getItem(STORAGE_KEY);

    const existingExpenses: SharedExpense[] =
      existingData
        ? JSON.parse(existingData)
        : [];

    existingExpenses.push(expense);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(existingExpenses),
    );

    return expense;
  } catch (error) {
    console.error(
      'Failed to save expense:',
      error,
    );

    throw error;
  }
}

/**
 * Get all saved shared expenses
 */
export async function getExpenses(): Promise<
  SharedExpense[]
> {
  try {
    const data =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsedExpenses: any[] =
      JSON.parse(data);

    /*
     * Backward compatibility:
     * Old expenses did not have "amounts".
     *
     * Convert those old expenses into equal splits
     * so existing saved data does not break.
     */
    const expenses: SharedExpense[] =
      parsedExpenses.map((expense) => {
        if (expense.amounts) {
          return expense;
        }

        const equalAmount =
          expense.transaction.amount /
          expense.participants.length;

        const amounts: Record<string, number> =
          {};

        expense.participants.forEach(
          (person: string) => {
            amounts[person] = Number(
              equalAmount.toFixed(2),
            );
          },
        );

        return {
          ...expense,
          amounts,
        };
      });

    return expenses;
  } catch (error) {
    console.error(
      'Failed to load expenses:',
      error,
    );

    return [];
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(
  id: string,
): Promise<SharedExpense | undefined> {
  try {
    const expenses = await getExpenses();

    return expenses.find(
      (expense) => expense.id === id,
    );
  } catch (error) {
    console.error(
      'Failed to find expense:',
      error,
    );

    return undefined;
  }
}

/**
 * Remove a single expense
 */
export async function removeExpense(
  id: string,
): Promise<boolean> {
  try {
    const expenses = await getExpenses();

    const filteredExpenses =
      expenses.filter(
        (expense) => expense.id !== id,
      );

    if (
      filteredExpenses.length ===
      expenses.length
    ) {
      return false;
    }

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filteredExpenses),
    );

    return true;
  } catch (error) {
    console.error(
      'Failed to remove expense:',
      error,
    );

    return false;
  }
}

/**
 * Clear ALL saved expenses
 */
export async function clearExpenses(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);

    console.log(
      'All SplitSnap expenses cleared.',
    );

    return true;
  } catch (error) {
    console.error(
      'Failed to clear expenses:',
      error,
    );

    return false;
  }
}

/**
 * Get the total number of shared expenses
 */
export async function getExpenseCount(): Promise<number> {
  try {
    const expenses = await getExpenses();

    return expenses.length;
  } catch (error) {
    console.error(
      'Failed to get expense count:',
      error,
    );

    return 0;
  }
}