import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { InventoryItem } from '@domain/inventory/entities/InventoryItem';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: InventoryItem;
  onPress: () => void;
}

export const InventoryItemRow = ({ item, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      accessibilityHint="Abre el detalle del item"
    >
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          {item.quantity} {item.unit} · {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  body: {
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
});
