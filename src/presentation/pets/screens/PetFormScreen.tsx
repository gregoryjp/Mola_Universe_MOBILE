import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { CreatePetInput, Pet } from '@domain/pets/entities/Pet';
import { Button, ErrorState, Input, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useCreatePet, useUpdatePet } from '../hooks/usePetMutations';
import { usePet } from '../hooks/usePets';

type Props = NativeStackScreenProps<RootStackParamList, 'PetForm'>;

interface PetFormValues {
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  weightKg: string;
  allergies: string;
  notes: string;
  microchipNumber: string;
  vetName: string;
  vetPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const EMPTY_VALUES: PetFormValues = {
  name: '',
  species: '',
  breed: '',
  birthDate: '',
  weightKg: '',
  allergies: '',
  notes: '',
  microchipNumber: '',
  vetName: '',
  vetPhone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

const toValues = (pet: Pet): PetFormValues => ({
  name: pet.name,
  species: pet.species,
  breed: pet.breed ?? '',
  birthDate: pet.birthDate?.slice(0, 10) ?? '',
  weightKg: pet.weightKg === null ? '' : String(pet.weightKg),
  allergies: pet.allergies ?? '',
  notes: pet.notes ?? '',
  microchipNumber: pet.microchipNumber ?? '',
  vetName: pet.vetName ?? '',
  vetPhone: pet.vetPhone ?? '',
  emergencyContactName: pet.emergencyContactName ?? '',
  emergencyContactPhone: pet.emergencyContactPhone ?? '',
});

/** Drops empty fields so the PATCH never sends a blank that would wipe a value. */
const toInput = (values: PetFormValues): CreatePetInput => {
  const optional = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const weight = optional(values.weightKg);

  return {
    name: values.name.trim(),
    species: values.species.trim(),
    ...(optional(values.breed) !== undefined && { breed: optional(values.breed) }),
    ...(optional(values.birthDate) !== undefined && { birthDate: optional(values.birthDate) }),
    ...(weight !== undefined && { weightKg: Number(weight) }),
    ...(optional(values.allergies) !== undefined && { allergies: optional(values.allergies) }),
    ...(optional(values.notes) !== undefined && { notes: optional(values.notes) }),
    ...(optional(values.microchipNumber) !== undefined && {
      microchipNumber: optional(values.microchipNumber),
    }),
    ...(optional(values.vetName) !== undefined && { vetName: optional(values.vetName) }),
    ...(optional(values.vetPhone) !== undefined && { vetPhone: optional(values.vetPhone) }),
    ...(optional(values.emergencyContactName) !== undefined && {
      emergencyContactName: optional(values.emergencyContactName),
    }),
    ...(optional(values.emergencyContactPhone) !== undefined && {
      emergencyContactPhone: optional(values.emergencyContactPhone),
    }),
  };
};

interface FormProps {
  title: string;
  onBack: () => void;
  initial: PetFormValues;
  submitLabel: string;
  isPending: boolean;
  errorMessage: string | undefined;
  onSubmit: (input: CreatePetInput) => void;
}

const PetForm = ({
  title,
  onBack,
  initial,
  submitLabel,
  isPending,
  errorMessage,
  onSubmit,
}: FormProps): JSX.Element => {
  const [values, setValues] = useState<PetFormValues>(initial);
  const styles = useThemedStyles(makeStyles);

  const set = (key: keyof PetFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const weightIsValid =
    values.weightKg.trim().length === 0 || !Number.isNaN(Number(values.weightKg.trim()));
  const canSubmit =
    values.name.trim().length > 0 &&
    values.species.trim().length > 0 &&
    weightIsValid &&
    !isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title={title} onBack={onBack} testID="pet-form-header" />
      <Input
        label="Nombre"
        value={values.name}
        onChangeText={set('name')}
        placeholder="Nombre (ej. Luna)"
        required
        testID="pet-name"
      />
      <Input
        label="Especie"
        value={values.species}
        onChangeText={set('species')}
        placeholder="Especie (ej. Perro)"
        required
        testID="pet-species"
      />
      <Input
        label="Raza"
        value={values.breed}
        onChangeText={set('breed')}
        placeholder="Raza"
        testID="pet-breed"
      />
      <Input
        label="Nacimiento"
        value={values.birthDate}
        onChangeText={set('birthDate')}
        placeholder="Nacimiento (AAAA-MM-DD)"
        autoCapitalize="none"
        testID="pet-birth-date"
      />
      <Input
        label="Peso"
        value={values.weightKg}
        onChangeText={set('weightKg')}
        placeholder="Peso en kg (ej. 12.5)"
        keyboardType="decimal-pad"
        error={weightIsValid ? undefined : 'El peso debe ser un número'}
        testID="pet-weight"
      />

      <Text style={styles.sectionTitle}>Salud</Text>
      <Input
        label="Alergias"
        value={values.allergies}
        onChangeText={set('allergies')}
        placeholder="Alergias"
        testID="pet-allergies"
      />
      <Input
        label="Microchip"
        value={values.microchipNumber}
        onChangeText={set('microchipNumber')}
        placeholder="Nº de microchip"
        testID="pet-microchip"
      />
      <Input
        label="Notas"
        value={values.notes}
        onChangeText={set('notes')}
        placeholder="Notas"
        multiline
        testID="pet-notes"
      />

      <Text style={styles.sectionTitle}>Veterinario</Text>
      <Input
        label="Veterinario"
        value={values.vetName}
        onChangeText={set('vetName')}
        placeholder="Nombre del veterinario"
        testID="pet-vet-name"
      />
      <Input
        label="Teléfono del veterinario"
        value={values.vetPhone}
        onChangeText={set('vetPhone')}
        placeholder="Teléfono del veterinario"
        keyboardType="phone-pad"
        testID="pet-vet-phone"
      />

      <Text style={styles.sectionTitle}>Contacto de emergencia</Text>
      <Input
        label="Nombre del contacto"
        value={values.emergencyContactName}
        onChangeText={set('emergencyContactName')}
        placeholder="Nombre"
        testID="pet-emergency-name"
      />
      <Input
        label="Teléfono del contacto"
        value={values.emergencyContactPhone}
        onChangeText={set('emergencyContactPhone')}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        testID="pet-emergency-phone"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button
        label={submitLabel}
        disabled={!canSubmit}
        onPress={() => {
          if (canSubmit) onSubmit(toInput(values));
        }}
        loading={isPending}
        size="lg"
        accessibilityHint="Guarda los datos de la mascota"
        testID="pet-submit"
      />
    </ScrollView>
  );
};

export const PetFormScreen = ({ navigation, route }: Props): JSX.Element => {
  const petId = route.params?.petId;
  const isEditing = petId !== undefined;
  const existing = usePet(petId ?? '');
  const create = useCreatePet();
  const update = useUpdatePet(petId ?? '');
  const styles = useThemedStyles(makeStyles);

  if (isEditing && existing.isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Editar mascota"
          onBack={() => navigation.goBack()}
          testID="pet-form-header"
        />
        <Spinner style={styles.loader} />
      </View>
    );
  }

  if (isEditing && existing.isError) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Editar mascota"
          onBack={() => navigation.goBack()}
          testID="pet-form-header"
        />
        <ErrorState
          message={existing.error.message}
          onRetry={() => void existing.refetch()}
          style={styles.loader}
        />
      </View>
    );
  }

  const initial = existing.data ? toValues(existing.data) : EMPTY_VALUES;

  return (
    <PetForm
      key={petId ?? 'new'}
      title={isEditing ? 'Editar mascota' : 'Nueva mascota'}
      onBack={() => navigation.goBack()}
      initial={initial}
      submitLabel={isEditing ? 'Guardar cambios' : 'Añadir mascota'}
      isPending={create.isPending || update.isPending}
      errorMessage={(create.error ?? update.error)?.message}
      onSubmit={(input) => {
        if (isEditing) {
          update.mutate(input, { onSuccess: () => navigation.goBack() });
          return;
        }
        create.mutate(input, {
          onSuccess: (pet) => navigation.replace('PetDetail', { petId: pet.id }),
        });
      }}
    />
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
    marginTop: spacing.s1,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  loader: {
    flex: 1,
    backgroundColor: theme.background,
  },
});
