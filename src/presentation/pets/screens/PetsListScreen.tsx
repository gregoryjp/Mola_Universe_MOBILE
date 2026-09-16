import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PetRow } from '../components/PetRow';
import { usePets } from '../hooks/usePets';

type Props = NativeStackScreenProps<RootStackParamList, 'Pets'>;

export const PetsListScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const pets = usePets();
  const items = pets.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Mascotas</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus mascotas</Text>
      ) : null}

      <View style={styles.section}>
        {pets.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {pets.isError ? <Text style={styles.error}>{pets.error.message}</Text> : null}
        {items.map((pet) => (
          <PetRow
            key={pet.id}
            pet={pet}
            onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
          />
        ))}
        {pets.data && items.length === 0 && householdId !== null ? (
          <Text style={styles.muted}>Sin mascotas todavía</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.button, householdId === null ? styles.buttonDisabled : null]}
        disabled={householdId === null}
        onPress={() => navigation.navigate('PetForm', {})}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>+ Nueva mascota</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    gap: spacing.xs,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
