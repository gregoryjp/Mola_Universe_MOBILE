import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { MovementInputType } from '@domain/inventory/entities/InventoryItem';
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
import { useInventoryItem, useInventoryMovements } from '../hooks/useInventoryItem';
import {
  useArchiveInventoryItem,
  useCreateMovement,
  useReverseMovement,
} from '../hooks/useInventoryMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryItemDetail'>;

const MOVEMENT_TYPES: readonly MovementInputType[] = ['ADD', 'CONSUME', 'ADJUST'];

const MovementForm = ({
  itemId,
  defaultUnit,
}: {
  itemId: string;
  defaultUnit: string;
}): JSX.Element => {
  const [type, setType] = useState<MovementInputType>('ADD');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);
  const createMovement = useCreateMovement();

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        {MOVEMENT_TYPES.map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, type === value ? styles.chipActive : null]}
            onPress={() => setType(value)}
            accessibilityRole="button"
          >
            <Text style={type === value ? styles.chipTextActive : styles.chipText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={quantity}
          onChangeText={setQuantity}
        />
        <TextInput
          style={styles.inputSmall}
          placeholder="Unidad"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={unit}
          onChangeText={setUnit}
        />
      </View>
      {createMovement.isError ? (
        <Text style={styles.error}>{createMovement.error.message}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={() => createMovement.mutate({ itemId, input: { type, quantity, unit } })}
        disabled={createMovement.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Registrar movimiento</Text>
      </TouchableOpacity>
    </View>
  );
};

export const InventoryItemDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { itemId } = route.params;
  const item = useInventoryItem(itemId);
  const movements = useInventoryMovements(itemId);
  const reverse = useReverseMovement();
  const archive = useArchiveInventoryItem();

  if (item.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (item.isError || !item.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{item.isError ? item.error.message : 'Item no encontrado'}</Text>
      </View>
    );
  }

  const current = item.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{current.name}</Text>
      <Text style={styles.meta}>
        {current.quantity} {current.unit} · {current.status}
      </Text>

      <MovementForm itemId={itemId} defaultUnit={current.unit} />

      <Text style={styles.subheading}>Movimientos</Text>
      {movements.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {movements.isError ? <Text style={styles.error}>{movements.error.message}</Text> : null}
      {reverse.isError ? <Text style={styles.error}>{reverse.error.message}</Text> : null}
      <View style={styles.list}>
        {(movements.data ?? []).map((movement) => (
          <View key={movement.id} style={styles.movement}>
            <View style={styles.movementBody}>
              <Text style={styles.movementTitle}>
                {movement.type} {movement.quantityDelta}
              </Text>
              <Text style={styles.movementMeta}>Saldo: {movement.balanceAfter}</Text>
            </View>
            {movement.type === 'REVERSAL' ? null : (
              <TouchableOpacity
                onPress={() => reverse.mutate({ itemId, movementId: movement.id })}
                accessibilityRole="button"
              >
                <Text style={styles.link}>Revertir</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {archive.isError ? <Text style={styles.error}>{archive.error.message}</Text> : null}
      <TouchableOpacity
        style={styles.danger}
        onPress={() => archive.mutate(itemId, { onSuccess: () => navigation.goBack() })}
        disabled={archive.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.dangerText}>Archivar</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  subheading: {
    ...typography.h3,
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
  list: {
    gap: spacing.sm,
  },
  movement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  movementBody: {
    gap: 2,
  },
  movementTitle: {
    ...typography.body,
    color: colors.text,
  },
  movementMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  danger: {
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dangerText: {
    ...typography.body,
    color: colors.error,
  },
});
