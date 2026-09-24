import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
} from '../theme/theme';

import { clearExpenses } from '../services/expenseStore';

export default function ProfileScreen() {
  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will delete all saved shared expenses. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success =
              await clearExpenses();

            if (success) {
              Alert.alert(
                'Reset Complete',
                'All demo expenses have been cleared.',
              );
            } else {
              Alert.alert(
                'Error',
                'Unable to clear demo expenses.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>
        Profile
      </Text>

      {/* User Card */}
      <View style={styles.card}>
        <Text style={styles.name}>
          Sai
        </Text>

        <Text style={styles.muted}>
          Demo user
        </Text>
      </View>

      {/* Demo Mode */}
      <View style={styles.card}>
        <Text style={styles.setting}>
          Demo Mode
        </Text>

        <Text style={styles.muted}>
          SplitSnap is currently using simulated
          UPI/SMS data.
        </Text>
      </View>

      {/* Developer / Demo Tools */}
      <View style={styles.card}>
        <Text style={styles.setting}>
          Demo Tools
        </Text>

        <Text style={styles.muted}>
          Use this option to clear saved expenses
          while testing the app.
        </Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetData}
        >
          <Text style={styles.resetButtonText}>
            Reset Demo Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  setting: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },

  muted: {
    color: colors.secondaryText,
    marginTop: 3,
    lineHeight: 20,
  },

  resetButton: {
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});