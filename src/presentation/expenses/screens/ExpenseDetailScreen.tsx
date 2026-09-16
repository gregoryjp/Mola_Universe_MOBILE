import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useConfirmPayment,
  useCreatePayment,
  useDeleteExpense,
  useReversePayment,
} from '../hooks/useExpenseMutations';
import { useExpense, useExpenseSummary } from '../hooks/useExpenses';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetail'>;

export const ExpenseDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { expenseId } = route.params;
  const userId = useAuthStore((state) => state.user?.id);
  const expense = useExpense(expenseId);
  const summary = useExpenseSummary();
  const createPayment = useCreatePayment(expenseId);
  const confirmPayment = useConfirmPayment(expenseId);
  const reversePayment = useReversePayment(expenseId);
  const removeExpense = useDeleteExpense();
  const [amount, setAmount] = useState('');

  const payments = (summary.data?.balances ?? [])
    .flatMap((balance) => balance.payments)
    .filter((payment) => payment.expenseId === expenseId);

  if (expense.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (expense.isError || !expense.data) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{expense.error?.message ?? 'Gasto no disponible'}</Text>
      </View>
    );
  }

  const data = expense.data;

  const handlePayment = (): void => {
    if (userId === undefined) return;
    createPayment.mutate(
      { paidByUserId: userId, paidToUserId: data.paidBy, amount },
      { onSuccess: () => setAmount('') },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{data.description}</Text>
      <Text style={styles.amount}>
        {data.amount} {data.currency}
      </Text>
      <Text style={styles.meta}>
        {data.status === 'SETTLED' ? 'Saldado' : `Pendiente · resta ${data.remainingAmount}`}
      </Text>

      <Text style={styles.sectionTitle}>Reparto</Text>
      {data.splits.map((split) => (
        <View key={split.id} style={styles.row}>
          <Text style={styles.meta}>{split.userId.slice(0, 8)}</Text>
          <Text style={styles.meta}>{split.amount}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Payments</Text>
      {payments.length === 0 ? <Text style={styles.muted}>Sin payments registrados</Text> : null}
      {payments.map((payment) => (
        <View key={payment.id} style={styles.row}>
          <Text style={styles.meta}>
            {payment.amount} · {payment.status}
          </Text>
          <View style={styles.actions}>
            {payment.status === 'PENDING' ? (
              <TouchableOpacity
                onPress={() => confirmPayment.mutate(payment.id)}
                accessibilityRole="button"
              >
                <Text style={styles.action}>Confirmar</Text>
              </TouchableOpacity>
            ) : null}
            {payment.status === 'CONFIRMED' ? (
              <TouchableOpacity
                onPress={() => reversePayment.mutate({ paymentId: payment.id })}
                accessibilityRole="button"
              >
                <Text style={styles.action}>Revertir</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Importe a pagar"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={styles.add}
          onPress={handlePayment}
          disabled={amount.length === 0 || createPayment.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.addText}>Pagar</Text>
        </TouchableOpacity>
      </View>

      {createPayment.isError ? (
        <Text style={styles.error}>{createPayment.error.message}</Text>
      ) : null}
      {confirmPayment.isError ? (
        <Text style={styles.error}>{confirmPayment.error.message}</Text>
      ) : null}
      {reversePayment.isError ? (
        <Text style={styles.error}>{reversePayment.error.message}</Text>
      ) : null}
      {removeExpense.isError ? (
        <Text style={styles.error}>{removeExpense.error.message}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.delete}
        onPress={() => removeExpense.mutate(expenseId, { onSuccess: () => navigation.goBack() })}
        accessibilityRole="button"
      >
        <Text style={styles.deleteText}>Eliminar gasto</Text>
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
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  amount: {
    ...typography.h2,
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
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
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    ...typography.caption,
    color: colors.primary,
  },
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  add: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addText: {
    ...typography.bodySmall,
    color: colors.background,
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
  delete: {
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteText: {
    ...typography.body,
    color: colors.error,
  },
});
