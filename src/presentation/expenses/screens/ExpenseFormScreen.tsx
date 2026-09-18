import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useCreateExpense } from '../hooks/useExpenseMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseForm'>;

export const ExpenseFormScreen = ({ navigation }: Props): JSX.Element => {
  const userId = useAuthStore((state) => state.user?.id);
  const create = useCreateExpense();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const styles = useThemedStyles(makeStyles);

  const canSubmit =
    description.length > 0 && amount.length > 0 && userId !== undefined && !create.isPending;

  const handleSubmit = (): void => {
    if (userId === undefined) return;
    create.mutate(
      {
        description,
        amount,
        paidBy: userId,
        ...(category.length > 0 && { category }),
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Nuevo gasto"
        onBack={() => navigation.goBack()}
        testID="expense-form-header"
      />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        required
        testID="expense-description"
      />
      <Input
        label="Importe"
        value={amount}
        onChangeText={setAmount}
        placeholder="Importe (ej. 42.50)"
        keyboardType="decimal-pad"
        required
        testID="expense-amount"
      />
      <Input
        label="Categoría"
        value={category}
        onChangeText={setCategory}
        placeholder="Categoría (opcional)"
        testID="expense-category"
      />

      <Text style={styles.hint}>Tú pagas este gasto; se reparte a partes iguales.</Text>

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <Button
        label="Crear gasto"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={create.isPending}
        size="lg"
        accessibilityHint="Registra el gasto y lo reparte a partes iguales"
        testID="expense-submit"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
    gap: spacing.s2,
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
