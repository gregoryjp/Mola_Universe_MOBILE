import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { Pet } from '@domain/pets/entities/Pet';
import type { JSX } from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface Props {
  pet: Pet;
  onPress: () => void;
}

export const PetRow = ({ pet, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={pet.name}
      accessibilityHint="Abre el detalle de la mascota"
    >
      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.meta}>
        {pet.species}
        {pet.breed ? ` · ${pet.breed}` : ''}
        {pet.ageYears > 0 ? ` · ${pet.ageYears} años` : ''}
      </Text>
      {pet.weightKg !== null ? <Text style={styles.meta}>{pet.weightKg} kg</Text> : null}
      {pet.allergies ? <Text style={styles.alert}>Alergias: {pet.allergies}</Text> : null}
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  name: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  alert: {
    ...typography.caption,
    color: theme.warning,
  },
});
