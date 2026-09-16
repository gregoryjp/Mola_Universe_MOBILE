import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { CreatePetInput, Pet } from '@domain/pets/entities/Pet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
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
  initial: PetFormValues;
  submitLabel: string;
  isPending: boolean;
  errorMessage: string | undefined;
  onSubmit: (input: CreatePetInput) => void;
}

const PetForm = ({
  initial,
  submitLabel,
  isPending,
  errorMessage,
  onSubmit,
}: FormProps): JSX.Element => {
  const [values, setValues] = useState<PetFormValues>(initial);

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
      <TextInput
        style={styles.input}
        placeholder="Nombre (ej. Luna)"
        placeholderTextColor={colors.textMuted}
        value={values.name}
        onChangeText={set('name')}
      />
      <TextInput
        style={styles.input}
        placeholder="Especie (ej. Perro)"
        placeholderTextColor={colors.textMuted}
        value={values.species}
        onChangeText={set('species')}
      />
      <TextInput
        style={styles.input}
        placeholder="Raza"
        placeholderTextColor={colors.textMuted}
        value={values.breed}
        onChangeText={set('breed')}
      />
      <TextInput
        style={styles.input}
        placeholder="Nacimiento (AAAA-MM-DD)"
        placeholderTextColor={colors.textMuted}
        value={values.birthDate}
        onChangeText={set('birthDate')}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Peso en kg (ej. 12.5)"
        placeholderTextColor={colors.textMuted}
        value={values.weightKg}
        onChangeText={set('weightKg')}
        keyboardType="decimal-pad"
      />
      {!weightIsValid ? <Text style={styles.error}>El peso debe ser un número</Text> : null}

      <Text style={styles.sectionTitle}>Salud</Text>
      <TextInput
        style={styles.input}
        placeholder="Alergias"
        placeholderTextColor={colors.textMuted}
        value={values.allergies}
        onChangeText={set('allergies')}
      />
      <TextInput
        style={styles.input}
        placeholder="Nº de microchip"
        placeholderTextColor={colors.textMuted}
        value={values.microchipNumber}
        onChangeText={set('microchipNumber')}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Notas"
        placeholderTextColor={colors.textMuted}
        value={values.notes}
        onChangeText={set('notes')}
        multiline
      />

      <Text style={styles.sectionTitle}>Veterinario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del veterinario"
        placeholderTextColor={colors.textMuted}
        value={values.vetName}
        onChangeText={set('vetName')}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono del veterinario"
        placeholderTextColor={colors.textMuted}
        value={values.vetPhone}
        onChangeText={set('vetPhone')}
        keyboardType="phone-pad"
      />

      <Text style={styles.sectionTitle}>Contacto de emergencia</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.textMuted}
        value={values.emergencyContactName}
        onChangeText={set('emergencyContactName')}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor={colors.textMuted}
        value={values.emergencyContactPhone}
        onChangeText={set('emergencyContactPhone')}
        keyboardType="phone-pad"
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TouchableOpacity
        style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={() => {
          if (canSubmit) onSubmit(toInput(values));
        }}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{isPending ? 'Guardando…' : submitLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export const PetFormScreen = ({ navigation, route }: Props): JSX.Element => {
  const petId = route.params?.petId;
  const isEditing = petId !== undefined;
  const existing = usePet(petId ?? '');
  const create = useCreatePet();
  const update = useUpdatePet(petId ?? '');

  if (isEditing && existing.isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.primary} />;
  }

  if (isEditing && existing.isError) {
    return <Text style={[styles.error, styles.loader]}>{existing.error.message}</Text>;
  }

  const initial = existing.data ? toValues(existing.data) : EMPTY_VALUES;

  return (
    <PetForm
      key={petId ?? 'new'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
