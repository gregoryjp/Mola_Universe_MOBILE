import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Input, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { InventoryItemRow } from '../components/InventoryItemRow';
import { useInventoryItems } from '../hooks/useInventoryItems';
import { useCreateInventoryItem } from '../hooks/useInventoryMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryList'>;

export const InventoryListScreen = ({ navigation }: Props): JSX.Element => {
  const { items: itemsList, ...items } = useInventoryItems();
  const create = useCreateInventoryItem();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('ud');
  const styles = useThemedStyles(makeStyles);

  const handleCreate = (): void => {
    create.mutate({ name, unit }, { onSuccess: () => setName('') });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Inventario</Text>
      <HouseholdSelector />

      <View style={styles.form}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          style={styles.inputName}
          accessibilityLabel="Nombre del item"
        />
        <Input
          value={unit}
          onChangeText={setUnit}
          placeholder="Unidad"
          autoCapitalize="none"
          style={styles.inputUnit}
          accessibilityLabel="Unidad del item"
        />
        <Button
          label="Añadir"
          onPress={handleCreate}
          loading={create.isPending}
          size="md"
          accessibilityHint="Añade el item al inventario"
        />
      </View>

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}
      {items.isLoading ? <Spinner /> : null}
      {items.isError ? <Text style={styles.error}>{items.error.message}</Text> : null}

      <View style={styles.list}>
        {itemsList.map((item) => (
          <InventoryItemRow
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('InventoryItemDetail', { itemId: item.id })}
          />
        ))}
      </View>

      {items.data && itemsList.length === 0 ? (
        <EmptyState title="Tu inventario está vacío" />
      ) : null}

      {items.hasNextPage ? (
        <Button
          label="Cargar más"
          onPress={() => void items.fetchNextPage()}
          loading={items.isFetchingNextPage}
          variant="secondary"
          size="md"
          accessibilityHint="Carga la siguiente página de items del inventario"
        />
      ) : null}
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
  form: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
    alignItems: 'center' as const,
  },
  inputName: {
    flex: 1,
  },
  inputUnit: {
    width: 80,
  },
  list: {
    gap: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
