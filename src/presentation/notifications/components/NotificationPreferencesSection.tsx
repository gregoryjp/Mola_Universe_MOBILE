import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import type { NotificationPreferences } from '@domain/notifications/entities/Notification';
import { Button, Input } from '@presentation/components/ui';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import {
  isQuietHoursConfigured,
  type QuietHoursDraft,
  toQuietHoursDraft,
  validateQuietHours,
} from '../quietHours';

/** The six categories the backend lets the user switch off (SECURITY/SOS always deliver). */
export type SwitchablePreference = Exclude<
  keyof NotificationPreferences,
  'quietHoursStart' | 'quietHoursEnd'
>;

export const SWITCHABLE_PREFERENCES: readonly {
  key: SwitchablePreference;
  label: string;
}[] = [
  { key: 'tasksEnabled', label: 'Tareas' },
  { key: 'calendarEnabled', label: 'Calendario' },
  { key: 'shoppingEnabled', label: 'Compra' },
  { key: 'inventoryEnabled', label: 'Inventario' },
  { key: 'expensesEnabled', label: 'Gastos' },
  { key: 'accountEnabled', label: 'Cuenta' },
];

interface Props {
  preferences: NotificationPreferences;
  disabled: boolean;
  onToggle: (key: SwitchablePreference, value: boolean) => void;
  onUpdateQuietHours: (value: {
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
  }) => void;
}

export const NotificationPreferencesSection = ({
  preferences,
  disabled,
  onToggle,
  onUpdateQuietHours,
}: Props): JSX.Element => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  /**
   * The time fields keep a local draft instead of writing through on every
   * keystroke: "2", "22", "22:" are all invalid and none of them should reach
   * the API. The toggle rows above can write through because a boolean has no
   * intermediate state.
   */
  const [draft, setDraft] = useState<QuietHoursDraft>(() => toQuietHoursDraft(preferences));
  const [error, setError] = useState<string | null>(null);

  const { quietHoursStart, quietHoursEnd } = preferences;

  // Re-sync against the server value: a save, or a change made on another
  // device, must land in the fields rather than be overwritten by this draft.
  // Depending on the two values (not on `preferences`) keeps a refetch that
  // returns the same window from clobbering what the user is typing.
  useEffect(() => {
    setDraft(toQuietHoursDraft({ quietHoursStart, quietHoursEnd }));
    setError(null);
  }, [quietHoursStart, quietHoursEnd]);

  const saveQuietHours = (): void => {
    const result = validateQuietHours(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onUpdateQuietHours(result.value);
  };

  const clearQuietHours = (): void => {
    setDraft({ start: '', end: '' });
    setError(null);
    onUpdateQuietHours({ quietHoursStart: null, quietHoursEnd: null });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Avisos por categoría</Text>
      {SWITCHABLE_PREFERENCES.map(({ key, label }) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Switch
            value={preferences[key]}
            disabled={disabled}
            onValueChange={(value) => onToggle(key, value)}
            trackColor={{ false: theme.border, true: theme.primaryDark }}
            thumbColor={theme.text}
            accessibilityLabel={`Avisos de ${label}`}
          />
        </View>
      ))}
      <Text style={styles.hint}>
        Los avisos de seguridad y SOS siempre se envían, aunque silencies el resto.
      </Text>

      <Text style={[styles.sectionTitle, styles.quietHeading]}>Horario de silencio</Text>
      <View style={styles.quietCard}>
        <Text style={styles.hint}>
          Dentro de esta franja no se envían avisos. Las horas van en{' '}
          <Text style={styles.strong}>UTC</Text> (la hora del servidor), que no tiene por qué
          coincidir con la de tu dispositivo.
        </Text>
        <View style={styles.quietFields}>
          <View style={styles.quietField}>
            <Input
              label="Desde"
              value={draft.start}
              onChangeText={(value) => setDraft((prev) => ({ ...prev, start: value }))}
              placeholder="22:00"
              maxLength={5}
              autoCapitalize="none"
              helperText="HH:mm"
              testID="quiet-hours-start"
            />
          </View>
          <View style={styles.quietField}>
            <Input
              label="Hasta"
              value={draft.end}
              onChangeText={(value) => setDraft((prev) => ({ ...prev, end: value }))}
              placeholder="07:00"
              maxLength={5}
              autoCapitalize="none"
              helperText="HH:mm"
              testID="quiet-hours-end"
            />
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>
          {isQuietHoursConfigured(preferences)
            ? `Activo de ${preferences.quietHoursStart} a ${preferences.quietHoursEnd} (UTC).`
            : 'Sin horario de silencio: se envían todos los avisos.'}
        </Text>
        <View style={styles.quietActions}>
          <Button
            label="Guardar horario"
            size="lg"
            onPress={saveQuietHours}
            disabled={disabled}
            loading={disabled}
            testID="quiet-hours-save"
            style={styles.grow}
          />
          {isQuietHoursConfigured(preferences) ? (
            <Button
              label="Quitar"
              variant="secondary"
              size="lg"
              onPress={clearQuietHours}
              disabled={disabled}
              testID="quiet-hours-clear"
              style={styles.grow}
            />
          ) : null}
        </View>
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
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  label: {
    ...typography.body,
    color: theme.text,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
  },
  strong: {
    color: theme.text,
  },
  quietHeading: {
    marginTop: spacing.s2,
  },
  quietCard: {
    gap: spacing.s3,
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
  },
  quietFields: {
    flexDirection: 'row' as const,
    gap: spacing.s3,
  },
  quietField: {
    flex: 1,
  },
  quietActions: {
    flexDirection: 'row' as const,
    gap: spacing.s3,
  },
  grow: {
    flex: 1,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
