import { colors, spacing, typography } from '@core/theme';
import type { RecurringExpense } from '@domain/expenses/recurring/entities/RecurringExpense';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <TouchableOpacity onPress={onRestock} accessibilityRole="button">
          <Text style={styles.action}>Reponer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onArchive} accessibilityRole="button">
          <Text style={styles.archive}>Archivar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.body,
    color: colors.text,
  },
  currency: {
    ...typography.caption,
    color: colors.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  turnActive: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  action: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  archive: {
    ...typography.bodySmall,
    color: colors.error,
  },
});
