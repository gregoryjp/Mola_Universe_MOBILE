import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type JSX, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import {
  useCreateRecurringExpense,
  useRestockRecurringExpense,
} from '../hooks/useRecurringExpenseMutations';
import { useRecurringExpenses } from '../hooks/useRecurringExpenses';

type Props = NativeStackScreenProps<RootStackParamList, 'RecurringExpenseForm'>;

/** Mirrors RestockRecurringExpenseSchema on the backend. */
const AMOUNT_PATTERN = /^[0-9]+(\.[0-9]{1,2})?$/;

export const RecurringExpenseFormScreen = ({ navigation, route }: Props): JSX.Element => {
  const recurringId = route.params?.recurringId;
  const isRestock = recurringId !== undefined;

  const list = useRecurringExpenses();
  const createExpense = useCreateRecurringExpense();
  const restock = useRestockRecurringExpense();
  const styles = useThemedStyles(makeStyles);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');

  const current = list.data?.find((expense) => expense.id === recurringId);
  const mutation = isRestock ? restock : createExpense;

  const canSubmit = isRestock
    ? AMOUNT_PATTERN.test(amount.trim()) && !restock.isPending
    : name.trim().length > 0 && !createExpense.isPending;

  const submit = (): void => {
    if (!canSubmit) return;

    if (isRestock) {
      if (recurringId === undefined) return;
      restock.mutate(
        { recurringId, input: { amount: amount.trim() } },
        { onSuccess: () => navigation.goBack() },
      );
      return;
    }

    const trimmedCategory = category.trim();
    createExpense.mutate(
      {
        name: name.trim(),
        ...(trimmedCategory.length > 0 && { category: trimmedCategory }),
        currency: currency.trim(),
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title={isRestock ? 'Reponer gasto recurrente' : 'Nuevo gasto recurrente'}
        onBack={() => navigation.goBack()}
        testID="recurring-expense-form-header"
      />
      {isRestock && current ? (
        <Text style={styles.hint}>
          {current.name} · {current.currency}
        </Text>
      ) : null}

      {isRestock ? (
        <Input
          label="Importe"
          value={amount}
          onChangeText={setAmount}
          placeholder="Importe (ej. 12.50)"
          keyboardType="decimal-pad"
          required
          testID="recurring-amount"
        />
      ) : (
        <>
          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Nombre (ej. Detergente)"
            required
            testID="recurring-name"
          />
          <Input
            label="Categoría"
            value={category}
            onChangeText={setCategory}
            placeholder="Categoría (opcional)"
            testID="recurring-category"
          />
          <Input
            label="Moneda"
            value={currency}
            onChangeText={setCurrency}
            placeholder="Moneda (EUR)"
            autoCapitalize="characters"
            maxLength={3}
            testID="recurring-currency"
          />
        </>
      )}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <Button
        label={isRestock ? 'Reponer' : 'Crear'}
        disabled={!canSubmit}
        onPress={submit}
        loading={mutation.isPending}
        size="lg"
        accessibilityHint={isRestock ? 'Repone el gasto recurrente' : 'Crea el gasto recurrente'}
        testID="recurring-submit"
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
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
