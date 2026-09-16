import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { useShoppingItems } from '../hooks/useShoppingItems';
import { useShoppingLists } from '../hooks/useShoppingLists';
import {
  useCreateShoppingList,
  useDeleteShoppingItem,
  usePurchaseItem,
  useReopenItem,
} from '../hooks/useShoppingMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingLists'>;

export const ShoppingListScreen = ({ navigation }: Props): JSX.Element => {
  const lists = useShoppingLists();
  const createList = useCreateShoppingList();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');

  const availableLists = lists.data?.lists ?? [];
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
        <TextInput
          style={styles.input}
          placeholder="Nueva lista"
          placeholderTextColor={colors.textMuted}
          value={newListName}
          onChangeText={setNewListName}
        />
        <TouchableOpacity
          style={styles.add}
          onPress={handleCreateList}
          disabled={createList.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.addText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {lists.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {lists.isError ? <Text style={styles.error}>{lists.error.message}</Text> : null}
      {createList.isError ? <Text style={styles.error}>{createList.error.message}</Text> : null}

      <View style={styles.chips}>
        {availableLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            style={[styles.chip, activeListId === list.id ? styles.chipActive : null]}
            onPress={() => setSelectedListId(list.id)}
            accessibilityRole="button"
          >
            <Text style={activeListId === list.id ? styles.chipTextActive : styles.chipText}>
              {list.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {lists.data && availableLists.length === 0 ? (
        <Text style={styles.muted}>No tienes listas de compras todavía</Text>
      ) : null}

      {items.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
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

      <TouchableOpacity
        style={[styles.button, activeListId.length === 0 ? styles.buttonDisabled : null]}
        onPress={() => navigation.navigate('ShoppingItemForm', { listId: activeListId })}
        disabled={activeListId.length === 0}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>+ Añadir item</Text>
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
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextActive: {
    ...typography.caption,
    color: colors.background,
  },
  items: {
    gap: spacing.sm,
  },
  muted: {
    ...typography.body,
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
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
