import type { JSX } from 'react';
import { RootNavigator } from '@core/navigation/RootNavigator';
import { QueryProvider } from '@core/query/QueryProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </SafeAreaProvider>
  );
}
