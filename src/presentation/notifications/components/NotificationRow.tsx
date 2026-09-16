import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { AppNotification } from '@domain/notifications/entities/Notification';
import { Badge } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  notification: AppNotification;
  onPress: () => void;
}

export const NotificationRow = ({ notification, onPress }: Props): JSX.Element => {
  const unread = notification.readAt === null;
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={[styles.row, unread ? styles.unreadRow : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.category}: ${notification.title}`}
      accessibilityHint={unread ? 'Marca la notificación como leída' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{notification.category}</Text>
        {unread ? <Badge label="Sin leer" variant="info" size="sm" /> : null}
      </View>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.body}>{notification.body}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    padding: spacing.s4,
    gap: spacing.s1,
  },
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  category: {
    ...typography.caption,
    color: theme.textMuted,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  body: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
});
