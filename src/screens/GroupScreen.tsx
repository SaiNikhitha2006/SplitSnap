import React, {
  useCallback,
  useState,
} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
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

import {
  Balance,
  calculateBalances,
} from '../services/balanceService';

import {
  Settlement,
  calculateSettlements,
} from '../services/settlementService';

import {
  addGroupMember,
  getGroupMembers,
  removeGroupMember,
} from '../services/groupService';

export default function GroupScreen() {
  const [expenses, setExpenses] = useState<
    SharedExpense[]
  >([]);

  const [balances, setBalances] = useState<
    Balance[]
  >([]);

  const [settlements, setSettlements] =
    useState<Settlement[]>([]);

  const [paidSettlements, setPaidSettlements] =
    useState<string[]>([]);

  const [groupMembers, setGroupMembers] =
    useState<string[]>([]);

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [newMemberName, setNewMemberName] =
    useState('');

  const loadData = useCallback(async () => {
    try {
      const savedExpenses =
        await getExpenses();

      const savedMembers =
        await getGroupMembers();

      setExpenses(savedExpenses);
      setGroupMembers(savedMembers);

      if (savedExpenses.length === 0) {
        setBalances([]);
        setSettlements([]);
        setPaidSettlements([]);
        return;
      }

      const combined: Record<
        string,
        number
      > = {};

      /*
       * Calculate balances for every
       * saved expense.
       *
       * expense.amounts contains the
       * exact custom/equal split.
       */
      savedExpenses.forEach((expense) => {
        const expenseBalances =
          calculateBalances(
            expense.transaction,
            expense.participants,
            expense.amounts,
          );

        expenseBalances.forEach(
          (balance) => {
            combined[balance.person] =
              (combined[balance.person] || 0) +
              balance.amount;
          },
        );
      });

      const finalBalances =
        Object.entries(combined).map(
          ([person, amount]) => ({
            person,
            amount: Number(
              amount.toFixed(2),
            ),
          }),
        );

      setBalances(finalBalances);

      const finalSettlements =
        calculateSettlements(
          finalBalances,
        );

      setSettlements(finalSettlements);

      /*
       * Keep only payments that still exist.
       */
      setPaidSettlements((current) =>
        current.filter((id) =>
          finalSettlements.some(
            (settlement) =>
              `${settlement.from}-${settlement.to}-${settlement.amount}` ===
              id,
          ),
        ),
      );
    } catch (error) {
      console.error(
        'Failed to load group data:',
        error,
      );

      setExpenses([]);
      setBalances([]);
      setSettlements([]);
      setPaidSettlements([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const yourBalance =
    balances.find(
      (item) => item.person === 'Sai',
    )?.amount || 0;

  /*
   * Total amount involved in settlement.
   */
  const totalSettlementAmount =
    settlements.reduce(
      (total, settlement) =>
        total + settlement.amount,
      0,
    );

  /*
   * Number of unpaid settlements.
   */
  const unpaidSettlementCount =
    settlements.filter((settlement) => {
      const paymentId =
        `${settlement.from}-${settlement.to}-${settlement.amount}`;

      return !paidSettlements.includes(
        paymentId,
      );
    }).length;

  /*
   * Number of completed settlements.
   */
  const paidSettlementCount =
    settlements.length -
    unpaidSettlementCount;

  /**
   * Add a new group member
   */
  const handleAddMember = async () => {
    const name = newMemberName.trim();

    if (!name) {
      Alert.alert(
        'Enter a name',
        'Please enter the member name.',
      );
      return;
    }

    if (
      name.toLowerCase() === 'sai'
    ) {
      Alert.alert(
        'Member already exists',
        'Sai is already part of the group.',
      );
      return;
    }

    const success =
      await addGroupMember(name);

    if (!success) {
      Alert.alert(
        'Member already exists',
        `${name} is already in the group.`,
      );
      return;
    }

    const updatedMembers =
      await getGroupMembers();

    setGroupMembers(updatedMembers);
    setNewMemberName('');
    setShowAddMember(false);

    Alert.alert(
      'Member Added',
      `${name} has been added to Trip Squad.`,
    );
  };

  /**
   * Remove a group member
   */
  const handleRemoveMember = (
    member: string,
  ) => {
    if (member === 'Sai') {
      Alert.alert(
        'Cannot remove Sai',
        'Sai is the current user of this SplitSnap account.',
      );
      return;
    }

    Alert.alert(
      'Remove Member',
      `Remove ${member} from Trip Squad?\n\nExisting expenses involving ${member} will not be deleted.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success =
              await removeGroupMember(
                member,
              );

            if (!success) {
              Alert.alert(
                'Error',
                'Could not remove this member.',
              );
              return;
            }

            const updatedMembers =
              await getGroupMembers();

            setGroupMembers(
              updatedMembers,
            );

            Alert.alert(
              'Member Removed',
              `${member} has been removed from Trip Squad.`,
            );
          },
        },
      ],
    );
  };

  /**
   * Simulated payment reminder
   */
  const handleRemind = (
    settlement: Settlement,
  ) => {
    Alert.alert(
      'Reminder Sent',
      `${settlement.from} has been reminded to pay ₹${settlement.amount.toFixed(
        2,
      )} to ${settlement.to}.\n\nThis is a simulated reminder for the hackathon demo.`,
      [
        {
          text: 'OK',
        },
      ],
    );
  };

  /**
   * Simulated UPI payment
   */
  const handlePay = (
    settlement: Settlement,
  ) => {
    const paymentId =
      `${settlement.from}-${settlement.to}-${settlement.amount}`;

    Alert.alert(
      'UPI Payment',
      `${settlement.from} pays ${settlement.to}\n\nAmount: ₹${settlement.amount.toFixed(
        2,
      )}\n\nThis is a simulated UPI payment for the hackathon demo.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Pay ₹${settlement.amount.toFixed(
            2,
          )}`,
          onPress: () => {
            setPaidSettlements(
              (current) => {
                if (
                  current.includes(paymentId)
                ) {
                  return current;
                }

                return [
                  ...current,
                  paymentId,
                ];
              },
            );

            Alert.alert(
              'Payment Successful',
              `₹${settlement.amount.toFixed(
                2,
              )} paid to ${settlement.to} successfully.`,
            );
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              Group Balance
            </Text>

            <Text style={styles.subtitle}>
              Trip Squad · {groupMembers.length}{' '}
              members
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="people-outline"
              size={23}
              color={colors.primary}
            />
          </View>
        </View>

        {/* Your Balance */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text
                style={styles.summaryLabel}
              >
                Your overall balance
              </Text>

              <Text
                style={styles.summaryAmount}
              >
                {yourBalance >= 0
                  ? '+'
                  : '-'}
                ₹
                {Math.abs(
                  yourBalance,
                ).toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name={
                  yourBalance > 0
                    ? 'arrow-down-outline'
                    : yourBalance < 0
                      ? 'arrow-up-outline'
                      : 'checkmark-outline'
                }
                size={24}
                color={colors.primary}
              />
            </View>
          </View>

          <Text
            style={
              styles.summaryDescription
            }
          >
            {yourBalance > 0
              ? `You are owed ₹${yourBalance.toFixed(
                  2,
                )} by your group`
              : yourBalance < 0
                ? `You owe ₹${Math.abs(
                    yourBalance,
                  ).toFixed(2)}`
                : 'You are all settled up'}
          </Text>
        </View>

        {/* Group Members */}
        <View style={styles.memberSection}>
          <View style={styles.memberHeader}>
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Group Members
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Manage your Trip Squad
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                setShowAddMember(true)
              }
            >
              <Ionicons
                name="person-add-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={styles.addButtonText}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.memberCard}>
            {groupMembers.map(
              (member, index) => {
                const isCurrentUser =
                  member === 'Sai';

                return (
                  <View
                    key={member}
                    style={[
                      styles.memberRow,
                      index ===
                        groupMembers.length -
                          1 &&
                        styles.lastMemberRow,
                    ]}
                  >
                    <View
                      style={
                        styles.memberAvatar
                      }
                    >
                      <Text
                        style={
                          styles.memberAvatarText
                        }
                      >
                        {member
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.memberInfo
                      }
                    >
                      <Text
                        style={
                          styles.memberName
                        }
                      >
                        {member}
                      </Text>

                      <Text
                        style={
                          styles.memberRole
                        }
                      >
                        {isCurrentUser
                          ? 'You'
                          : 'Group member'}
                      </Text>
                    </View>

                    {!isCurrentUser && (
                      <TouchableOpacity
                        style={
                          styles.removeButton
                        }
                        onPress={() =>
                          handleRemoveMember(
                            member,
                          )
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color="#DC2626"
                        />

                        <Text
                          style={
                            styles.removeButtonText
                          }
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              },
            )}
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Who owes whom?
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Based on your shared expenses
            </Text>
          </View>
        </View>

        {balances.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="wallet-outline"
                size={30}
                color={colors.primary}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No shared expenses yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Split an expense from the
              Payment Inbox to see
              everyone's balance here.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {balances.map((balance, index) => {
              const isPositive =
                balance.amount > 0.01;

              const isNegative =
                balance.amount < -0.01;

              return (
                <View
                  key={balance.person}
                  style={[
                    styles.balanceRow,
                    index ===
                      balances.length - 1 &&
                      styles.lastBalanceRow,
                  ]}
                >
                  <View
                    style={styles.avatar}
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {balance.person.charAt(
                        0,
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.personInfo
                    }
                  >
                    <Text
                      style={
                        styles.personName
                      }
                    >
                      {balance.person}
                    </Text>

                    <Text
                      style={
                        styles.balanceLabel
                      }
                    >
                      {isPositive
                        ? 'gets back'
                        : isNegative
                          ? 'owes the group'
                          : 'settled'}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.balanceAmount,
                      isPositive &&
                        styles.positive,
                      isNegative &&
                        styles.negative,
                    ]}
                  >
                    {isPositive
                      ? '+'
                      : isNegative
                        ? '-'
                        : ''}
                    ₹
                    {Math.abs(
                      balance.amount,
                    ).toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Smart Settlement */}
        {settlements.length > 0 && (
          <View style={styles.smartSection}>
            {/* Smart Settlement Header */}
            <View style={styles.smartHeader}>
              <View>
                <View
                  style={
                    styles.smartTitleRow
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Smart Settlement
                  </Text>

                  <View
                    style={
                      styles.smartBadge
                    }
                  >
                    <Ionicons
                      name="sparkles"
                      size={11}
                      color={colors.primary}
                    />

                    <Text
                      style={
                        styles.smartBadgeText
                      }
                    >
                      SMART
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.smartSubtitle
                  }
                >
                  Minimum repayments required
                </Text>
              </View>

              <View
                style={styles.smartIcon}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>
            </View>

            {/* Settlement Summary */}
            <View
              style={styles.settlementSummary}
            >
              <View
                style={
                  styles.settlementSummaryItem
                }
              >
                <View
                  style={
                    styles.summaryMiniIcon
                  }
                >
                  <Ionicons
                    name="swap-horizontal-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.summaryMiniLabel
                    }
                  >
                    Repayments
                  </Text>

                  <Text
                    style={
                      styles.summaryMiniValue
                    }
                  >
                    {settlements.length}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.settlementSummaryItem
                }
              >
                <View
                  style={
                    styles.summaryMiniIcon
                  }
                >
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.summaryMiniLabel
                    }
                  >
                    Total to settle
                  </Text>

                  <Text
                    style={
                      styles.summaryMiniValue
                    }
                  >
                    ₹
                    {totalSettlementAmount.toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Smart Explanation */}
            <View
              style={styles.smartExplanation}
            >
              <Ionicons
                name="bulb-outline"
                size={19}
                color={colors.primary}
              />

              <Text
                style={
                  styles.smartExplanationText
                }
              >
                SplitSnap has optimized the
                balances to reduce unnecessary
                repayments.
              </Text>
            </View>

            {/* Settlement Status */}
            {paidSettlementCount > 0 && (
              <View
                style={styles.progressCard}
              >
                <View
                  style={
                    styles.progressHeader
                  }
                >
                  <Text
                    style={
                      styles.progressTitle
                    }
                  >
                    Settlement progress
                  </Text>

                  <Text
                    style={
                      styles.progressCount
                    }
                  >
                    {paidSettlementCount}/
                    {settlements.length} paid
                  </Text>
                </View>

                <View
                  style={
                    styles.progressTrack
                  }
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          settlements.length ===
                          0
                            ? 0
                            : (paidSettlementCount /
                                settlements.length) *
                              100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Settlement Cards */}
            {settlements.map(
              (
                settlement,
                index,
              ) => {
                const paymentId =
                  `${settlement.from}-${settlement.to}-${settlement.amount}`;

                const isPaid =
                  paidSettlements.includes(
                    paymentId,
                  );

                return (
                  <View
                    key={`${settlement.from}-${settlement.to}-${index}`}
                    style={[
                      styles.settlementCard,
                      isPaid &&
                        styles.paidSettlementCard,
                    ]}
                  >
                    {/* Payment Route */}
                    <View
                      style={
                        styles.routeSection
                      }
                    >
                      <View
                        style={
                          styles.routeAvatar
                        }
                      >
                        <Text
                          style={
                            styles.routeAvatarText
                          }
                        >
                          {settlement.from
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.routeLineContainer
                        }
                      >
                        <View
                          style={
                            styles.routeLine
                          }
                        />

                        <View
                          style={
                            styles.routeArrow
                          }
                        >
                          <Ionicons
                            name="arrow-forward"
                            size={13}
                            color={
                              colors.primary
                            }
                          />
                        </View>
                      </View>

                      <View
                        style={[
                          styles.routeAvatar,
                          styles.routeAvatarTo,
                        ]}
                      >
                        <Text
                          style={
                            styles.routeAvatarText
                          }
                        >
                          {settlement.to
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Payment Information */}
                    <View
                      style={
                        styles.settlementInfo
                      }
                    >
                      <View
                        style={
                          styles.paymentPeopleRow
                        }
                      >
                        <Text
                          style={
                            styles.settlementText
                          }
                        >
                          {settlement.from}
                        </Text>

                        <Text
                          style={
                            styles.paysText
                          }
                        >
                          pays
                        </Text>

                        <Text
                          style={
                            styles.settlementText
                          }
                        >
                          {settlement.to}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.settlementAmount
                        }
                      >
                        ₹
                        {settlement.amount.toFixed(
                          2,
                        )}
                      </Text>

                      <Text
                        style={
                          styles.settlementHint
                        }
                      >
                        Simulated UPI settlement
                      </Text>
                    </View>

                    {/* Payment Actions */}
                    <View style={styles.paymentActions}>
                      {!isPaid && (
                        <TouchableOpacity
                          style={styles.remindButton}
                          onPress={() =>
                            handleRemind(settlement)
                          }
                        >
                          <Ionicons
                            name="notifications-outline"
                            size={17}
                            color={colors.primary}
                          />

                          <Text
                            style={styles.remindButtonText}
                          >
                            Remind
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.payButton,
                          isPaid && styles.paidButton,
                          !isPaid && styles.payButtonWithReminder,
                        ]}
                        onPress={() =>
                          !isPaid &&
                          handlePay(settlement)
                        }
                        disabled={isPaid}
                      >
                        <Ionicons
                          name={
                            isPaid
                              ? 'checkmark-circle'
                              : 'arrow-up-circle-outline'
                          }
                          size={17}
                          color="#FFFFFF"
                        />

                        <Text
                          style={styles.payButtonText}
                        >
                          {isPaid ? 'Paid' : 'Pay'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              },
            )}

            {/* All Settled Message */}
            {unpaidSettlementCount === 0 &&
              settlements.length > 0 && (
                <View
                  style={
                    styles.allSettledCard
                  }
                >
                  <View
                    style={
                      styles.allSettledIcon
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colors.success}
                    />
                  </View>

                  <View
                    style={
                      styles.allSettledInfo
                    }
                  >
                    <Text
                      style={
                        styles.allSettledTitle
                      }
                    >
                      All settled!
                    </Text>

                    <Text
                      style={
                        styles.allSettledText
                      }
                    >
                      All simulated repayments
                      have been completed.
                    </Text>
                  </View>
                </View>
              )}
          </View>
        )}

        {/* Expense Count */}
        {expenses.length > 0 && (
          <View
            style={styles.expenseCount}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={
                colors.secondaryText
              }
            />

            <Text
              style={
                styles.expenseCountText
              }
            >
              {expenses.length}{' '}
              {expenses.length === 1
                ? 'shared expense'
                : 'shared expenses'}{' '}
              tracked
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMember}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowAddMember(false)
        }
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.modalCard}>
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Add Group Member
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Add someone to Trip Squad
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowAddMember(false);
                  setNewMemberName('');
                }}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              value={newMemberName}
              onChangeText={
                setNewMemberName
              }
              placeholder="Enter member name"
              placeholderTextColor={
                colors.secondaryText
              }
              style={styles.nameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={
                handleAddMember
              }
            />

            <View
              style={styles.modalActions}
            >
              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() => {
                  setShowAddMember(false);
                  setNewMemberName('');
                }}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.confirmAddButton
                }
                onPress={
                  handleAddMember
                }
              >
                <Ionicons
                  name="person-add-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.confirmAddButtonText
                  }
                >
                  Add Member
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.md,
    paddingBottom: 60,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },

  subtitle: {
    color: colors.secondaryText,
    marginTop: 4,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },

  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 13,
  },

  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 8,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
  },

  memberSection: {
    marginTop: spacing.lg,
  },

  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  memberCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.md,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastMemberRow: {
    borderBottomWidth: 0,
  },

  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },

  memberInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  memberRole: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },

  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },

  sectionHeader: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },

  sectionSubtitle: {
    color: colors.secondaryText,
    fontSize: 12,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.md,
  },

  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  lastBalanceRow: {
    borderBottomWidth: 0,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },

  personInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  balanceLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },

  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.secondaryText,
  },

  positive: {
    color: colors.success,
  },

  negative: {
    color: '#DC2626',
  },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.md,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },

  emptyText: {
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },

  /* Smart Settlement */

  smartSection: {
    marginTop: spacing.xl,
  },

  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  smartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  smartSubtitle: {
    color: colors.secondaryText,
    fontSize: 12,
  },

  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 7,
  },

  smartBadgeText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    marginLeft: 3,
  },

  smartIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settlementSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },

  settlementSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryMiniIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  summaryMiniLabel: {
    fontSize: 10,
    color: colors.secondaryText,
  },

  summaryMiniValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },

  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },

  smartExplanation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  smartExplanationText: {
    flex: 1,
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 17,
    marginLeft: 7,
  },

  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },

  progressCount: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 7,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },

  settlementCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },

  paidSettlementCard: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },

  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  routeAvatarTo: {
    backgroundColor: '#DCFCE7',
  },

  routeAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },

  routeLineContainer: {
    width: 55,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  routeLine: {
    position: 'absolute',
    left: 3,
    right: 3,
    height: 1,
    backgroundColor: colors.border,
  },

  routeArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settlementInfo: {
    marginTop: spacing.sm,
  },

  paymentPeopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settlementText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },

  paysText: {
    fontSize: 11,
    color: colors.secondaryText,
    marginHorizontal: 5,
  },

  settlementAmount: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },

  settlementHint: {
    fontSize: 9,
    color: colors.secondaryText,
    marginTop: 2,
  },

  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },

  remindButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  remindButtonText: {
    color: colors.primary,
    fontWeight: '800',
    marginLeft: 5,
  },

  payButtonWithReminder: {
    flex: 1,
  },

  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  paidButton: {
    backgroundColor: colors.success,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginLeft: 5,
  },

  allSettledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: spacing.md,
    marginTop: spacing.sm,
  },

  allSettledIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  allSettledInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  allSettledTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },

  allSettledText: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },

  expenseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },

  expenseCountText: {
    color: colors.secondaryText,
    marginLeft: 6,
    fontSize: 12,
  },

  /* Add Member Modal */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  modalSubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },

  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: spacing.lg,
    fontSize: 15,
    color: colors.text,
    backgroundColor:
      colors.background,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.md,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: colors.text,
    fontWeight: '700',
  },

  confirmAddButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  confirmAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});