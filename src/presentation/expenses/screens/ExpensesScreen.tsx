import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExpenseRow } from '../components/ExpenseRow';
import { useExpenseSummary, useExpenses } from '../hooks/useExpenses';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export const ExpensesScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const expenses = useExpenses();
  const summary = useExpenseSummary();

  const list = expenses.data?.expenses ?? [];
  const balances = summary.data?.balances ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Gastos</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus gastos</Text>
      ) : null}

      {summary.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {summary.isError ? <Text style={styles.error}>{summary.error.message}</Text> : null}

      {balances.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saldos</Text>
          {balances.map((balance) => (
            <View key={`${balance.fromUserId}-${balance.toUserId}`} style={styles.balanceRow}>
              <Text style={styles.meta}>
                {balance.fromUserId.slice(0, 6)} → {balance.toUserId.slice(0, 6)}
              </Text>
              <Text style={styles.balanceAmount}>
                {balance.amount} {summary.data?.currency}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {expenses.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {expenses.isError ? <Text style={styles.error}>{expenses.error.message}</Text> : null}

      <View style={styles.list}>
        {list.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
          />
        ))}
      </View>

      {expenses.data && list.length === 0 && householdId !== null ? (
        <Text style={styles.muted}>No hay gastos en este hogar todavía</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, householdId === null ? styles.buttonDisabled : null]}
        onPress={() => navigation.navigate('ExpenseForm')}
        disabled={householdId === null}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>+ Nuevo gasto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('RecurringExpenses')}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Gastos recurrentes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  balanceAmount: {
    ...typography.body,
    color: colors.text,
  },
  list: {
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.body,
    color: colors.primary,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
