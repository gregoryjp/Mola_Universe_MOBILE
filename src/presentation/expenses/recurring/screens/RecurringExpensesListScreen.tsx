import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
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
import { RecurringExpenseRow } from '../components/RecurringExpenseRow';
import { useArchiveRecurringExpense } from '../hooks/useRecurringExpenseMutations';
import { useRecurringExpenses } from '../hooks/useRecurringExpenses';

type Props = NativeStackScreenProps<RootStackParamList, 'RecurringExpenses'>;

export const RecurringExpensesListScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error } = useRecurringExpenses();
  const archive = useArchiveRecurringExpense();
  const myUserId = useAuthStore((state) => state.user?.id ?? null);
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

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
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {isError ? <Text style={styles.error}>{error.message}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecurringExpenseForm', {})}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Nuevo gasto recurrente</Text>
      </TouchableOpacity>

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
          <Text style={styles.muted}>No hay gastos recurrentes en este hogar</Text>
        ) : null}
      </View>
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
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.sm,
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
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
