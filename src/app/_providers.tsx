import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { queryClient } from '../shared/providers';
import { useSessionStore } from '../shared/auth/secure-session-store';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrate = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate().then(() => setIsHydrated(true));
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const content = children;

  if (Platform.OS === 'web') {
    return <>{content}</>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {content}
    </QueryClientProvider>
  );
}
