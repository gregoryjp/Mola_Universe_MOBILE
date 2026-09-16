import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PetRow } from '../components/PetRow';
import { usePets } from '../hooks/usePets';

type Props = NativeStackScreenProps<RootStackParamList, 'Pets'>;

export const PetsListScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const pets = usePets();
  const styles = useThemedStyles(makeStyles);
  const items = pets.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Mascotas</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus mascotas</Text>
      ) : null}

      <View style={styles.section}>
        {pets.isLoading ? <Spinner /> : null}
        {pets.isError ? <Text style={styles.error}>{pets.error.message}</Text> : null}
        {items.map((pet) => (
          <PetRow
            key={pet.id}
            pet={pet}
            onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
          />
        ))}
        {pets.data && items.length === 0 && householdId !== null ? (
          <EmptyState title="Sin mascotas todavía" />
        ) : null}
      </View>

      <Button
        label="+ Nueva mascota"
        disabled={householdId === null}
        onPress={() => navigation.navigate('PetForm', {})}
        size="lg"
        accessibilityHint="Abre el formulario para añadir una mascota"
      />
    </ScrollView>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s4,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s1,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
