import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { MovementInputType } from '@domain/inventory/entities/InventoryItem';
import { Button, ErrorState, Input, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        {MOVEMENT_TYPES.map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, type === value ? styles.chipActive : null]}
            onPress={() => setType(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: type === value }}
            accessibilityLabel={`Tipo de movimiento ${value}`}
          >
            <Text style={type === value ? styles.chipTextActive : styles.chipText}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.row}>
        <Input
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Cantidad"
          keyboardType="decimal-pad"
          style={styles.inputQuantity}
          accessibilityLabel="Cantidad del movimiento"
        />
        <Input
          value={unit}
          onChangeText={setUnit}
          placeholder="Unidad"
          autoCapitalize="none"
          style={styles.inputUnit}
          accessibilityLabel="Unidad del movimiento"
        />
      </View>
      {createMovement.isError ? (
        <Text style={styles.error}>{createMovement.error.message}</Text>
      ) : null}
      <Button
        label="Registrar movimiento"
        onPress={() => createMovement.mutate({ itemId, input: { type, quantity, unit } })}
        loading={createMovement.isPending}
        accessibilityHint="Registra el movimiento en el inventario"
      />
    </View>
  );
};

export const InventoryItemDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { itemId } = route.params;
  const item = useInventoryItem(itemId);
  const movements = useInventoryMovements(itemId);
  const reverse = useReverseMovement();
  const archive = useArchiveInventoryItem();
  const styles = useThemedStyles(makeStyles);

  if (item.isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (item.isError || !item.data) {
    return (
      <View style={styles.center}>
        <ErrorState message={item.isError ? item.error.message : 'Item no encontrado'} />
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
      {movements.isLoading ? <Spinner /> : null}
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
                accessibilityLabel="Revertir movimiento"
              >
                <Text style={styles.link}>Revertir</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {archive.isError ? <Text style={styles.error}>{archive.error.message}</Text> : null}
      <Button
        label="Archivar"
        onPress={() => archive.mutate(itemId, { onSuccess: () => navigation.goBack() })}
        loading={archive.isPending}
        variant="danger"
        size="lg"
        accessibilityHint="Archiva este item del inventario"
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
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.background,
    padding: spacing.s6,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  subheading: {
    ...typography.h3,
    color: theme.text,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  form: {
    gap: spacing.s2,
  },
  row: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
    alignItems: 'center' as const,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center' as const,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s1,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    ...typography.caption,
    color: theme.text,
  },
  chipTextActive: {
    ...typography.caption,
    color: theme.textInverse,
  },
  inputQuantity: {
    flex: 1,
  },
  inputUnit: {
    width: 80,
  },
  list: {
    gap: spacing.s2,
  },
  movement: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  movementBody: {
    gap: 2,
  },
  movementTitle: {
    ...typography.body,
    color: theme.text,
  },
  movementMeta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  link: {
    ...typography.bodySmall,
    color: theme.primary,
    paddingVertical: spacing.s2,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
