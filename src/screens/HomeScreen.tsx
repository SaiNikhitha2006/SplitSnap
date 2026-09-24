import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '../theme/theme';

import {
  getExpenses,
  SharedExpense,
} from '../services/expenseStore';

import { calculateBalances } from '../services/balanceService';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<
    SharedExpense[]
  >([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(
        'Failed to load dashboard:',
        error,
      );
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const analytics = useMemo(() => {
    const totalSpent = expenses.reduce(
      (total, expense) =>
        total + expense.transaction.amount,
      0,
    );

    let youAreOwed = 0;
    let youOwe = 0;

    expenses.forEach((expense) => {
      /*
       * Pass expense.amounts so custom splits
       * are calculated correctly.
       */
      const balances = calculateBalances(
        expense.transaction,
        expense.participants,
        expense.amounts,
      );

      const saiBalance = balances.find(
        (item) => item.person === 'Sai',
      );

      if (saiBalance) {
        if (saiBalance.amount > 0) {
          youAreOwed += saiBalance.amount;
        } else if (saiBalance.amount < 0) {
          youOwe += Math.abs(
            saiBalance.amount,
          );
        }
      }
    });

    const netBalance =
      youAreOwed - youOwe;

    const recentExpenses = [...expenses]
      .reverse()
      .slice(0, 4);

    return {
      totalSpent,
      youAreOwed,
      youOwe,
      netBalance,
      recentExpenses,
    };
  }, [expenses]);

  const formatAmount = (
    amount: number,
  ) => `₹${amount.toFixed(0)}`;

  const onRefresh = async () => {
    setRefreshing(true);

    await loadDashboard();

    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Hello, Sai 👋
          </Text>

          <Text style={styles.title}>
            SplitSnap
          </Text>

          <Text style={styles.subtitle}>
            Smart expense splitting
          </Text>
        </View>

        <View style={styles.aiBadge}>
          <Ionicons
            name="sparkles"
            size={15}
            color={colors.primary}
          />

          <Text style={styles.aiBadgeText}>
            AI
          </Text>
        </View>
      </View>

      {/* Main Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceTopRow}>
          <View>
            <Text style={styles.cardLabel}>
              Your Group Balance
            </Text>

            <Text style={styles.balance}>
              {formatAmount(
                Math.abs(
                  analytics.netBalance,
                ),
              )}
            </Text>
          </View>

          <View style={styles.balanceIcon}>
            <Ionicons
              name={
                analytics.netBalance >= 0
                  ? 'arrow-down-outline'
                  : 'arrow-up-outline'
              }
              size={25}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.balanceStatus}>
          <Ionicons
            name={
              analytics.netBalance > 0
                ? 'checkmark-circle-outline'
                : analytics.netBalance < 0
                  ? 'alert-circle-outline'
                  : 'checkmark-circle-outline'
            }
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.cardSubtext}>
            {analytics.netBalance > 0
              ? 'You are owed overall'
              : analytics.netBalance < 0
                ? 'You owe overall'
                : 'All settled up'}
          </Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.owedIcon,
            ]}
          >
            <Ionicons
              name="arrow-down"
              size={19}
              color="#16A34A"
            />
          </View>

          <Text style={styles.summaryLabel}>
            You are owed
          </Text>

          <Text style={styles.owedAmount}>
            {formatAmount(
              analytics.youAreOwed,
            )}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.oweIcon,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={19}
              color="#DC2626"
            />
          </View>

          <Text style={styles.summaryLabel}>
            You owe
          </Text>

          <Text style={styles.oweAmount}>
            {formatAmount(
              analytics.youOwe,
            )}
          </Text>
        </View>
      </View>

      {/* Total Spending */}
      <View style={styles.totalCard}>
        <View style={styles.totalLeft}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="wallet-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.totalLabel}>
              Total shared spending
            </Text>

            <Text style={styles.totalAmount}>
              {formatAmount(
                analytics.totalSpent,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.expenseCount}>
          <Text
            style={styles.expenseCountNumber}
          >
            {expenses.length}
          </Text>

          <Text
            style={styles.expenseCountLabel}
          >
            expenses
          </Text>
        </View>
      </View>

      {/* Recent Expenses */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent Expenses
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your latest shared payments
          </Text>
        </View>

        {expenses.length > 4 && (
          <Text style={styles.viewAll}>
            View all
          </Text>
        )}
      </View>

      {analytics.recentExpenses.length ===
      0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="receipt-outline"
              size={29}
              color={colors.secondaryText}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No expenses yet
          </Text>

          <Text style={styles.emptyText}>
            Your detected shared expenses will
            appear here automatically.
          </Text>
        </View>
      ) : (
        <View style={styles.expensesCard}>
          {analytics.recentExpenses.map(
            (expense, index) => {
              const transaction =
                expense.transaction;

              const categoryIcon =
                getCategoryIcon(
                  transaction.category,
                );

              return (
                <View
                  key={expense.id}
                  style={[
                    styles.expenseItem,
                    index !==
                      analytics
                        .recentExpenses
                        .length -
                        1 &&
                      styles.expenseBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.expenseIcon,
                      {
                        backgroundColor:
                          getCategoryBackground(
                            transaction.category,
                          ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={categoryIcon}
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <View
                    style={styles.expenseInfo}
                  >
                    <Text
                      style={
                        styles.expenseMerchant
                      }
                      numberOfLines={1}
                    >
                      {transaction.merchant}
                    </Text>

                    <Text
                      style={styles.expenseMeta}
                      numberOfLines={1}
                    >
                      {transaction.category} •
                      Paid by{' '}
                      {transaction.payer}
                    </Text>

                    <View
                      style={
                        styles.participantRow
                      }
                    >
                      <Ionicons
                        name="people-outline"
                        size={12}
                        color={
                          colors.secondaryText
                        }
                      />

                      <Text
                        style={
                          styles.participantText
                        }
                      >
                        {
                          expense.participants
                            .length
                        }{' '}
                        participants
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.expenseAmount}
                  >
                    {formatAmount(
                      transaction.amount,
                    )}
                  </Text>
                </View>
              );
            },
          )}
        </View>
      )}

      {/* AI Detection Info */}
      <View style={styles.aiCard}>
        <View style={styles.aiIconContainer}>
          <Ionicons
            name="sparkles"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.aiContent}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>
              AI Expense Detection
            </Text>

            <View style={styles.activeBadge}>
              <Text
                style={styles.activeBadgeText}
              >
                ACTIVE
              </Text>
            </View>
          </View>

          <Text style={styles.aiText}>
            SplitSnap analyzes payment alerts to
            identify merchants, amounts and
            categories automatically.
          </Text>
        </View>
      </View>

      {/* Demo Note */}
      <View style={styles.demoContainer}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={colors.secondaryText}
        />

        <Text style={styles.demoText}>
          Demo mode • UPI/SMS data is simulated
        </Text>
      </View>
    </ScrollView>
  );
}

function getCategoryIcon(
  category?: string,
): keyof typeof Ionicons.glyphMap {
  const value =
    category?.toLowerCase() || '';

  if (
    value.includes('food') ||
    value.includes('restaurant')
  ) {
    return 'restaurant-outline';
  }

  if (
    value.includes('travel') ||
    value.includes('transport')
  ) {
    return 'car-outline';
  }

  if (
    value.includes('entertainment') ||
    value.includes('movie')
  ) {
    return 'film-outline';
  }

  if (
    value.includes('grocery') ||
    value.includes('groceries')
  ) {
    return 'cart-outline';
  }

  return 'card-outline';
}

function getCategoryBackground(
  category?: string,
) {
  const value =
    category?.toLowerCase() || '';

  if (
    value.includes('food') ||
    value.includes('restaurant')
  ) {
    return '#FEF2F2';
  }

  if (
    value.includes('travel') ||
    value.includes('transport')
  ) {
    return '#EFF6FF';
  }

  if (
    value.includes('entertainment') ||
    value.includes('movie')
  ) {
    return '#F5F3FF';
  }

  if (
    value.includes('grocery') ||
    value.includes('groceries')
  ) {
    return '#F0FDF4';
  }

  return '#F3F4F6';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.md,
  },

  greeting: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 3,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 3,
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 3,
  },

  aiBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
  },

  balanceCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },

  balance: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: -0.5,
  },

  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  cardSubtext: {
    color: '#FFFFFF',
    opacity: 0.88,
    fontSize: 13,
    marginLeft: 6,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  owedIcon: {
    backgroundColor: '#F0FDF4',
  },

  oweIcon: {
    backgroundColor: '#FEF2F2',
  },

  summaryLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },

  owedAmount: {
    fontSize: 21,
    fontWeight: '900',
    color: '#16A34A',
  },

  oweAmount: {
    fontSize: 21,
    fontWeight: '900',
    color: '#DC2626',
  },

  totalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  totalIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  totalLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 3,
  },

  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },

  expenseCount: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  expenseCountNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },

  expenseCountLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 3,
  },

  viewAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },

  expensesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },

  expenseBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  expenseIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },

  expenseMerchant: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 3,
  },

  expenseMeta: {
    fontSize: 10.5,
    color: colors.secondaryText,
    marginBottom: 4,
  },

  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  participantText: {
    fontSize: 10.5,
    color: colors.secondaryText,
    marginLeft: 3,
  },

  expenseAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },

  emptyCard: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 5,
  },

  emptyText: {
    color: colors.secondaryText,
    lineHeight: 20,
    textAlign: 'center',
    fontSize: 12,
  },

  aiCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },

  aiIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  aiContent: {
    flex: 1,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },

  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },

  activeBadge: {
    marginLeft: 7,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  activeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#15803D',
  },

  aiText: {
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 17,
  },

  demoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  demoText: {
    textAlign: 'center',
    fontSize: 10.5,
    color: colors.secondaryText,
    marginLeft: 4,
  },
});