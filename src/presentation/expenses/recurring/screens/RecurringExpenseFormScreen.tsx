import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { type JSX, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
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
      <Text style={styles.heading}>
        {isRestock ? 'Reponer gasto recurrente' : 'Nuevo gasto recurrente'}
      </Text>
      {isRestock && current ? (
        <Text style={styles.hint}>
          {current.name} · {current.currency}
        </Text>
      ) : null}

      {isRestock ? (
        <TextInput
          style={styles.input}
          placeholder="Importe (ej. 12.50)"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre (ej. Detergente)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Categoría (opcional)"
            placeholderTextColor={colors.textMuted}
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="Moneda (EUR)"
            placeholderTextColor={colors.textMuted}
            value={currency}
            onChangeText={setCurrency}
            autoCapitalize="characters"
            maxLength={3}
          />
        </>
      )}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <TouchableOpacity
        style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={submit}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {isRestock
            ? restock.isPending
              ? 'Reponiendo…'
              : 'Reponer'
            : createExpense.isPending
              ? 'Creando…'
              : 'Crear'}
        </Text>
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
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
});
