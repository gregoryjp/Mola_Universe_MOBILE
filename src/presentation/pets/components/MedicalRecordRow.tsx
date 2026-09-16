import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { PetMedicalRecord } from '@domain/pets/entities/Pet';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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

export const MedicalRecordRow = ({ record, onDelete }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
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
        <TouchableOpacity
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar registro ${record.title}`}
        >
          <Text style={styles.delete}>Eliminar registro</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  type: {
    ...typography.caption,
    color: theme.primary,
  },
  date: {
    ...typography.caption,
    color: theme.textMuted,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  notes: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  due: {
    ...typography.caption,
    color: theme.warning,
  },
  delete: {
    ...typography.caption,
    color: theme.error,
    paddingVertical: spacing.s2,
  },
});
