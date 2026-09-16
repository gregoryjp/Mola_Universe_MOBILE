import type { JSX } from 'react';
import { useEffect } from 'react';
import { registerAuthInterceptors } from '@core/config/authInterceptors';
import { RootNavigator } from '@core/navigation/RootNavigator';
import { QueryProvider } from '@core/query/QueryProvider';
import { useAuthStore } from '@shared/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

registerAuthInterceptors();

export default function App(): JSX.Element {
  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </SafeAreaProvider>
  );
}
