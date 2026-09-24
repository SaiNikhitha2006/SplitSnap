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
import { useFocusEffect } from '@react-navigation/native';

import { colors, spacing } from '../theme/theme';
import {
  getExpenses,
  SharedExpense,
} from '../services/expenseStore';

interface CategoryData {
  name: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function AnalyticsScreen() {
  const [expenses, setExpenses] = useState<
    SharedExpense[]
  >([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(
        'Failed to load analytics:',
        error,
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, []),
  );

  const analytics = useMemo(() => {
    let total = 0;

    const categoryTotals: Record<
      string,
      number
    > = {};

    expenses.forEach((expense) => {
      const amount =
        Number(expense.transaction.amount) || 0;

      total += amount;

      const category =
        expense.transaction.category ||
        'Other';

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        amount;
    });

    const categoryData: CategoryData[] =
      Object.entries(categoryTotals)
        .map(([name, amount]) => ({
          name,
          amount,
          icon: getCategoryIcon(name),
        }))
        .sort((a, b) => b.amount - a.amount);

    const highestCategory =
      categoryData.length > 0
        ? categoryData[0]
        : null;

    const average =
      expenses.length > 0
        ? total / expenses.length
        : 0;

    return {
      total,
      count: expenses.length,
      average,
      categoryData,
      highestCategory,
    };
  }, [expenses]);

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadExpenses();

    setRefreshing(false);
  };

  const getPercentage = (
    amount: number,
  ) => {
    if (analytics.total === 0) {
      return 0;
    }

    return (amount / analytics.total) * 100;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
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
          <View>
            <Text style={styles.title}>
              Analytics
            </Text>

            <Text style={styles.subtitle}>
              Understand your shared spending
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart"
              size={24}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Main Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.totalContent}>
            <Text style={styles.totalLabel}>
              Total Shared Spending
            </Text>

            <Text style={styles.totalAmount}>
              ₹{analytics.total.toFixed(2)}
            </Text>

            <Text style={styles.totalDescription}>
              Across all saved shared expenses
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    '#EFF6FF',
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {analytics.count}
            </Text>

            <Text style={styles.summaryLabel}>
              Expenses
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor:
                    '#F0FDF4',
                },
              ]}
            >
              <Ionicons
                name="calculator-outline"
                size={20}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryValue}>
              ₹{analytics.average.toFixed(0)}
            </Text>

            <Text style={styles.summaryLabel}>
              Average Expense
            </Text>
          </View>
        </View>

        {/* Highest Category */}
        {analytics.highestCategory && (
          <View style={styles.highlightCard}>
            <View style={styles.highlightIcon}>
              <Ionicons
                name="trophy-outline"
                size={22}
                color="#CA8A04"
              />
            </View>

            <View style={styles.highlightContent}>
              <Text style={styles.highlightLabel}>
                Highest Spending Category
              </Text>

              <Text style={styles.highlightTitle}>
                {analytics.highestCategory.name}
              </Text>

              <Text style={styles.highlightAmount}>
                ₹
                {analytics.highestCategory.amount.toFixed(
                  2,
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Spending by Category
            </Text>

            <Text style={styles.sectionSubtitle}>
              Where your shared money goes
            </Text>
          </View>
        </View>

        {analytics.categoryData.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={30}
                color={colors.secondaryText}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No analytics yet
            </Text>

            <Text style={styles.emptyText}>
              Add shared expenses to see your
              spending analytics here.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryCard}>
            {analytics.categoryData.map(
              (category, index) => {
                const percentage =
                  getPercentage(
                    category.amount,
                  );

                return (
                  <View
                    key={category.name}
                    style={[
                      styles.categoryItem,
                      index !==
                        analytics.categoryData
                          .length -
                          1 &&
                        styles.categoryBorder,
                    ]}
                  >
                    <View
                      style={styles.categoryTop}
                    >
                      <View
                        style={
                          styles.categoryLeft
                        }
                      >
                        <View
                          style={
                            styles.categoryIcon
                          }
                        >
                          <Ionicons
                            name={
                              category.icon
                            }
                            size={20}
                            color={
                              colors.primary
                            }
                          />
                        </View>

                        <View>
                          <Text
                            style={
                              styles.categoryName
                            }
                          >
                            {category.name}
                          </Text>

                          <Text
                            style={
                              styles.categoryPercentage
                            }
                          >
                            {percentage.toFixed(
                              1,
                            )}
                            % of total
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={
                          styles.categoryAmount
                        }
                      >
                        ₹
                        {category.amount.toFixed(
                          2,
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.progressBackground
                      }
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(
                              percentage,
                              100,
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              },
            )}
          </View>
        )}

        {/* Insights */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Spending Insights
            </Text>

            <Text style={styles.sectionSubtitle}>
              Quick facts from your expenses
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <InsightRow
            icon="trending-up-outline"
            title="Total expenses"
            value={`${analytics.count}`}
            description="shared expenses recorded"
          />

          <InsightRow
            icon="cash-outline"
            title="Average expense"
            value={`₹${analytics.average.toFixed(
              0,
            )}`}
            description="per shared expense"
          />

          <InsightRow
            icon="layers-outline"
            title="Categories"
            value={`${analytics.categoryData.length}`}
            description="different spending categories"
          />

          {analytics.highestCategory && (
            <InsightRow
              icon="star-outline"
              title="Top category"
              value={
                analytics.highestCategory.name
              }
              description="highest spending category"
            />
          )}
        </View>

        {/* Demo Note */}
        <View style={styles.demoCard}>
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={colors.primary}
          />

          <View style={styles.demoContent}>
            <Text style={styles.demoTitle}>
              AI-powered spending insights
            </Text>

            <Text style={styles.demoText}>
              Analytics are generated from the
              expenses detected and saved by
              SplitSnap.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getCategoryIcon(
  category: string,
): keyof typeof Ionicons.glyphMap {
  const value = category.toLowerCase();

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

  return 'grid-outline';
}

function InsightRow({
  icon,
  title,
  value,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <View style={styles.insightRow}>
      <View style={styles.insightIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={colors.primary}
        />
      </View>

      <View style={styles.insightMiddle}>
        <Text style={styles.insightTitle}>
          {title}
        </Text>

        <Text style={styles.insightDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.insightValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.secondaryText,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  totalIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  totalContent: {
    flex: 1,
  },

  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondaryText,
  },

  totalAmount: {
    marginTop: 3,
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },

  totalDescription: {
    marginTop: 2,
    fontSize: 12,
    color: colors.secondaryText,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  summaryValue: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.text,
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 12,
    color: colors.secondaryText,
  },

  highlightCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  highlightIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  highlightContent: {
    flex: 1,
  },

  highlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },

  highlightTitle: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '900',
    color: '#78350F',
  },

  highlightAmount: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.secondaryText,
  },

  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  categoryItem: {
    paddingVertical: 16,
  },

  categoryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },

  categoryPercentage: {
    marginTop: 2,
    fontSize: 11,
    color: colors.secondaryText,
  },

  categoryAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },

  progressBackground: {
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: colors.secondaryText,
  },

  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  insightMiddle: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },

  insightDescription: {
    marginTop: 2,
    fontSize: 11,
    color: colors.secondaryText,
  },

  insightValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },

  demoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 15,
    marginTop: 2,
  },

  demoContent: {
    flex: 1,
    marginLeft: 10,
  },

  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },

  demoText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: colors.secondaryText,
  },
});