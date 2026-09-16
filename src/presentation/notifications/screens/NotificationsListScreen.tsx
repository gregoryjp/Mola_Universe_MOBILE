import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NotificationPreferencesSection,
  type SwitchablePreference,
} from '../components/NotificationPreferencesSection';
import { NotificationRow } from '../components/NotificationRow';
import {
  useMarkNotificationRead,
  useRegisterPushDevice,
  useUpdateNotificationPreferences,
} from '../hooks/useNotificationMutations';
import { useNotificationPreferences, useNotificationsList } from '../hooks/useNotifications';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationsList'>;

export const NotificationsListScreen = (_props: Props): JSX.Element => {
  const notifications = useNotificationsList();
  const preferences = useNotificationPreferences();
  const markAsRead = useMarkNotificationRead();
  const updatePreferences = useUpdateNotificationPreferences();
  const registerPush = useRegisterPushDevice();

  const unreadCount = (notifications.data ?? []).filter((item) => item.readAt === null).length;

  const togglePreference = (key: SwitchablePreference, value: boolean): void => {
    updatePreferences.mutate({ [key]: value });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Notificaciones</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => registerPush.mutate()}
        disabled={registerPush.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {registerPush.isPending ? 'Activando…' : 'Activar avisos push en este dispositivo'}
        </Text>
      </TouchableOpacity>
      {registerPush.data?.registered === false ? (
        <Text style={styles.error}>
          No se activaron los avisos: falta el permiso de notificaciones.
        </Text>
      ) : null}
      {registerPush.data?.registered === true ? (
        <Text style={styles.muted}>Avisos push activados en este dispositivo.</Text>
      ) : null}
      {registerPush.isError ? <Text style={styles.error}>{registerPush.error.message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
        </Text>
        {notifications.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {notifications.isError ? (
          <Text style={styles.error}>{notifications.error.message}</Text>
        ) : null}
        {(notifications.data ?? []).map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onPress={() => {
              if (notification.readAt === null) markAsRead.mutate(notification.id);
            }}
          />
        ))}
        {notifications.data && notifications.data.length === 0 ? (
          <Text style={styles.muted}>No tienes notificaciones todavía</Text>
        ) : null}
      </View>

      {preferences.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {preferences.isError ? <Text style={styles.error}>{preferences.error.message}</Text> : null}
      {preferences.data ? (
        <NotificationPreferencesSection
          preferences={preferences.data}
          disabled={updatePreferences.isPending}
          onToggle={togglePreference}
        />
      ) : null}
      {updatePreferences.isError ? (
        <Text style={styles.error}>{updatePreferences.error.message}</Text>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
