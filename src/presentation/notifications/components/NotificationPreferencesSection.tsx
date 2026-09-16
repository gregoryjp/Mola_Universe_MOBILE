import { colors, spacing, typography } from '@core/theme';
import type { NotificationPreferences } from '@domain/notifications/entities/Notification';
import type { JSX } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

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
}

export const NotificationPreferencesSection = ({
  preferences,
  disabled,
  onToggle,
}: Props): JSX.Element => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Avisos por categoría</Text>
    {SWITCHABLE_PREFERENCES.map(({ key, label }) => (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={preferences[key]}
          disabled={disabled}
          onValueChange={(value) => onToggle(key, value)}
          trackColor={{ false: colors.border, true: colors.primaryDark }}
          thumbColor={colors.text}
        />
      </View>
    ))}
    <Text style={styles.hint}>
      Los avisos de seguridad y SOS siempre se envían. El horario de silencio se configura más
      adelante.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
