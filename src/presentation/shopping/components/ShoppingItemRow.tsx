import { colors, spacing, typography } from '@core/theme';
import type { ShoppingItem } from '@domain/shopping/entities/ShoppingList';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: ShoppingItem;
  onPurchase: () => void;
  onReopen: () => void;
  onDelete: () => void;
}

export const ShoppingItemRow = ({ item, onPurchase, onReopen, onDelete }: Props): JSX.Element => {
  const isPending = item.status === 'PENDING';

  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.title}>
          {item.name} · {item.quantity} {item.unit}
        </Text>
        <Text style={styles.meta}>{item.status}</Text>
      </View>
      <TouchableOpacity
        style={styles.action}
        onPress={isPending ? onPurchase : onReopen}
        accessibilityRole="button"
      >
        <Text style={styles.actionText}>{isPending ? 'Comprar' : 'Reabrir'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.action} onPress={onDelete} accessibilityRole="button">
        <Text style={styles.deleteText}>Borrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  action: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.error,
  },
});
