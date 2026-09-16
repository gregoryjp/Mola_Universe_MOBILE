import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { ShoppingItem } from '@domain/shopping/entities/ShoppingList';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: ShoppingItem;
  onPurchase: () => void;
  onReopen: () => void;
  onDelete: () => void;
}

export const ShoppingItemRow = ({ item, onPurchase, onReopen, onDelete }: Props): JSX.Element => {
  const isPending = item.status === 'PENDING';
  const styles = useThemedStyles(makeStyles);

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
        accessibilityLabel={isPending ? 'Comprar' : 'Reabrir'}
      >
        <Text style={styles.actionText}>{isPending ? 'Comprar' : 'Reabrir'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.action}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Borrar"
      >
        <Text style={styles.deleteText}>Borrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s2,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  action: {
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.s3,
  },
  actionText: {
    ...typography.bodySmall,
    color: theme.primary,
  },
  deleteText: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
