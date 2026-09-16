import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  expense: RecurringExpense;
  /** Current user id, to resolve whether this is my turn. Member names are
   * not available yet (there is no household-members endpoint wired). */
  myUserId: string | null;
  onRestock: () => void;
  onArchive: () => void;
}

const turnLabel = (expense: RecurringExpense, myUserId: string | null): string => {
  if (expense.currentTurnUserId === null) return 'Sin turno asignado';
  if (myUserId !== null && expense.currentTurnUserId === myUserId) return 'Te toca reponer';
  return 'Le toca a otro miembro';
};

export const RecurringExpenseRow = ({
  expense,
  myUserId,
  onRestock,
  onArchive,
}: Props): JSX.Element => {
  const isMyTurn = myUserId !== null && expense.currentTurnUserId === myUserId;
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.name}>{expense.name}</Text>
        <Text style={styles.currency}>{expense.currency}</Text>
      </View>
      {expense.category ? <Text style={styles.meta}>{expense.category}</Text> : null}
      <Text style={isMyTurn ? styles.turnActive : styles.meta}>{turnLabel(expense, myUserId)}</Text>
      {expense.lastPurchasedAt ? (
        <Text style={styles.meta}>
          Última reposición: {new Date(expense.lastPurchasedAt).toLocaleDateString()}
        </Text>
      ) : (
        <Text style={styles.meta}>Todavía sin reponer</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onRestock}
          accessibilityRole="button"
          accessibilityLabel={`Reponer ${expense.name}`}
        >
          <Text style={styles.action}>Reponer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onArchive}
          accessibilityRole="button"
          accessibilityLabel={`Archivar ${expense.name}`}
        >
          <Text style={styles.archive}>Archivar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  name: {
    ...typography.body,
    color: theme.text,
  },
  currency: {
    ...typography.caption,
    color: theme.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  turnActive: {
    ...typography.bodySmall,
    color: theme.primary,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: spacing.s4,
    marginTop: spacing.s1,
  },
  action: {
    ...typography.bodySmall,
    color: theme.primary,
    paddingVertical: spacing.s2,
  },
  archive: {
    ...typography.bodySmall,
    color: theme.error,
    paddingVertical: spacing.s2,
  },
});
