import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { PetMedicalRecordType } from '@domain/pets/entities/Pet';
import { Button, ErrorState, Input, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MEDICAL_RECORD_TYPE_LABELS, MedicalRecordRow } from '../components/MedicalRecordRow';
import { PetPermissionsSection } from '../components/PetPermissionsSection';
import {
  useArchivePet,
  useCreateMedicalRecord,
  useCreatePetCareTask,
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

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const PetDetailScreen = ({ navigation, route }: Props): JSX.Element => {
  const { petId } = route.params;
  const pet = usePet(petId);
  const records = usePetMedicalRecords(petId);
  const permissions = usePetPermissions();
  const createRecord = useCreateMedicalRecord(petId);
  const createCareTask = useCreatePetCareTask(petId);
  const deleteRecord = useDeleteMedicalRecord(petId);
  const setPermission = useSetPetPermission();
  const archive = useArchivePet();

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordType, setRecordType] = useState<PetMedicalRecordType>('CONSULTATION');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(todayIso());
  const [taskRotative, setTaskRotative] = useState(false);
  const styles = useThemedStyles(makeStyles);

  const canSaveRecord =
    recordTitle.trim().length > 0 && recordDate.trim().length > 0 && !createRecord.isPending;

  const canSaveTask =
    taskTitle.trim().length > 0 && taskDueDate.trim().length > 0 && !createCareTask.isPending;

  const saveCareTask = (): void => {
    if (!canSaveTask) return;
    createCareTask.mutate(
      {
        title: taskTitle.trim(),
        dueDate: taskDueDate.trim(),
        ...(taskRotative && { rotative: true }),
      },
      {
        onSuccess: () => {
          setTaskTitle('');
          setTaskDueDate(todayIso());
          setTaskRotative(false);
          setShowTaskForm(false);
        },
      },
    );
  };

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
    return <Spinner style={styles.loader} />;
  }

  if (pet.isError || !pet.data) {
    return (
      <View style={styles.loader}>
        <ErrorState
          message={pet.error?.message ?? 'Mascota no encontrada'}
          onRetry={() => void pet.refetch()}
        />
      </View>
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
        <Button
          label="Editar mascota"
          onPress={() => navigation.navigate('PetForm', { petId })}
          variant="secondary"
          style={styles.rowButton}
          accessibilityHint="Abre el formulario para editar esta mascota"
        />
        <Button
          label="Archivar mascota"
          disabled={archive.isPending}
          onPress={() => {
            archive.mutate(petId, { onSuccess: () => navigation.goBack() });
          }}
          loading={archive.isPending}
          variant="danger"
          style={styles.rowButton}
          accessibilityHint="Archiva esta mascota"
        />
      </View>
      {archive.isError ? <Text style={styles.error}>{archive.error.message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial médico</Text>
        {records.isLoading ? <Spinner /> : null}
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
                accessibilityLabel={`Tipo de registro ${MEDICAL_RECORD_TYPE_LABELS[type]}`}
              >
                <Text style={[styles.chipText, recordType === type ? styles.chipTextActive : null]}>
                  {MEDICAL_RECORD_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label="Título"
            value={recordTitle}
            onChangeText={setRecordTitle}
            placeholder="Título (ej. Vacuna antirrábica)"
            required
            testID="pet-record-title"
          />
          <Input
            label="Fecha"
            value={recordDate}
            onChangeText={setRecordDate}
            placeholder="Fecha (AAAA-MM-DD)"
            autoCapitalize="none"
            required
            testID="pet-record-date"
          />
          {createRecord.isError ? (
            <Text style={styles.error}>{createRecord.error.message}</Text>
          ) : null}
          <Button
            label="Guardar registro"
            disabled={!canSaveRecord}
            onPress={saveRecord}
            loading={createRecord.isPending}
            size="lg"
            accessibilityHint="Guarda el registro médico de la mascota"
            testID="pet-record-submit"
          />
        </View>
      ) : (
        <Button
          label="+ Registro médico"
          onPress={() => setShowRecordForm(true)}
          size="lg"
          accessibilityHint="Muestra el formulario de registro médico"
        />
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tareas de cuidado</Text>
        <Text style={styles.muted}>
          Crea una tarea de este hogar ligada a {current.name}. Aparecerá en Tareas con la categoría
          Mascotas.
        </Text>
        {showTaskForm ? (
          <>
            <Input
              label="Título"
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Título (ej. Sacar a pasear)"
              required
              testID="pet-task-title"
            />
            <Input
              label="Fecha límite"
              value={taskDueDate}
              onChangeText={setTaskDueDate}
              placeholder="AAAA-MM-DD"
              autoCapitalize="none"
              required
              testID="pet-task-due-date"
            />
            <TouchableOpacity
              style={[styles.chip, taskRotative ? styles.chipActive : null, styles.chipWide]}
              onPress={() => setTaskRotative((previous) => !previous)}
              accessibilityRole="button"
              accessibilityState={{ checked: taskRotative }}
              accessibilityLabel="Turnos rotativos entre los miembros del hogar"
              testID="pet-task-rotative"
            >
              <Text style={[styles.chipText, taskRotative ? styles.chipTextActive : null]}>
                Turnos rotativos
              </Text>
            </TouchableOpacity>
            {createCareTask.isError ? (
              <Text style={styles.error}>{createCareTask.error.message}</Text>
            ) : null}
            <Button
              label="Crear tarea"
              disabled={!canSaveTask}
              onPress={saveCareTask}
              loading={createCareTask.isPending}
              size="lg"
              accessibilityHint="Crea una tarea de cuidado ligada a esta mascota"
              testID="pet-task-submit"
            />
            <Button
              label="Cancelar"
              onPress={() => setShowTaskForm(false)}
              variant="ghost"
              size="lg"
            />
          </>
        ) : (
          <Button
            label="+ Tarea de cuidado"
            onPress={() => setShowTaskForm(true)}
            size="lg"
            accessibilityHint="Muestra el formulario de tarea de cuidado"
            testID="pet-task-open"
          />
        )}
      </View>

      {permissions.isLoading ? <Spinner /> : null}
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

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s2,
  },
  loader: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s1,
    marginTop: spacing.s2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  alert: {
    ...typography.bodySmall,
    color: theme.warning,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  row: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
    marginTop: spacing.s2,
  },
  rowButton: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s1,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center' as const,
    backgroundColor: theme.surface,
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
  chipWide: {
    alignSelf: 'flex-start' as const,
  },
  chipText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  chipTextActive: {
    color: theme.textInverse,
  },
});
