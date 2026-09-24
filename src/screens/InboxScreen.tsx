import React, { useState } from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '../theme/theme';

import { demoTransactions } from '../data/demoTransactions';
import { Transaction } from '../models/Transaction';

export default function InboxScreen({
  navigation,
}: any) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  /**
   * Local/mock AI explanation for hackathon prototype.
   */
  const getAIExplanation = (
    transaction: Transaction,
  ) => {
    switch (transaction.category) {
      case 'Food':
        return 'Restaurant and food payments are commonly shared among friends, roommates, and groups.';

      case 'Travel':
        return 'Cab and travel payments are commonly shared when multiple people travel together.';

      case 'Entertainment':
        return 'Movie and entertainment expenses are often shared among groups of friends.';

      case 'Groceries':
        return 'Grocery purchases can represent shared household or group expenses.';

      default:
        return 'This payment matches patterns commonly associated with shared group expenses.';
    }
  };

  /**
   * Category icon.
   */
  const getCategoryIcon = (
    category: string,
  ): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'Food':
        return 'restaurant-outline';

      case 'Travel':
        return 'car-outline';

      case 'Entertainment':
        return 'film-outline';

      case 'Groceries':
        return 'cart-outline';

      default:
        return 'card-outline';
    }
  };

  /**
   * Payment app based on transaction data.
   */
  const getPaymentApp = (
    transaction: Transaction,
  ) => {
    const message =
      transaction.rawMessage.toLowerCase();

    if (message.includes('phonepe')) {
      return 'PhonePe';
    }

    if (
      message.includes('gpay') ||
      message.includes('google pay')
    ) {
      return 'Google Pay';
    }

    return 'UPI';
  };

  const getCategoryBackground = (
    category: string,
  ) => {
    switch (category) {
      case 'Food':
        return '#FFF7ED';

      case 'Travel':
        return '#EFF6FF';

      case 'Entertainment':
        return '#F5F3FF';

      case 'Groceries':
        return '#ECFDF5';

      default:
        return '#F3F4F6';
    }
  };

  const renderTransaction = ({
    item,
  }: {
    item: Transaction;
  }) => {
    const paymentApp = getPaymentApp(item);

    return (
      <View style={styles.card}>
        {/* Unread Indicator */}
        <View style={styles.unreadDot} />

        {/* Payment Header */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  getCategoryBackground(
                    item.category,
                  ),
              },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.merchantRow}>
              <Text
                style={styles.merchant}
                numberOfLines={1}
              >
                {item.merchant}
              </Text>

              <View style={styles.successBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={colors.success}
                />

                <Text style={styles.successText}>
                  Paid
                </Text>
              </View>
            </View>

            <Text style={styles.date}>
              {item.date}
            </Text>
          </View>

          <Text style={styles.amount}>
            ₹{item.amount}
          </Text>
        </View>

        {/* Payment Source */}
        <View style={styles.paymentSource}>
          <View style={styles.sourceLeft}>
            <View style={styles.sourceIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={14}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.sourceText}>
                {paymentApp}
              </Text>

              <Text style={styles.sourceSubtext}>
                UPI payment
              </Text>
            </View>
          </View>

          <View style={styles.payerContainer}>
            <Text style={styles.payerLabel}>
              Paid by
            </Text>

            <Text style={styles.payerText}>
              {item.payer}
            </Text>
          </View>
        </View>

        {/* Original Payment Message */}
        <View style={styles.messageBox}>
          <View style={styles.messageHeader}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={14}
              color={colors.secondaryText}
            />

            <Text style={styles.messageLabel}>
              PAYMENT ALERT
            </Text>
          </View>

          <Text
            style={styles.message}
            numberOfLines={3}
          >
            {item.rawMessage}
          </Text>
        </View>

        {/* AI Detection */}
        <View style={styles.aiRow}>
          <TouchableOpacity
            style={styles.aiBadge}
            onPress={() =>
              setSelectedTransaction(item)
            }
          >
            <Ionicons
              name="sparkles"
              size={13}
              color={colors.success}
            />

            <Text style={styles.aiText}>
              AI detected
            </Text>
          </TouchableOpacity>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() =>
              setSelectedTransaction(item)
            }
          >
            <Text style={styles.viewAI}>
              Analyze
            </Text>

            <Ionicons
              name="chevron-forward"
              size={13}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Shared Expense Suggestion */}
        {item.isPotentialSharedExpense && (
          <View style={styles.sharedBox}>
            <View style={styles.sharedIcon}>
              <Ionicons
                name="sparkles"
                size={18}
                color={colors.primary}
              />
            </View>

            <View style={styles.sharedInfo}>
              <View style={styles.sharedTitleRow}>
                <Text style={styles.sharedTitle}>
                  Possible shared expense
                </Text>

                <View
                  style={styles.confidenceBadge}
                >
                  <Text
                    style={
                      styles.confidenceBadgeText
                    }
                  >
                    {item.aiConfidence}%
                  </Text>
                </View>
              </View>

              <Text style={styles.confidence}>
                AI confidence
              </Text>

              <Text style={styles.sharedHint}>
                Tap Split to divide this payment
              </Text>
            </View>

            <TouchableOpacity
              style={styles.splitButton}
              onPress={() =>
                navigation.navigate(
                  'SplitExpense',
                  {
                    transaction: item,
                  },
                )
              }
            >
              <Ionicons
                name="git-branch-outline"
                size={15}
                color="#FFFFFF"
              />

              <Text style={styles.splitText}>
                Split
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              Payment Inbox
            </Text>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                AI
              </Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Your UPI & SMS payment alerts
          </Text>
        </View>

        <View style={styles.notificationIcon}>
          <Ionicons
            name="notifications-outline"
            size={21}
            color={colors.primary}
          />

          <View style={styles.notificationDot} />
        </View>
      </View>

      {/* AI Information Banner */}
      <View style={styles.aiBanner}>
        <View style={styles.aiBannerIcon}>
          <Ionicons
            name="sparkles"
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.aiBannerInfo}>
          <View style={styles.aiBannerTitleRow}>
            <Text style={styles.aiBannerTitle}>
              AI Expense Detection
            </Text>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                ACTIVE
              </Text>
            </View>
          </View>

          <Text style={styles.aiBannerText}>
            SplitSnap analyzes payment alerts and
            identifies expenses that may be shared.
          </Text>
        </View>
      </View>

      {/* Inbox Label */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent Payments
          </Text>

          <Text style={styles.sectionSubtitle}>
            AI-ready payment alerts
          </Text>
        </View>

        <View style={styles.paymentCountBadge}>
          <Ionicons
            name="notifications-outline"
            size={12}
            color={colors.primary}
          />

          <Text style={styles.paymentCount}>
            {demoTransactions.length} alerts
          </Text>
        </View>
      </View>

      <FlatList
        data={demoTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      {/* AI Analysis Modal */}
      <Modal
        visible={selectedTransaction !== null}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSelectedTransaction(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIcon}>
                  <Ionicons
                    name="sparkles"
                    size={23}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text style={styles.modalTitle}>
                    AI Expense Analysis
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    SplitSnap AI detection
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setSelectedTransaction(null)
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>

            {/* Scrollable Modal Content */}
            {selectedTransaction && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                  styles.modalScrollContent
                }
              >
                {/* Detection Result */}
                <View style={styles.detectionCard}>
                  <View
                    style={styles.detectionIcon}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.success}
                    />
                  </View>

                  <View style={styles.detectionInfo}>
                    <View
                      style={
                        styles.detectionTitleRow
                      }
                    >
                      <Text
                        style={
                          styles.detectionTitle
                        }
                      >
                        Potential shared expense
                      </Text>

                      <Text
                        style={
                          styles.modalConfidence
                        }
                      >
                        {
                          selectedTransaction.aiConfidence
                        }
                        %
                      </Text>
                    </View>

                    <Text
                      style={styles.detectionText}
                    >
                      AI identified this payment as
                      something that may be shared
                      with a group.
                    </Text>
                  </View>
                </View>

                {/* Transaction Details */}
                <Text style={styles.detailsTitle}>
                  Payment Details
                </Text>

                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Merchant
                    </Text>

                    <Text
                      style={styles.detailValue}
                      numberOfLines={1}
                    >
                      {
                        selectedTransaction.merchant
                      }
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Amount
                    </Text>

                    <Text style={styles.detailValue}>
                      ₹{selectedTransaction.amount}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Category
                    </Text>

                    <Text style={styles.detailValue}>
                      {
                        selectedTransaction.category
                      }
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Paid by
                    </Text>

                    <Text style={styles.detailValue}>
                      {selectedTransaction.payer}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Payment Method
                    </Text>

                    <Text style={styles.detailValue}>
                      {getPaymentApp(
                        selectedTransaction,
                      )}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      styles.lastDetailRow,
                    ]}
                  >
                    <Text style={styles.detailLabel}>
                      Confidence
                    </Text>

                    <Text
                      style={[
                        styles.detailValue,
                        styles.confidenceValue,
                      ]}
                    >
                      {
                        selectedTransaction.aiConfidence
                      }
                      %
                    </Text>
                  </View>
                </View>

                {/* Why AI detected it */}
                <Text style={styles.detailsTitle}>
                  Why was this detected?
                </Text>

                <View style={styles.explanationCard}>
                  <View style={styles.bulbIcon}>
                    <Ionicons
                      name="bulb-outline"
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={styles.explanationText}
                  >
                    {getAIExplanation(
                      selectedTransaction,
                    )}
                  </Text>
                </View>

                {/* Original message */}
                <Text style={styles.detailsTitle}>
                  Source Payment Alert
                </Text>

                <View style={styles.sourceCard}>
                  <View style={styles.sourceCardHeader}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color={colors.secondaryText}
                    />

                    <Text
                      style={
                        styles.sourceCardLabel
                      }
                    >
                      Original alert
                    </Text>
                  </View>

                  <Text style={styles.sourceMessage}>
                    {
                      selectedTransaction.rawMessage
                    }
                  </Text>
                </View>

                {/* Split Button */}
                {selectedTransaction.isPotentialSharedExpense && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.modalSplitButton}
                    onPress={() => {
                      const transaction =
                        selectedTransaction;

                      setSelectedTransaction(null);

                      navigation.navigate(
                        'SplitExpense',
                        {
                          transaction,
                        },
                      );
                    }}
                  >
                    <Ionicons
                      name="git-branch-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.modalSplitText}
                    >
                      Split This Expense
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                )}

                <View style={styles.modalBottomSpace} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },

  headerBadge: {
    marginLeft: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },

  headerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
  },

  subtitle: {
    color: colors.secondaryText,
    marginTop: 4,
    fontSize: 13,
  },

  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: colors.card,
  },

  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  aiBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiBannerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  aiBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 7,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },

  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.success,
  },

  aiBannerText: {
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 16,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },

  sectionSubtitle: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },

  paymentCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },

  paymentCount: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4,
  },

  list: {
    paddingBottom: 100,
  },

  card: {
    position: 'relative',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: 5,
  },

  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  merchant: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    flexShrink: 1,
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },

  successText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.success,
    marginLeft: 2,
  },

  date: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 4,
  },

  amount: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    marginLeft: 4,
  },

  paymentSource: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },

  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sourceIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  sourceText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },

  sourceSubtext: {
    fontSize: 9,
    color: colors.secondaryText,
    marginTop: 1,
  },

  payerContainer: {
    alignItems: 'flex-end',
  },

  payerLabel: {
    fontSize: 8,
    color: colors.secondaryText,
  },

  payerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },

  messageBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  messageLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.secondaryText,
    marginLeft: 4,
    letterSpacing: 0.4,
  },

  message: {
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 17,
  },

  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  aiBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    marginLeft: 4,
  },

  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.secondaryText,
  },

  analyzeButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 5,
  },

  viewAI: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
  },

  sharedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

  sharedIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sharedInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: 6,
  },

  sharedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  sharedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },

  confidenceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 5,
  },

  confidenceBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#15803D',
  },

  confidence: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },

  sharedHint: {
    fontSize: 9,
    color: colors.secondaryText,
    marginTop: 2,
  },

  splitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  splitText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '92%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginLeft: spacing.sm,
  },

  modalSubtitle: {
    fontSize: 10,
    color: colors.secondaryText,
    marginLeft: spacing.sm,
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalScrollContent: {
    paddingBottom: spacing.md,
  },

  detectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  detectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detectionInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  detectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
  },

  modalConfidence: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.success,
    marginLeft: 8,
  },

  detectionText: {
    fontSize: 10.5,
    color: colors.secondaryText,
    lineHeight: 16,
    marginTop: 3,
  },

  detailsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastDetailRow: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },

  confidenceValue: {
    color: colors.success,
  },

  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  bulbIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  explanationText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },

  sourceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  sourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  sourceCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondaryText,
    marginLeft: 5,
  },

  sourceMessage: {
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 17,
  },

  modalSplitButton: {
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  modalSplitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },

  modalBottomSpace: {
    height: 20,
  },
});