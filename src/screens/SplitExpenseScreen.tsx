import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '../theme/theme';

import { addExpense } from '../services/expenseStore';

import {
  getGroupMembers,
} from '../services/groupService';

type SplitMode = 'equal' | 'custom';

export default function SplitExpenseScreen({
  route,
  navigation,
}: any) {
  const transaction =
    route.params?.transaction;

  const [members, setMembers] =
    useState<string[]>([]);

  const [selectedMembers, setSelectedMembers] =
    useState<string[]>(['Sai']);

  const [splitMode, setSplitMode] =
    useState<SplitMode>('equal');

  const [customAmounts, setCustomAmounts] =
    useState<Record<string, string>>({});

  const [isSaving, setIsSaving] =
    useState(false);

  const loadGroupMembers = useCallback(
    async () => {
      try {
        const savedMembers =
          await getGroupMembers();

        setMembers(savedMembers);

        if (savedMembers.includes('Sai')) {
          setSelectedMembers(['Sai']);
        } else if (
          savedMembers.length > 0
        ) {
          setSelectedMembers([
            savedMembers[0],
          ]);
        } else {
          setSelectedMembers([]);
        }

        setCustomAmounts({});
        setSplitMode('equal');
      } catch (error) {
        console.error(
          'Failed to load group members:',
          error,
        );

        setMembers(['Sai']);
        setSelectedMembers(['Sai']);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadGroupMembers();
    }, [loadGroupMembers]),
  );

  const toggleMember = (
    member: string,
  ) => {
    setSelectedMembers((current) => {
      if (current.includes(member)) {
        if (current.length === 1) {
          return current;
        }

        setCustomAmounts((amounts) => {
          const updated = {
            ...amounts,
          };

          delete updated[member];

          return updated;
        });

        return current.filter(
          (name) => name !== member,
        );
      }

      if (splitMode === 'custom') {
        setCustomAmounts((amounts) => ({
          ...amounts,
          [member]: '0.00',
        }));
      }

      return [...current, member];
    });
  };

  const amountPerPerson = useMemo(() => {
    if (
      !transaction ||
      selectedMembers.length === 0
    ) {
      return 0;
    }

    return (
      transaction.amount /
      selectedMembers.length
    );
  }, [
    transaction,
    selectedMembers,
  ]);

  const customTotal = useMemo(() => {
    return selectedMembers.reduce(
      (total, member) => {
        const value = parseFloat(
          customAmounts[member] || '0',
        );

        return (
          total +
          (isNaN(value) ? 0 : value)
        );
      },
      0,
    );
  }, [
    selectedMembers,
    customAmounts,
  ]);

  const remainingAmount = useMemo(() => {
    if (!transaction) {
      return 0;
    }

    return Number(
      (
        transaction.amount -
        customTotal
      ).toFixed(2),
    );
  }, [
    transaction,
    customTotal,
  ]);

  const isCustomSplitValid =
    useMemo(() => {
      if (!transaction) {
        return false;
      }

      return (
        Math.abs(
          customTotal -
            transaction.amount,
        ) < 0.01
      );
    }, [
      customTotal,
      transaction,
    ]);

  const handleCustomAmountChange = (
    member: string,
    value: string,
  ) => {
    const cleanedValue =
      value.replace(
        /[^0-9.]/g,
        '',
      );

    setCustomAmounts(
      (current) => ({
        ...current,
        [member]: cleanedValue,
      }),
    );
  };

  const switchSplitMode = (
    mode: SplitMode,
  ) => {
    setSplitMode(mode);

    if (mode === 'custom') {
      const equalAmount =
        transaction &&
        selectedMembers.length > 0
          ? (
              transaction.amount /
              selectedMembers.length
            ).toFixed(2)
          : '0.00';

      const initialAmounts: Record<
        string,
        string
      > = {};

      selectedMembers.forEach(
        (member) => {
          initialAmounts[member] =
            equalAmount;
        },
      );

      setCustomAmounts(
        initialAmounts,
      );
    } else {
      setCustomAmounts({});
    }
  };

  const handleSplit = async () => {
    if (!transaction) {
      Alert.alert(
        'Error',
        'Transaction information not found.',
      );

      return;
    }

    if (selectedMembers.length < 2) {
      Alert.alert(
        'Select Members',
        'Please select at least 2 people to split the expense.',
      );

      return;
    }

    if (
      splitMode === 'custom' &&
      !isCustomSplitValid
    ) {
      Alert.alert(
        'Invalid Split',
        `The amounts must add up to ₹${transaction.amount.toFixed(
          2,
        )}.`,
      );

      return;
    }

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      let amountsToSave:
        | Record<string, number>
        | undefined;

      if (splitMode === 'custom') {
        amountsToSave = {};

        selectedMembers.forEach(
          (member) => {
            amountsToSave![member] =
              Number(
                parseFloat(
                  customAmounts[
                    member
                  ] || '0',
                ).toFixed(2),
              );
          },
        );
      }

      const savedExpense =
        await addExpense(
          transaction,
          selectedMembers,
          amountsToSave,
        );

      console.log(
        'EXPENSE SAVED:',
        savedExpense,
      );

      Alert.alert(
        'Expense Split Successfully',
        splitMode === 'equal'
          ? `₹${transaction.amount} has been split equally among ${selectedMembers.length} people.`
          : `₹${transaction.amount} has been custom split among ${selectedMembers.length} people.`,
        [
          {
            text: 'View Group Balance',
            onPress: () => {
              navigation.navigate(
                'MainTabs',
                {
                  screen: 'Group',
                },
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        'Failed to save expense:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save the expense. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!transaction) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <Text
          style={styles.errorText}
        >
          Transaction information not
          found.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSplitButtonDisabled =
    isSaving ||
    selectedMembers.length < 2 ||
    (splitMode === 'custom' &&
      !isCustomSplitValid);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() =>
            navigation.goBack()
          }
          disabled={isSaving}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text}
          />

          <Text
            style={styles.backText}
          >
            Split Expense
          </Text>
        </TouchableOpacity>

        {/* Expense Details */}
        <View
          style={styles.expenseCard}
        >
          <View
            style={styles.merchantIcon}
          >
            <Ionicons
              name="restaurant-outline"
              size={28}
              color={colors.primary}
            />
          </View>

          <Text
            style={styles.merchant}
          >
            {transaction.merchant}
          </Text>

          <Text
            style={styles.amount}
          >
            ₹{transaction.amount.toFixed(2)}
          </Text>

          <Text
            style={styles.paidBy}
          >
            Paid by {transaction.payer}
          </Text>

          <View
            style={styles.categoryBadge}
          >
            <Text
              style={styles.categoryText}
            >
              {transaction.category}
            </Text>
          </View>
        </View>

        {/* Split Mode */}
        <Text
          style={styles.sectionTitle}
        >
          Choose Split Type
        </Text>

        <View
          style={styles.modeContainer}
        >
          <TouchableOpacity
            style={[
              styles.modeButton,
              splitMode === 'equal' &&
                styles.activeModeButton,
            ]}
            onPress={() =>
              switchSplitMode(
                'equal',
              )
            }
            disabled={isSaving}
          >
            <Ionicons
              name="people-outline"
              size={22}
              color={
                splitMode === 'equal'
                  ? '#FFFFFF'
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.modeText,
                splitMode === 'equal' &&
                  styles.activeModeText,
              ]}
            >
              Equal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              splitMode === 'custom' &&
                styles.activeModeButton,
            ]}
            onPress={() =>
              switchSplitMode(
                'custom',
              )
            }
            disabled={isSaving}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={
                splitMode === 'custom'
                  ? '#FFFFFF'
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.modeText,
                splitMode === 'custom' &&
                  styles.activeModeText,
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Member Selection */}
        <Text
          style={styles.sectionTitle}
        >
          Who shared this expense?
        </Text>

        {members.length === 0 ? (
          <View
            style={styles.emptyMembersCard}
          >
            <Ionicons
              name="people-outline"
              size={34}
              color={colors.primary}
            />

            <Text
              style={
                styles.emptyMembersTitle
              }
            >
              No group members
            </Text>

            <Text
              style={
                styles.emptyMembersText
              }
            >
              Add members from the Group
              screen first.
            </Text>
          </View>
        ) : (
          <View
            style={styles.membersCard}
          >
            {members.map((member) => {
              const selected =
                selectedMembers.includes(
                  member,
                );

              return (
                <TouchableOpacity
                  key={member}
                  style={[
                    styles.memberRow,
                    selected &&
                      styles.selectedMemberRow,
                  ]}
                  onPress={() =>
                    toggleMember(
                      member,
                    )
                  }
                  disabled={isSaving}
                >
                  <View
                    style={styles.avatar}
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {member
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.memberName
                    }
                  >
                    {member}
                  </Text>

                  {selected &&
                    splitMode ===
                      'custom' && (
                      <View
                        style={
                          styles.customInputContainer
                        }
                      >
                        <Text
                          style={
                            styles.rupeeSymbol
                          }
                        >
                          ₹
                        </Text>

                        <TextInput
                          style={
                            styles.customInput
                          }
                          value={
                            customAmounts[
                              member
                            ] || ''
                          }
                          onChangeText={(
                            value,
                          ) =>
                            handleCustomAmountChange(
                              member,
                              value,
                            )
                          }
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={
                            colors.secondaryText
                          }
                          editable={
                            !isSaving
                          }
                        />
                      </View>
                    )}

                  <View
                    style={[
                      styles.checkbox,
                      selected &&
                        styles.selectedCheckbox,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Equal Split Summary */}
        {splitMode === 'equal' && (
          <View
            style={styles.splitSummary}
          >
            <Text
              style={styles.summaryTitle}
            >
              Equal Split
            </Text>

            <Text
              style={styles.perPerson}
            >
              ₹{amountPerPerson.toFixed(2)}
            </Text>

            <Text
              style={styles.summaryText}
            >
              per person ·{' '}
              {selectedMembers.length}{' '}
              people
            </Text>
          </View>
        )}

        {/* Custom Split Summary */}
        {splitMode === 'custom' && (
          <View
            style={[
              styles.splitSummary,
              isCustomSplitValid
                ? styles.validSummary
                : styles.invalidSummary,
            ]}
          >
            <Text
              style={styles.summaryTitle}
            >
              Custom Split
            </Text>

            <Text
              style={[
                styles.remainingAmount,
                isCustomSplitValid &&
                  styles.validAmount,
              ]}
            >
              ₹
              {Math.abs(
                remainingAmount,
              ).toFixed(2)}
            </Text>

            <Text
              style={styles.summaryText}
            >
              {isCustomSplitValid
                ? 'Amount completely assigned'
                : remainingAmount > 0
                  ? `₹${remainingAmount.toFixed(
                      2,
                    )} remaining`
                  : `₹${Math.abs(
                      remainingAmount,
                    ).toFixed(
                      2,
                    )} over the total`}
            </Text>

            <View
              style={styles.totalRow}
            >
              <Text
                style={styles.totalRowLabel}
              >
                Assigned
              </Text>

              <Text
                style={styles.totalRowAmount}
              >
                ₹{customTotal.toFixed(2)}
              </Text>

              <Text
                style={styles.totalRowLabel}
              >
                of ₹
                {transaction.amount.toFixed(
                  2,
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Extra bottom space for fixed button */}
        <View
          style={styles.bottomSpace}
        />
      </ScrollView>

      {/* FIXED BOTTOM ACTION */}
      <View
        style={styles.bottomAction}
      >
        <View
          style={styles.bottomActionInfo}
        >
          <View>
            <Text
              style={styles.bottomActionLabel}
            >
              {splitMode === 'equal'
                ? 'Each person pays'
                : 'Assigned amount'}
            </Text>

            <Text
              style={styles.bottomActionAmount}
            >
              ₹
              {splitMode === 'equal'
                ? amountPerPerson.toFixed(2)
                : customTotal.toFixed(2)}
            </Text>
          </View>

          <Text
            style={styles.peopleCount}
          >
            {selectedMembers.length}{' '}
            people
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.splitButton,
            isSplitButtonDisabled &&
              styles.disabledButton,
          ]}
          onPress={handleSplit}
          disabled={isSplitButtonDisabled}
        >
          <Ionicons
            name={
              isSaving
                ? 'hourglass-outline'
                : 'git-branch-outline'
            }
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.splitButtonText
            }
          >
            {isSaving
              ? 'Saving Expense...'
              : 'Split Expense'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  container: {
    flex: 1,
  },

  content: {
    padding: spacing.md,
    paddingBottom: 20,
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  backText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginLeft: spacing.sm,
  },

  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  merchantIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  merchant: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },

  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
  },

  paidBy: {
    color: colors.secondaryText,
    marginTop: 4,
  },

  categoryBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: spacing.sm,
  },

  categoryText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  modeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  modeButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeModeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  modeText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  activeModeText: {
    color: '#FFFFFF',
  },

  membersCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  selectedMemberRow: {
    backgroundColor: '#F0FDF4',
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

  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },

  customInputContainer: {
    width: 95,
    height: 42,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: spacing.sm,
  },

  rupeeSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },

  customInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 0,
    marginLeft: 2,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCheckbox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  splitSummary: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },

  validSummary: {
    backgroundColor: '#ECFDF5',
  },

  invalidSummary: {
    backgroundColor: '#FEF2F2',
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  perPerson: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
  },

  remainingAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: spacing.sm,
  },

  validAmount: {
    color: colors.success,
  },

  summaryText: {
    color: colors.secondaryText,
    marginTop: 2,
    textAlign: 'center',
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  totalRowLabel: {
    color: colors.secondaryText,
    fontSize: 12,
  },

  totalRowAmount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginHorizontal: 4,
  },

  bottomSpace: {
    height: 130,
  },

  bottomAction: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 12,
    elevation: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -3,
    },
  },

  bottomActionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  bottomActionLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },

  bottomActionAmount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },

  peopleCount: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },

  splitButton: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  splitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },

  emptyMembersCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },

  emptyMembersTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },

  emptyMembersText: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },

  errorContainer: {
    flex: 1,
    backgroundColor:
      colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  errorText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});