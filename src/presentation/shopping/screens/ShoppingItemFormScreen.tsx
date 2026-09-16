import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAddShoppingItem } from '../hooks/useShoppingMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingItemForm'>;

export const ShoppingItemFormScreen = ({ route, navigation }: Props): JSX.Element => {
  const { listId } = route.params;
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('ud');
  const addItem = useAddShoppingItem();

  const handleSubmit = (): void => {
    addItem.mutate(
      { listId, input: { name, quantity, unit } },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Añadir item</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Cantidad (ej. 2 o 1.5)"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        value={quantity}
        onChangeText={setQuantity}
      />
      <TextInput
        style={styles.input}
        placeholder="Unidad (ej. ud, kg, l)"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        value={unit}
        onChangeText={setUnit}
      />

      {addItem.isError ? <Text style={styles.error}>{addItem.error.message}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={addItem.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{addItem.isPending ? 'Añadiendo…' : 'Añadir'}</Text>
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
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
