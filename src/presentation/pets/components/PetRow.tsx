import { colors, spacing, typography } from '@core/theme';
import type { Pet } from '@domain/pets/entities/Pet';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
  pet: Pet;
  onPress: () => void;
}

export const PetRow = ({ pet, onPress }: Props): JSX.Element => (
  <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  alert: {
    ...typography.caption,
    color: colors.warning,
  },
});
