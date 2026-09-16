import { colors, spacing, typography } from '@core/theme';
import type { Expense } from '@domain/expenses/entities/Expense';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  expense: Expense;
  onPress: () => void;
}

export const ExpenseRow = ({ expense, onPress }: Props): JSX.Element => (
  <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
    <View style={styles.info}>
      <Text style={styles.title}>{expense.description}</Text>
      <Text style={styles.meta}>
        {expense.status === 'SETTLED' ? 'Saldado' : `Pendiente · resta ${expense.remainingAmount}`}
      </Text>
    </View>
    <Text style={styles.amount}>
      {expense.amount} {expense.currency}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  amount: {
    ...typography.body,
    color: colors.text,
  },
});
