import * as Notifications from 'expo-notifications';

export type ExpoPushTokenResult = { granted: true; token: string } | { granted: false };

/** The three OS permission states, mapped straight from expo-notifications. */
export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

const resolveToken = async (): Promise<ExpoPushTokenResult> => {
  const token = await Notifications.getExpoPushTokenAsync();
  return { granted: true, token: token.data };
};

/**
 * Reads the current OS permission WITHOUT prompting. Safe to call on app
 * start or right after login, where a system dialog would be hostile.
 */
export const getPushPermissionStatus = async (): Promise<PushPermissionStatus> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};

/**
 * Asks for the notification permission and resolves the device's Expo push
 * token. Only a declined permission is treated as an expected outcome;
 * anything else (simulator without push support, missing EAS projectId)
 * rejects so the caller can surface the real cause.
 */
export const requestExpoPushToken = async (): Promise<ExpoPushTokenResult> => {
  let status = (await Notifications.getPermissionsAsync()).status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return { granted: false };

  return resolveToken();
};

/**
 * Resolves the Expo push token only when the permission was ALREADY granted.
 * Never prompts: returns `{ granted: false }` for `denied` and `undetermined`
 * alike. Used by the silent auto-registration on session start, where the
 * permission dialog is reserved for the explicit button in the UI.
 */
export const getExpoPushTokenSilently = async (): Promise<ExpoPushTokenResult> => {
  const status = await getPushPermissionStatus();
  if (status !== 'granted') return { granted: false };

  return resolveToken();
};
