import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import type { NotificationPreferences } from '@domain/notifications/entities/Notification';
import type { JSX } from 'react';
import { Switch, Text, View } from 'react-native';

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
}: Props): JSX.Element => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

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
        Los avisos de seguridad y SOS siempre se envían. El horario de silencio se configura más
        adelante.
      </Text>
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
});
