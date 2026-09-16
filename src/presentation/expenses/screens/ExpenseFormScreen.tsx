import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@shared/store/authStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateExpense } from '../hooks/useExpenseMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseForm'>;

export const ExpenseFormScreen = ({ navigation }: Props): JSX.Element => {
  const userId = useAuthStore((state) => state.user?.id);
  const create = useCreateExpense();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

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
      <Text style={styles.heading}>Nuevo gasto</Text>

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Importe (ej. 42.50)"
        placeholderTextColor={colors.textMuted}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría (opcional)"
        placeholderTextColor={colors.textMuted}
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.hint}>Tú pagas este gasto; se reparte a partes iguales.</Text>

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}

      <TouchableOpacity
        style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{create.isPending ? 'Guardando…' : 'Crear gasto'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
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
  hint: {
    ...typography.caption,
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
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
