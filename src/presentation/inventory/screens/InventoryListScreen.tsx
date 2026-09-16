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
import { InventoryItemRow } from '../components/InventoryItemRow';
import { useInventoryItems } from '../hooks/useInventoryItems';
import { useCreateInventoryItem } from '../hooks/useInventoryMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryList'>;

export const InventoryListScreen = ({ navigation }: Props): JSX.Element => {
  const items = useInventoryItems();
  const create = useCreateInventoryItem();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('ud');

  const handleCreate = (): void => {
    create.mutate({ name, unit }, { onSuccess: () => setName('') });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Inventario</Text>
      <HouseholdSelector />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="Unidad"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={unit}
          onChangeText={setUnit}
        />
        <TouchableOpacity
          style={styles.add}
          onPress={handleCreate}
          disabled={create.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.addText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {create.isError ? <Text style={styles.error}>{create.error.message}</Text> : null}
      {items.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {items.isError ? <Text style={styles.error}>{items.error.message}</Text> : null}

      <View style={styles.list}>
        {(items.data?.items ?? []).map((item) => (
          <InventoryItemRow
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('InventoryItemDetail', { itemId: item.id })}
          />
        ))}
      </View>

      {items.data && items.data.items.length === 0 ? (
        <Text style={styles.muted}>Tu inventario está vacío</Text>
      ) : null}
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
  inputSmall: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    width: 80,
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
  list: {
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
});
