import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ExpenseRow } from '../components/ExpenseRow';
import { useExpenseSummary, useExpenses } from '../hooks/useExpenses';

type Props = TabScreenProps<'Expenses'>;

export const ExpensesScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const { expenses: list, ...expenses } = useExpenses();
  const summary = useExpenseSummary();
  const styles = useThemedStyles(makeStyles);

  const balances = summary.data?.balances ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Gastos</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus gastos</Text>
      ) : null}

      {summary.isLoading ? <Spinner /> : null}
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

      {expenses.isLoading ? <Spinner /> : null}
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
        <EmptyState title="No hay gastos en este hogar todavía" />
      ) : null}

      {expenses.hasNextPage ? (
        <Button
          label="Cargar más gastos"
          onPress={() => void expenses.fetchNextPage()}
          loading={expenses.isFetchingNextPage}
          variant="secondary"
          size="md"
          accessibilityHint="Carga la siguiente página de gastos"
        />
      ) : null}

      <Button
        label="+ Nuevo gasto"
        onPress={() => navigation.navigate('ExpenseForm')}
        disabled={householdId === null}
        size="lg"
        accessibilityHint="Abre el formulario para registrar un gasto"
      />

      <Button
        label="Gastos recurrentes"
        onPress={() => navigation.navigate('RecurringExpenses')}
        variant="secondary"
        size="lg"
        accessibilityHint="Abre la lista de gastos recurrentes"
      />
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s4,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  balanceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  balanceAmount: {
    ...typography.body,
    color: theme.text,
  },
  list: {
    gap: spacing.s2,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
