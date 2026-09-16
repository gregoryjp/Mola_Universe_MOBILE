import { colors, spacing, typography } from '@core/theme';
import type { PetPermission, PetPermissionLevel } from '@domain/pets/entities/Pet';
import { type JSX, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const PET_PERMISSION_LEVELS: readonly PetPermissionLevel[] = ['BASIC', 'REGULAR', 'MEDICAL'];

const LEVEL_LABELS: Record<PetPermissionLevel, string> = {
  BASIC: 'Básico',
  REGULAR: 'Normal',
  MEDICAL: 'Médico',
};

interface LevelPickerProps {
  value: PetPermissionLevel;
  disabled: boolean;
  onSelect: (level: PetPermissionLevel) => void;
}

const LevelPicker = ({ value, disabled, onSelect }: LevelPickerProps): JSX.Element => (
  <View style={styles.picker}>
    {PET_PERMISSION_LEVELS.map((level) => (
      <TouchableOpacity
        key={level}
        style={[styles.levelButton, value === level && styles.levelButtonActive]}
        disabled={disabled}
        onPress={() => onSelect(level)}
        accessibilityRole="button"
      >
        <Text style={[styles.levelText, value === level && styles.levelTextActive]}>
          {LEVEL_LABELS[level]}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

interface Props {
  permissions: PetPermission[];
  disabled: boolean;
  onSetLevel: (userId: string, level: PetPermissionLevel) => void;
}

/**
 * Shows and edits the explicit pet-permission rows of the household. The
 * backend only lists members that have an explicit row (defaults are computed
 * on read: the owner is MEDICAL, everybody else REGULAR), and there is no
 * members endpoint yet, so a level can only be assigned by user id.
 */
export const PetPermissionsSection = ({
  permissions,
  disabled,
  onSetLevel,
}: Props): JSX.Element => {
  const [userId, setUserId] = useState('');
  const [level, setLevel] = useState<PetPermissionLevel>('REGULAR');

  const trimmedUserId = userId.trim();
  const canAssign = trimmedUserId.length > 0 && !disabled;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Permisos de mascotas del hogar</Text>
      <Text style={styles.hint}>
        Cada miembro tiene un nivel: Básico (solo ver), Normal (editar y crear) o Médico (también el
        historial clínico). El propietario es Médico por defecto y el resto Normal.
      </Text>

      {permissions.length === 0 ? (
        <Text style={styles.muted}>Nadie tiene un nivel asignado explícitamente.</Text>
      ) : null}

      {permissions.map((permission) => (
        <View key={permission.userId} style={styles.row}>
          <Text style={styles.rowLabel}>Usuario {permission.userId.slice(0, 8)}…</Text>
          <LevelPicker
            value={permission.level}
            disabled={disabled}
            onSelect={(next) => onSetLevel(permission.userId, next)}
          />
        </View>
      ))}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Asignar a otro usuario</Text>
        <TextInput
          style={styles.input}
          value={userId}
          onChangeText={setUserId}
          placeholder="id de usuario"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          accessibilityLabel="Identificador del usuario"
        />
        <LevelPicker value={level} disabled={disabled} onSelect={setLevel} />
        <TouchableOpacity
          style={[styles.assignButton, !canAssign && styles.assignButtonDisabled]}
          disabled={!canAssign}
          onPress={() => {
            if (!canAssign) return;
            onSetLevel(trimmedUserId, level);
            setUserId('');
          }}
          accessibilityRole="button"
        >
          <Text style={styles.assignText}>Asignar permiso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  muted: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  picker: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  levelButton: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  levelText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  levelTextActive: {
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  assignButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  assignButtonDisabled: {
    opacity: 0.5,
  },
  assignText: {
    ...typography.bodySmall,
    color: colors.background,
  },
});
