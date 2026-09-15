import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Providers } from './_providers';
import { useSessionStore } from '../shared/auth/secure-session-store';

SplashScreen.hideAsync();

function RootLayoutContent() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!accessToken && inAppGroup) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <RootLayoutContent />
    </Providers>
  );
}
