import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Button, ErrorState, Input, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  const styles = useThemedStyles(makeStyles);

  const payments = (summary.data?.balances ?? [])
    .flatMap((balance) => balance.payments)
    .filter((payment) => payment.expenseId === expenseId);

  if (expense.isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (expense.isError || !expense.data) {
    return (
      <View style={styles.center}>
        <ErrorState message={expense.error?.message ?? 'Gasto no disponible'} />
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
      <ScreenHeader
        title={data.description}
        onBack={() => navigation.goBack()}
        testID="expense-detail-header"
      />
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
                accessibilityLabel="Confirmar payment"
              >
                <Text style={styles.action}>Confirmar</Text>
              </TouchableOpacity>
            ) : null}
            {payment.status === 'CONFIRMED' ? (
              <TouchableOpacity
                onPress={() => reversePayment.mutate({ paymentId: payment.id })}
                accessibilityRole="button"
                accessibilityLabel="Revertir payment"
              >
                <Text style={styles.action}>Revertir</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}

      <View style={styles.form}>
        <Input
          value={amount}
          onChangeText={setAmount}
          placeholder="Importe a pagar"
          keyboardType="decimal-pad"
          style={styles.formInput}
          accessibilityLabel="Importe a pagar"
        />
        <Button
          label="Pagar"
          onPress={handlePayment}
          disabled={amount.length === 0}
          loading={createPayment.isPending}
          accessibilityHint="Registra un pago de esta deuda"
        />
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

      <Button
        label="Eliminar gasto"
        onPress={() => removeExpense.mutate(expenseId, { onSuccess: () => navigation.goBack() })}
        loading={removeExpense.isPending}
        variant="danger"
        size="lg"
        accessibilityHint="Elimina este gasto definitivamente"
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
    gap: spacing.s2,
  },
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.background,
    padding: spacing.s6,
  },
  amount: {
    ...typography.h2,
    color: theme.primary,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
    marginTop: spacing.s2,
  },
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
  },
  actions: {
    flexDirection: 'row' as const,
    gap: spacing.s4,
  },
  action: {
    ...typography.caption,
    color: theme.primary,
    paddingVertical: spacing.s2,
  },
  form: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
    alignItems: 'center' as const,
    marginTop: spacing.s2,
  },
  formInput: {
    flex: 1,
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
