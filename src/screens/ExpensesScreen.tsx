import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import {
  colors,
  radius,
  spacing,
} from '../theme/theme';

import {
  getExpenses,
  removeExpense,
  SharedExpense,
} from '../services/expenseStore';

export default function ExpensesScreen() {
  const [expenses, setExpenses] =
    useState<SharedExpense[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadExpenses = useCallback(
    async () => {
      try {
        const savedExpenses =
          await getExpenses();

        setExpenses(
          [...savedExpenses].reverse(),
        );
      } catch (error) {
        console.error(
          'Failed to load expenses:',
          error,
        );

        setExpenses([]);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadExpenses();

    setRefreshing(false);
  };

  const handleDelete = (
    expense: SharedExpense,
  ) => {
    Alert.alert(
      'Delete Expense?',
      `Remove ${expense.transaction.merchant} from your shared expenses?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const deleted =
              await removeExpense(
                expense.id,
              );

            if (deleted) {
              await loadExpenses();

              Alert.alert(
                'Expense Deleted',
                'The expense has been removed.',
              );
            }
          },
        },
      ],
    );
  };

  const getCategoryIcon = (
    category: string,
  ): keyof typeof Ionicons.glyphMap => {
    switch (category.toLowerCase()) {
      case 'food':
        return 'restaurant-outline';

      case 'travel':
        return 'car-outline';

      case 'entertainment':
        return 'film-outline';

      case 'groceries':
        return 'cart-outline';

      default:
        return 'receipt-outline';
    }
  };

  const getCategoryBackground = (
    category: string,
  ) => {
    switch (category.toLowerCase()) {
      case 'food':
        return '#FFF7ED';

      case 'travel':
        return '#EFF6FF';

      case 'entertainment':
        return '#F5F3FF';

      case 'groceries':
        return '#ECFDF5';

      default:
        return '#F3F4F6';
    }
  };

  const getCategoryIconColor = (
    category: string,
  ) => {
    switch (category.toLowerCase()) {
      case 'food':
        return '#EA580C';

      case 'travel':
        return '#2563EB';

      case 'entertainment':
        return '#7C3AED';

      case 'groceries':
        return '#16A34A';

      default:
        return colors.primary;
    }
  };

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (total, expense) =>
          total +
          expense.transaction.amount,
        0,
      ),
    [expenses],
  );

  const averageExpense =
    expenses.length > 0
      ? totalSpent / expenses.length
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              Expenses
            </Text>

            <View style={styles.headerBadge}>
              <Ionicons
                name="receipt-outline"
                size={11}
                color={colors.primary}
              />

              <Text
                style={styles.headerBadgeText}
              >
                TRACKER
              </Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Track all your shared spending
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="receipt-outline"
            size={22}
            color={colors.primary}
          />

          {expenses.length > 0 && (
            <View style={styles.headerDot} />
          )}
        </View>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalLeft}>
          <Text style={styles.totalLabel}>
            TOTAL SHARED SPENDING
          </Text>

          <Text style={styles.totalAmount}>
            ₹{totalSpent.toFixed(0)}
          </Text>

          <View style={styles.totalMeta}>
            <View style={styles.metaIcon}>
              <Ionicons
                name="receipt-outline"
                size={12}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.totalDescription}>
              {expenses.length}{' '}
              {expenses.length === 1
                ? 'expense'
                : 'expenses'}{' '}
              tracked
            </Text>
          </View>
        </View>

        <View style={styles.totalIcon}>
          <Ionicons
            name="wallet-outline"
            size={27}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* Spending Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.summaryBlue,
            ]}
          >
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <Text style={styles.summaryLabel}>
            Average expense
          </Text>

          <Text style={styles.summaryValue}>
            ₹{averageExpense.toFixed(0)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIcon,
              styles.summaryGreen,
            ]}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color="#16A34A"
            />
          </View>

          <Text style={styles.summaryLabel}>
            Shared expenses
          </Text>

          <Text style={styles.summaryValue}>
            {expenses.length}
          </Text>
        </View>
      </View>

      {/* AI Detection Banner */}
      <View style={styles.aiBanner}>
        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.aiContent}>
          <View style={styles.aiTitleRow}>
            <Text style={styles.aiTitle}>
              AI-powered expense tracking
            </Text>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                ACTIVE
              </Text>
            </View>
          </View>

          <Text style={styles.aiText}>
            Payment alerts are analyzed to
            identify shared expenses.
          </Text>
        </View>
      </View>

      {/* Expense List Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent Expenses
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your latest shared payments
          </Text>
        </View>

        {expenses.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {expenses.length} total
            </Text>
          </View>
        )}
      </View>

      {/* Empty State */}
      {expenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="receipt-outline"
              size={31}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No expenses yet
          </Text>

          <Text style={styles.emptyText}>
            Split an expense from the Payment
            Inbox and it will appear here.
          </Text>

          <View style={styles.emptyHint}>
            <Ionicons
              name="sparkles-outline"
              size={14}
              color={colors.primary}
            />

            <Text style={styles.emptyHintText}>
              AI detected expenses will appear
              automatically
            </Text>
          </View>
        </View>
      ) : (
        expenses.map((expense) => {
          const transaction =
            expense.transaction;

          const participantCount =
            expense.participants.length;

          const perPerson =
            participantCount > 0
              ? transaction.amount /
                participantCount
              : transaction.amount;

          const iconName =
            getCategoryIcon(
              transaction.category,
            );

          const iconBackground =
            getCategoryBackground(
              transaction.category,
            );

          const iconColor =
            getCategoryIconColor(
              transaction.category,
            );

          return (
            <View
              key={expense.id}
              style={styles.expenseCard}
            >
              {/* Expense Top */}
              <View style={styles.expenseTopRow}>
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      backgroundColor:
                        iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={23}
                    color={iconColor}
                  />
                </View>

                <View
                  style={styles.expenseInfo}
                >
                  <Text
                    style={styles.merchant}
                    numberOfLines={1}
                  >
                    {transaction.merchant}
                  </Text>

                  <View
                    style={
                      styles.categoryRow
                    }
                  >
                    <View
                      style={
                        styles.categoryBadge
                      }
                    >
                      <Text
                        style={
                          styles.categoryBadgeText
                        }
                      >
                        {transaction.category}
                      </Text>
                    </View>

                    <View
                      style={styles.paidBadge}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={10}
                        color={colors.success}
                      />

                      <Text
                        style={
                          styles.paidBadgeText
                        }
                      >
                        Paid
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={
                    styles.amountContainer
                  }
                >
                  <Text style={styles.amount}>
                    ₹
                    {transaction.amount.toFixed(
                      0,
                    )}
                  </Text>

                  <Text
                    style={styles.perPerson}
                  >
                    ₹
                    {perPerson.toFixed(0)}
                    {' / person'}
                  </Text>
                </View>
              </View>

              {/* Expense Details */}
              <View
                style={styles.detailsContainer}
              >
                <View
                  style={styles.detailItem}
                >
                  <View
                    style={
                      styles.detailIcon
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={13}
                      color={
                        colors.secondaryText
                      }
                    />
                  </View>

                  <Text
                    style={styles.detailText}
                  >
                    Paid by{' '}
                    <Text
                      style={
                        styles.detailBold
                      }
                    >
                      {transaction.payer}
                    </Text>
                  </Text>
                </View>

                <View
                  style={styles.detailDivider}
                />

                <View
                  style={styles.detailItem}
                >
                  <View
                    style={
                      styles.detailIcon
                    }
                  >
                    <Ionicons
                      name="people-outline"
                      size={13}
                      color={
                        colors.secondaryText
                      }
                    />
                  </View>

                  <Text
                    style={styles.detailText}
                  >
                    {participantCount}{' '}
                    {participantCount === 1
                      ? 'person'
                      : 'people'}
                  </Text>
                </View>
              </View>

              {/* Participants */}
              <View
                style={
                  styles.participantsSection
                }
              >
                <View
                  style={
                    styles.participantsHeader
                  }
                >
                  <Text
                    style={
                      styles.participantsLabel
                    }
                  >
                    Split between
                  </Text>

                  <Text
                    style={
                      styles.participantsCount
                    }
                  >
                    {participantCount}{' '}
                    members
                  </Text>
                </View>

                <View
                  style={
                    styles.participantsRow
                  }
                >
                  {expense.participants
                    .slice(0, 4)
                    .map((person) => (
                      <View
                        key={person}
                        style={
                          styles.personChip
                        }
                      >
                        <View
                          style={
                            styles.personAvatar
                          }
                        >
                          <Text
                            style={
                              styles.personAvatarText
                            }
                          >
                            {person
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.personChipText
                          }
                        >
                          {person}
                        </Text>
                      </View>
                    ))}

                  {participantCount > 4 && (
                    <View
                      style={
                        styles.moreChip
                      }
                    >
                      <Text
                        style={
                          styles.moreChipText
                        }
                      >
                        +{participantCount - 4}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View
                  style={styles.detectedLabel}
                >
                  <View
                    style={
                      styles.detectedIcon
                    }
                  >
                    <Ionicons
                      name="sparkles"
                      size={11}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={styles.detectedText}
                  >
                    AI detected
                  </Text>
                </View>

                <View
                  style={styles.paymentMethodBadge}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={11}
                    color={
                      colors.secondaryText
                    }
                  />

                  <Text
                    style={
                      styles.paymentMethod
                    }
                  >
                    {transaction.paymentMethod ||
                      'UPI'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDelete(expense)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#DC2626"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Bottom Hint */}
      {expenses.length > 0 && (
        <View style={styles.bottomHint}>
          <Ionicons
            name="arrow-down-outline"
            size={13}
            color={colors.secondaryText}
          />

          <Text style={styles.bottomText}>
            Pull down to refresh your expenses
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: 29,
    fontWeight: '900',
    color: colors.text,
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    marginLeft: 8,
  },

  headerBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 3,
  },

  subtitle: {
    color: colors.secondaryText,
    fontSize: 13,
    marginTop: 4,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },

  headerDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    top: 7,
    right: 7,
  },

  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  totalLeft: {
    flex: 1,
  },

  totalLabel: {
    color: '#FFFFFF',
    opacity: 0.78,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  totalAmount: {
    color: '#FFFFFF',
    fontSize: 37,
    fontWeight: '900',
    marginTop: 5,
    letterSpacing: -0.5,
  },

  totalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  metaIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalDescription: {
    color: '#FFFFFF',
    opacity: 0.82,
    fontSize: 11,
    marginLeft: 5,
  },

  totalIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  summaryIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  summaryBlue: {
    backgroundColor: '#EFF6FF',
  },

  summaryGreen: {
    backgroundColor: '#F0FDF4',
  },

  summaryLabel: {
    fontSize: 10,
    color: colors.secondaryText,
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
    marginTop: 3,
  },

  aiBanner: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },

  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiContent: {
    flex: 1,
    marginLeft: 11,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  aiTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: colors.text,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    marginLeft: 6,
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 3,
  },

  activeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#15803D',
  },

  aiText: {
    fontSize: 10.5,
    color: colors.secondaryText,
    marginTop: 3,
    lineHeight: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 10.5,
    color: colors.secondaryText,
    marginTop: 3,
  },

  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  countText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
  },

  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  expenseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  expenseInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },

  merchant: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  categoryBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.primary,
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 5,
  },

  paidBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.success,
    marginLeft: 2,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },

  perPerson: {
    fontSize: 9.5,
    color: colors.secondaryText,
    marginTop: 3,
  },

  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    fontSize: 10.5,
    color: colors.secondaryText,
    marginLeft: 5,
  },

  detailBold: {
    fontWeight: '800',
    color: colors.text,
  },

  detailDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  participantsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  participantsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondaryText,
  },

  participantsCount: {
    fontSize: 9,
    color: colors.secondaryText,
  },

  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingRight: 8,
    paddingLeft: 4,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  personAvatar: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  personAvatarText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
  },

  personChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },

  moreChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 4,
  },

  moreChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  detectedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  detectedIcon: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detectedText: {
    fontSize: 9.5,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: 4,
  },

  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  paymentMethod: {
    fontSize: 9,
    color: colors.secondaryText,
    fontWeight: '700',
    marginLeft: 3,
  },

  deleteButton: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginTop: spacing.md,
  },

  emptyText: {
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    fontSize: 12,
  },

  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    marginTop: spacing.md,
  },

  emptyHintText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },

  bottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  bottomText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 10,
    marginLeft: 4,
  },
});