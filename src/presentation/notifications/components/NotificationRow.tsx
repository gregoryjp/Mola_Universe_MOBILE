import { colors, spacing, typography } from '@core/theme';
import type { AppNotification } from '@domain/notifications/entities/Notification';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  notification: AppNotification;
  onPress: () => void;
}

export const NotificationRow = ({ notification, onPress }: Props): JSX.Element => {
  const unread = notification.readAt === null;

  return (
    <TouchableOpacity
      style={[styles.row, unread && styles.unreadRow]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.category}>{notification.category}</Text>
        {unread ? <Text style={styles.unreadTag}>Sin leer</Text> : null}
      </View>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.body}>{notification.body}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
  },
  unreadTag: {
    ...typography.caption,
    color: colors.primary,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
