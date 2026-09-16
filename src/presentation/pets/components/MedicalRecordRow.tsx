import { colors, spacing, typography } from '@core/theme';
import type { PetMedicalRecord } from '@domain/pets/entities/Pet';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MEDICAL_RECORD_TYPE_LABELS: Record<PetMedicalRecord['type'], string> = {
  CONSULTATION: 'Consulta',
  VACCINE: 'Vacuna',
  TREATMENT: 'Tratamiento',
  MEDICATION: 'Medicación',
  CHECKUP: 'Revisión',
};

interface Props {
  record: PetMedicalRecord;
  onDelete?: () => void;
}

export const MedicalRecordRow = ({ record, onDelete }: Props): JSX.Element => (
  <View style={styles.row}>
    <View style={styles.header}>
      <Text style={styles.type}>{MEDICAL_RECORD_TYPE_LABELS[record.type]}</Text>
      <Text style={styles.date}>{record.date.slice(0, 10)}</Text>
    </View>
    <Text style={styles.title}>{record.title}</Text>
    {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
    {record.nextDueDate ? (
      <Text style={styles.due}>Próxima: {record.nextDueDate.slice(0, 10)}</Text>
    ) : null}
    {onDelete ? (
      <TouchableOpacity onPress={onDelete} accessibilityRole="button">
        <Text style={styles.delete}>Eliminar registro</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    ...typography.caption,
    color: colors.primary,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  notes: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  due: {
    ...typography.caption,
    color: colors.warning,
  },
  delete: {
    ...typography.caption,
    color: colors.error,
  },
});
