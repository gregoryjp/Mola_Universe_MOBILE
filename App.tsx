import { registerAuthInterceptors } from '@core/config/authInterceptors';
import { RootNavigator } from '@core/navigation/RootNavigator';
import { QueryProvider } from '@core/query/QueryProvider';
import { useAuthStore } from '@shared/store/authStore';
import { hydrateActiveHousehold } from '@shared/store/householdPersistence';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

registerAuthInterceptors();

export default function App(): JSX.Element {
  useEffect(() => {
    void useAuthStore.getState().hydrate();
    // P0-4: restore the persisted active household alongside the session.
    void hydrateActiveHousehold();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </SafeAreaProvider>
  );
}
