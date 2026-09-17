import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Input, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { useShoppingItems } from '../hooks/useShoppingItems';
import { useShoppingLists } from '../hooks/useShoppingLists';
import {
  useCreateShoppingList,
  useDeleteShoppingItem,
  usePurchaseItem,
  useReopenItem,
} from '../hooks/useShoppingMutations';

type Props = TabScreenProps<'ShoppingLists'>;

export const ShoppingListScreen = ({ navigation }: Props): JSX.Element => {
  const { lists: availableLists, ...lists } = useShoppingLists();
  const createList = useCreateShoppingList();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const styles = useThemedStyles(makeStyles);
  const activeListId = availableLists.some((list) => list.id === selectedListId)
    ? (selectedListId as string)
    : (availableLists[0]?.id ?? '');

  const items = useShoppingItems(activeListId);
  const purchase = usePurchaseItem();
  const reopen = useReopenItem();
  const removeItem = useDeleteShoppingItem();

  const handleCreateList = (): void => {
    createList.mutate({ name: newListName }, { onSuccess: () => setNewListName('') });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Compras</Text>
      <HouseholdSelector />

      <View style={styles.form}>
        <Input
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Nueva lista"
          style={styles.formInput}
          accessibilityLabel="Nombre de la nueva lista"
        />
        <Button
          label="Crear"
          onPress={handleCreateList}
          loading={createList.isPending}
          size="md"
          accessibilityHint="Crea una lista de compras con este nombre"
        />
      </View>

      {lists.isLoading ? <Spinner /> : null}
      {lists.isError ? <Text style={styles.error}>{lists.error.message}</Text> : null}
      {createList.isError ? <Text style={styles.error}>{createList.error.message}</Text> : null}

      <View style={styles.chips}>
        {availableLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            style={[styles.chip, activeListId === list.id ? styles.chipActive : null]}
            onPress={() => setSelectedListId(list.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeListId === list.id }}
            accessibilityLabel={list.name}
          >
            <Text style={activeListId === list.id ? styles.chipTextActive : styles.chipText}>
              {list.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {lists.data && availableLists.length === 0 ? (
        <EmptyState title="No tienes listas de compras todavía" />
      ) : null}

      {lists.hasNextPage ? (
        <Button
          label="Cargar más listas"
          onPress={() => void lists.fetchNextPage()}
          loading={lists.isFetchingNextPage}
          variant="secondary"
          size="md"
          accessibilityHint="Carga la siguiente página de listas de compras"
        />
      ) : null}

      {items.isLoading ? <Spinner /> : null}
      {items.isError ? <Text style={styles.error}>{items.error.message}</Text> : null}
      {purchase.isError ? <Text style={styles.error}>{purchase.error.message}</Text> : null}
      {removeItem.isError ? <Text style={styles.error}>{removeItem.error.message}</Text> : null}

      <View style={styles.items}>
        {(items.data ?? []).map((item) => (
          <ShoppingItemRow
            key={item.id}
            item={item}
            onPurchase={() => purchase.mutate({ listId: activeListId, itemId: item.id })}
            onReopen={() => reopen.mutate({ listId: activeListId, itemId: item.id })}
            onDelete={() => removeItem.mutate({ listId: activeListId, itemId: item.id })}
          />
        ))}
      </View>

      <Button
        label="+ Añadir item"
        onPress={() => navigation.navigate('ShoppingItemForm', { listId: activeListId })}
        disabled={activeListId.length === 0}
        size="lg"
        accessibilityHint="Añade un item a la lista activa"
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
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  form: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
    alignItems: 'center' as const,
  },
  formInput: {
    flex: 1,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  chips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s2,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center' as const,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s1,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  chipTextActive: {
    ...typography.bodySmall,
    color: theme.textInverse,
  },
  items: {
    gap: spacing.s2,
  },
});
