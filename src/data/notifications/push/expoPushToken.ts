import * as Notifications from 'expo-notifications';

export type ExpoPushTokenResult = { granted: true; token: string } | { granted: false };

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

  const token = await Notifications.getExpoPushTokenAsync();
  return { granted: true, token: token.data };
};
