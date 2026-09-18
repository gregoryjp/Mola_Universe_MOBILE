import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, ErrorState, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
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
import { usePushRegistrationStatus } from '../hooks/usePushRegistration';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationsList'>;

export const NotificationsListScreen = ({ navigation }: Props): JSX.Element => {
  const notifications = useNotificationsList();
  const preferences = useNotificationPreferences();
  const markAsRead = useMarkNotificationRead();
  const updatePreferences = useUpdateNotificationPreferences();
  const registerPush = useRegisterPushDevice();
  const pushStatus = usePushRegistrationStatus();
  const styles = useThemedStyles(makeStyles);

  const unreadCount = (notifications.data ?? []).filter((item) => item.readAt === null).length;

  const togglePreference = (key: SwitchablePreference, value: boolean): void => {
    updatePreferences.mutate({ [key]: value });
  };

  /**
   * TD-025: the quiet-hours window was reachable in the contract and preserved
   * by the mapper, but had no UI, so the setting was frozen at whatever the
   * server held. Both bounds travel together — the backend ignores a half-set
   * window, so sending one alone would be an invisible no-op.
   */
  const updateQuietHours = (value: {
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
  }): void => {
    updatePreferences.mutate(value);
  };

  /**
   * TD-026: the status shown here comes from the shared, query-backed state
   * (`usePushRegistrationStatus`), not from the mutation that just ran. That is
   * what removes the false positive: a device with the permission already
   * granted no longer shows an "activate" button as if nothing were registered.
   */
  const renderPushRegistration = (): JSX.Element => {
    if (pushStatus.isLoading) return <Spinner />;

    if (pushStatus.data?.state === 'active') {
      return <Text style={styles.muted}>Avisos push activados en este dispositivo.</Text>;
    }

    if (pushStatus.data?.permission === 'denied') {
      return (
        <>
          <Text style={styles.muted}>
            Los avisos push están desactivados para Mola Universe en los ajustes del sistema.
          </Text>
          <Button
            label="Abrir ajustes del sistema"
            variant="secondary"
            size="lg"
            onPress={() => void Linking.openSettings()}
            accessibilityHint="Abre los ajustes del dispositivo para permitir las notificaciones"
            style={styles.fullWidth}
          />
        </>
      );
    }

    if (pushStatus.data?.state === 'failed' || pushStatus.isError) {
      return (
        <>
          <Text style={styles.error}>No se pudieron registrar los avisos en este dispositivo.</Text>
          <Button
            label="Reintentar"
            variant="secondary"
            size="lg"
            onPress={() => void pushStatus.refetch()}
            style={styles.fullWidth}
          />
        </>
      );
    }

    return (
      <>
        <Button
          label="Activar avisos push en este dispositivo"
          onPress={() => registerPush.mutate()}
          loading={registerPush.isPending}
          size="lg"
          accessibilityHint="Registra este dispositivo para recibir avisos push"
          style={styles.fullWidth}
        />
        {registerPush.isError ? (
          <Text style={styles.error}>{registerPush.error.message}</Text>
        ) : null}
      </>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Notificaciones"
        onBack={() => navigation.goBack()}
        testID="notifications-header"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avisos push en este dispositivo</Text>
        {renderPushRegistration()}
      </View>

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
          onUpdateQuietHours={updateQuietHours}
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
