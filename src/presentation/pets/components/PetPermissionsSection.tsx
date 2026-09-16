import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { PetPermission, PetPermissionLevel } from '@domain/pets/entities/Pet';
import { Button, Input } from '@presentation/components/ui';
import { type JSX, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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

const LevelPicker = ({ value, disabled, onSelect }: LevelPickerProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.picker}>
      {PET_PERMISSION_LEVELS.map((level) => (
        <TouchableOpacity
          key={level}
          style={[styles.levelButton, value === level && styles.levelButtonActive]}
          disabled={disabled}
          onPress={() => onSelect(level)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === level }}
          accessibilityLabel={`Nivel ${LEVEL_LABELS[level]}`}
        >
          <Text style={[styles.levelText, value === level && styles.levelTextActive]}>
            {LEVEL_LABELS[level]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

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
  const styles = useThemedStyles(makeStyles);

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
        <Input
          value={userId}
          onChangeText={setUserId}
          placeholder="id de usuario"
          autoCapitalize="none"
          accessibilityLabel="Identificador del usuario"
          testID="pet-permission-user-id"
        />
        <LevelPicker value={level} disabled={disabled} onSelect={setLevel} />
        <Button
          label="Asignar permiso"
          disabled={!canAssign}
          onPress={() => {
            if (!canAssign) return;
            onSetLevel(trimmedUserId, level);
            setUserId('');
          }}
          accessibilityHint="Asigna el nivel elegido al usuario indicado"
          testID="pet-permission-assign"
        />
      </View>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  section: {
    gap: spacing.s1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  muted: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s2,
  },
  rowLabel: {
    ...typography.body,
    color: theme.text,
  },
  picker: {
    flexDirection: 'row' as const,
    gap: spacing.s1,
  },
  levelButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: spacing.s2,
  },
  levelButtonActive: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  levelText: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  levelTextActive: {
    color: theme.text,
  },
});
