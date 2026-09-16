import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAddShoppingItem } from '../hooks/useShoppingMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingItemForm'>;

export const ShoppingItemFormScreen = ({ route, navigation }: Props): JSX.Element => {
  const { listId } = route.params;
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('ud');
  const addItem = useAddShoppingItem();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    addItem.mutate(
      { listId, input: { name, quantity, unit } },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Añadir item</Text>

      <Input
        label="Nombre"
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        required
        testID="shopping-item-name"
      />
      <Input
        label="Cantidad"
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Cantidad (ej. 2 o 1.5)"
        keyboardType="decimal-pad"
        testID="shopping-item-quantity"
      />
      <Input
        label="Unidad"
        value={unit}
        onChangeText={setUnit}
        placeholder="Unidad (ej. ud, kg, l)"
        autoCapitalize="none"
        testID="shopping-item-unit"
      />

      {addItem.isError ? <Text style={styles.error}>{addItem.error.message}</Text> : null}

      <Button
        label="Añadir"
        onPress={handleSubmit}
        loading={addItem.isPending}
        size="lg"
        accessibilityHint="Añade el item a la lista de compras"
        testID="shopping-item-submit"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
