import { colors, spacing, typography } from '@core/theme';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useHouseholds } from '../hooks/useHouseholds';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const Chip = ({ label, active, onPress }: ChipProps): JSX.Element => (
  <TouchableOpacity
    style={[styles.chip, active ? styles.chipActive : null]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
  </TouchableOpacity>
);

/** Lets the user pick the active household (or "Personal"). */
export const HouseholdSelector = (): JSX.Element => {
  const { data } = useHouseholds();
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const setActiveHousehold = useHouseholdStore((state) => state.setActiveHousehold);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip
        label="Personal"
        active={activeHouseholdId === null}
        onPress={() => setActiveHousehold(null)}
      />
      {(data ?? []).map((household) => (
        <Chip
          key={household.id}
          label={household.name}
          active={activeHouseholdId === household.id}
          onPress={() => setActiveHousehold(household.id)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
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
});
