import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { PetMedicalRecordType } from '@domain/pets/entities/Pet';
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
  View,
} from 'react-native';
import { MEDICAL_RECORD_TYPE_LABELS, MedicalRecordRow } from '../components/MedicalRecordRow';
import { PetPermissionsSection } from '../components/PetPermissionsSection';
import {
  useArchivePet,
  useCreateMedicalRecord,
  useDeleteMedicalRecord,
  useSetPetPermission,
} from '../hooks/usePetMutations';
import { usePet, usePetMedicalRecords, usePetPermissions } from '../hooks/usePets';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

const RECORD_TYPES: PetMedicalRecordType[] = [
  'CONSULTATION',
  'VACCINE',
  'TREATMENT',
  'MEDICATION',
  'CHECKUP',
];

export const PetDetailScreen = ({ navigation, route }: Props): JSX.Element => {
  const { petId } = route.params;
  const pet = usePet(petId);
  const records = usePetMedicalRecords(petId);
  const permissions = usePetPermissions();
  const createRecord = useCreateMedicalRecord(petId);
  const deleteRecord = useDeleteMedicalRecord(petId);
  const setPermission = useSetPetPermission();
  const archive = useArchivePet();

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordType, setRecordType] = useState<PetMedicalRecordType>('CONSULTATION');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDate, setRecordDate] = useState('');

  const canSaveRecord =
    recordTitle.trim().length > 0 && recordDate.trim().length > 0 && !createRecord.isPending;

  const saveRecord = (): void => {
    if (!canSaveRecord) return;
    createRecord.mutate(
      { type: recordType, title: recordTitle.trim(), date: recordDate.trim() },
      {
        onSuccess: () => {
          setRecordTitle('');
          setRecordDate('');
          setShowRecordForm(false);
        },
      },
    );
  };

  if (pet.isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.primary} />;
  }

  if (pet.isError || !pet.data) {
    return (
      <Text style={[styles.error, styles.loader]}>
        {pet.error?.message ?? 'Mascota no encontrada'}
      </Text>
    );
  }

  const current = pet.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{current.name}</Text>
      <Text style={styles.meta}>
        {current.species}
        {current.breed ? ` · ${current.breed}` : ''}
        {current.ageYears > 0 ? ` · ${current.ageYears} años` : ''}
        {current.weightKg !== null ? ` · ${current.weightKg} kg` : ''}
      </Text>
      {current.birthDate ? (
        <Text style={styles.meta}>Nacimiento: {current.birthDate.slice(0, 10)}</Text>
      ) : null}
      {current.allergies ? <Text style={styles.alert}>Alergias: {current.allergies}</Text> : null}
      {current.microchipNumber ? (
        <Text style={styles.meta}>Microchip: {current.microchipNumber}</Text>
      ) : null}
      {current.vetName ? (
        <Text style={styles.meta}>
          Veterinario: {current.vetName}
          {current.vetPhone ? ` (${current.vetPhone})` : ''}
        </Text>
      ) : null}
      {current.emergencyContactName ? (
        <Text style={styles.meta}>
          Emergencias: {current.emergencyContactName}
          {current.emergencyContactPhone ? ` (${current.emergencyContactPhone})` : ''}
        </Text>
      ) : null}
      {current.notes ? <Text style={styles.meta}>{current.notes}</Text> : null}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('PetForm', { petId })}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>Editar mascota</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          disabled={archive.isPending}
          onPress={() => {
            archive.mutate(petId, { onSuccess: () => navigation.goBack() });
          }}
          accessibilityRole="button"
        >
          <Text style={styles.dangerText}>
            {archive.isPending ? 'Archivando…' : 'Archivar mascota'}
          </Text>
        </TouchableOpacity>
      </View>
      {archive.isError ? <Text style={styles.error}>{archive.error.message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial médico</Text>
        {records.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {records.isError ? <Text style={styles.error}>{records.error.message}</Text> : null}
        {(records.data ?? []).map((record) => (
          <MedicalRecordRow
            key={record.id}
            record={record}
            onDelete={() => deleteRecord.mutate(record.id)}
          />
        ))}
        {records.data && records.data.length === 0 ? (
          <Text style={styles.muted}>Sin registros médicos todavía</Text>
        ) : null}
        {deleteRecord.isError ? (
          <Text style={styles.error}>{deleteRecord.error.message}</Text>
        ) : null}
      </View>

      {showRecordForm ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevo registro</Text>
          <View style={styles.chips}>
            {RECORD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, recordType === type ? styles.chipActive : null]}
                onPress={() => setRecordType(type)}
                accessibilityRole="button"
                accessibilityState={{ selected: recordType === type }}
              >
                <Text style={[styles.chipText, recordType === type ? styles.chipTextActive : null]}>
                  {MEDICAL_RECORD_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Título (ej. Vacuna antirrábica)"
            placeholderTextColor={colors.textMuted}
            value={recordTitle}
            onChangeText={setRecordTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha (AAAA-MM-DD)"
            placeholderTextColor={colors.textMuted}
            value={recordDate}
            onChangeText={setRecordDate}
            autoCapitalize="none"
          />
          {createRecord.isError ? (
            <Text style={styles.error}>{createRecord.error.message}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.button, canSaveRecord ? null : styles.buttonDisabled]}
            disabled={!canSaveRecord}
            onPress={saveRecord}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {createRecord.isPending ? 'Guardando…' : 'Guardar registro'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowRecordForm(true)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>+ Registro médico</Text>
        </TouchableOpacity>
      )}

      {permissions.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {permissions.isError ? <Text style={styles.error}>{permissions.error.message}</Text> : null}
      {permissions.data ? (
        <PetPermissionsSection
          permissions={permissions.data}
          disabled={setPermission.isPending}
          onSetLevel={(userId, level) => setPermission.mutate({ userId, level })}
        />
      ) : null}
      {setPermission.isError ? (
        <Text style={styles.error}>{setPermission.error.message}</Text>
      ) : null}
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
    gap: spacing.sm,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  alert: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  dangerText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
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
    ...typography.bodySmall,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.background,
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
