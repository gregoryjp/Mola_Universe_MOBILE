import {
  getExpoPushTokenSilently,
  getPushPermissionStatus,
  type PushPermissionStatus,
} from '@data/notifications/push/expoPushToken';
import { notificationRepository } from '@data/notifications/repositories/NotificationRepositoryImpl';
import { useAuthStore } from '@shared/store/authStore';
import { useQuery } from '@tanstack/react-query';
import {
  pushRegistrationStatusQueryKey,
  pushRegistrationStatusQueryPrefix,
} from './pushRegistrationKeys';

export { pushRegistrationStatusQueryKey, pushRegistrationStatusQueryPrefix };

/** `active` = push will reach this device. `inactive` = no permission yet. */
export type PushRegistrationState = 'active' | 'inactive' | 'failed';

export interface PushRegistrationStatus {
  state: PushRegistrationState;
  permission: PushPermissionStatus;
}

/**
 * Reads the OS permission first. Only when it is ALREADY granted does it
 * resolve the Expo token and hand it to the backend, whose route is an
 * idempotent upsert (`db.pushDevice.upsert`, verified in
 * modules/notifications/repository/notificationRepository.ts). That makes it
 * safe to run on every session start.
 *
 * It never prompts: the permission dialog belongs to the explicit button in
 * the notifications screen, not to app start.
 */
const resolvePushRegistration = async (): Promise<PushRegistrationStatus> => {
  const permission = await getPushPermissionStatus();
  if (permission !== 'granted') return { state: 'inactive', permission };

  const pushToken = await getExpoPushTokenSilently();
  if (!pushToken.granted) return { state: 'inactive', permission };

  const result = await notificationRepository.registerDevice(pushToken.token);
  if (!result.success || !result.value.registered) return { state: 'failed', permission };

  return { state: 'active', permission };
};

/**
 * Single source of truth for "will push reach this device?".
 *
 * TD-026: mounting this under the authenticated tree auto-registers the device
 * on login and on every app start with a live session, and — because the state
 * is query-backed rather than mutation-local — the UI can finally show the real
 * status instead of a button that always looks like nothing is registered.
 */
export const usePushRegistrationStatus = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery<PushRegistrationStatus>({
    queryKey: pushRegistrationStatusQueryKey(userId),
    queryFn: resolvePushRegistration,
    enabled: isAuthenticated,
    // The device stays registered for as long as the backend row exists, so a
    // second read within the session adds nothing. Explicit invalidation after
    // the manual activation button is what refreshes permission changes.
    staleTime: Infinity,
    retry: false,
  });
};
