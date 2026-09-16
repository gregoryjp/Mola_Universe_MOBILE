import { colors, spacing, typography } from '@core/theme';
import type { InventoryItem } from '@domain/inventory/entities/InventoryItem';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: InventoryItem;
  onPress: () => void;
}

export const InventoryItemRow = ({ item, onPress }: Props): JSX.Element => (
  <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  body: {
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
});
