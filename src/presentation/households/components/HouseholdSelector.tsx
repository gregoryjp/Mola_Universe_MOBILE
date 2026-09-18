import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Spinner } from '@presentation/components/ui';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { useHouseholds } from '../hooks/useHouseholds';
import { CreateHouseholdButton } from './CreateHouseholdButton';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

/**
 * The design system has no chip/segment component, so this stays a themed
 * pressable. `accessibilityState.selected` is what conveys the active choice to
 * screen readers, since the active chip is otherwise only distinguished by
 * colour.
 */
const Chip = ({ label, active, onPress }: ChipProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={[styles.chip, active ? styles.chipActive : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
};

/** Lets the user pick the active household (or "Personal"). */
export const HouseholdSelector = (): JSX.Element => {
  const { data, isLoading, isError } = useHouseholds();
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const setActiveHousehold = useHouseholdStore((state) => state.setActiveHousehold);
  const styles = useThemedStyles(makeStyles);

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
      {isLoading ? <Spinner size="sm" /> : null}
      {isError ? <Text style={styles.error}>No se pudieron cargar tus hogares</Text> : null}
      {(data ?? []).map((household) => (
        <Chip
          key={household.id}
          label={household.name}
          active={activeHouseholdId === household.id}
          onPress={() => setActiveHousehold(household.id)}
        />
      ))}
      <CreateHouseholdButton />
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
  error: {
    ...typography.caption,
    color: theme.error,
    alignSelf: 'center' as const,
  },
});
