import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { RecurringExpenseRow } from '../components/RecurringExpenseRow';
import { useArchiveRecurringExpense } from '../hooks/useRecurringExpenseMutations';
import { useRecurringExpenses } from '../hooks/useRecurringExpenses';

type Props = NativeStackScreenProps<RootStackParamList, 'RecurringExpenses'>;

export const RecurringExpensesListScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error } = useRecurringExpenses();
  const archive = useArchiveRecurringExpense();
  const myUserId = useAuthStore((state) => state.user?.id ?? null);
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const styles = useThemedStyles(makeStyles);

  const items = data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Gastos recurrentes</Text>
      <Text style={styles.hint}>
        Gastos comunes que se reponen por turnos: el backend calcula a quién le toca según quién
        repuso la última vez.
      </Text>

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus gastos recurrentes</Text>
      ) : null}
      {isLoading ? <Spinner /> : null}
      {isError ? <Text style={styles.error}>{error.message}</Text> : null}

      <Button
        label="Nuevo gasto recurrente"
        onPress={() => navigation.navigate('RecurringExpenseForm', {})}
        size="lg"
        accessibilityHint="Abre el formulario para crear un gasto recurrente"
      />

      {archive.isError ? <Text style={styles.error}>{archive.error.message}</Text> : null}

      <View style={styles.list}>
        {items.map((expense) => (
          <RecurringExpenseRow
            key={expense.id}
            expense={expense}
            myUserId={myUserId}
            onRestock={() =>
              navigation.navigate('RecurringExpenseForm', { recurringId: expense.id })
            }
            onArchive={() => archive.mutate(expense.id)}
          />
        ))}
        {data && items.length === 0 ? (
          <EmptyState title="No hay gastos recurrentes en este hogar" />
        ) : null}
      </View>
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
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  list: {
    gap: spacing.s2,
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
