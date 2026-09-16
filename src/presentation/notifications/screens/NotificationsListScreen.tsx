import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, ErrorState, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
  const styles = useThemedStyles(makeStyles);

  const unreadCount = (notifications.data ?? []).filter((item) => item.readAt === null).length;

  const togglePreference = (key: SwitchablePreference, value: boolean): void => {
    updatePreferences.mutate({ [key]: value });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Notificaciones</Text>

      <Button
        label="Activar avisos push en este dispositivo"
        onPress={() => registerPush.mutate()}
        loading={registerPush.isPending}
        size="lg"
        accessibilityHint="Registra este dispositivo para recibir avisos push"
        style={styles.fullWidth}
      />
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
        {notifications.isLoading ? <Spinner /> : null}
        {notifications.isError ? <ErrorState message={notifications.error.message} /> : null}
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
          <EmptyState title="No tienes notificaciones todavía" />
        ) : null}
      </View>

      {preferences.isLoading ? <Spinner /> : null}
      {preferences.isError ? <ErrorState message={preferences.error.message} /> : null}
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

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s4,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  fullWidth: {
    alignSelf: 'stretch' as const,
  },
});
