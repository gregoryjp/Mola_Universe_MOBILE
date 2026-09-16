import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { CalendarEvent } from '@domain/calendar/entities/CalendarEvent';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  event: CalendarEvent;
  onPress: () => void;
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const CalendarEventRow = ({ event, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      accessibilityHint="Abre el detalle del evento"
    >
      <View style={styles.info}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>{formatDate(event.startAt)}</Text>
      </View>
      <Text style={styles.badge}>{event.type}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    gap: spacing.s2,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  badge: {
    ...typography.caption,
    color: theme.textMuted,
  },
});
