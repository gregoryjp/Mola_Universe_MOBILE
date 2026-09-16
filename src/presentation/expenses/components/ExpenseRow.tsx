import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { Expense } from '@domain/expenses/entities/Expense';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  expense: Expense;
  onPress: () => void;
}

export const ExpenseRow = ({ expense, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={expense.description}
      accessibilityHint="Abre el detalle del gasto"
    >
      <View style={styles.info}>
        <Text style={styles.title}>{expense.description}</Text>
        <Text style={styles.meta}>
          {expense.status === 'SETTLED'
            ? 'Saldado'
            : `Pendiente · resta ${expense.remainingAmount}`}
        </Text>
      </View>
      <Text style={styles.amount}>
        {expense.amount} {expense.currency}
      </Text>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    gap: spacing.s2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  amount: {
    ...typography.body,
    color: theme.text,
  },
});
