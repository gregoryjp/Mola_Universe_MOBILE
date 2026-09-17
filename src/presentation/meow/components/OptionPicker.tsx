import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { JSX } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

export interface Option {
  id: string;
  label: string;
}

interface Props {
  options: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyLabel: string;
  accessibilityLabel: string;
}

/**
 * Chip row for picking the target of a capability (a task, a savings goal, a
 * shopping list). Mirrors the household selector's chip, since the design system
 * has no chip component of its own.
 */
export const OptionPicker = ({
  options,
  selectedId,
  onSelect,
  emptyLabel,
  accessibilityLabel,
}: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  if (options.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const active = option.id === selectedId;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.chip, active ? styles.chipActive : null]}
            onPress={() => onSelect(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
          >
            <Text style={active ? styles.chipTextActive : styles.chipText}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    gap: spacing.s2,
    paddingVertical: spacing.s1,
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
  empty: {
    ...typography.caption,
    color: theme.textMuted,
  },
});
