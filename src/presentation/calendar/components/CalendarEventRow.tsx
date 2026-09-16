import { colors, spacing, typography } from '@core/theme';
import type { CalendarEvent } from '@domain/calendar/entities/CalendarEvent';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  event: CalendarEvent;
  onPress: () => void;
}

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const CalendarEventRow = ({ event, onPress }: Props): JSX.Element => (
  <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
    <View style={styles.info}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>{formatDate(event.startAt)}</Text>
    </View>
    <Text style={styles.badge}>{event.type}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badge: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
