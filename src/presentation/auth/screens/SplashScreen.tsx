import type { ColorTokens } from '@core/theme';
import { spacing, useThemedStyles } from '@core/theme';
import { BrandLogo } from '@presentation/components/brand/BrandLogo';
import { Spinner } from '@presentation/components/ui';
import type { JSX } from 'react';
import { View } from 'react-native';

/**
 * Rendered by `RootNavigator` while `isHydrated === false` — the brief window
 * where `App.tsx` is reading the persisted session from secure storage before
 * we know which stack (unauthenticated/unverified/authenticated) to show. Not
 * a route: it takes no params and is never reached by user navigation.
 */
export const SplashScreen = (): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container} testID="splash-screen">
      <BrandLogo width={160} />
      <Spinner size="lg" label="Cargando tu universo..." />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.background,
    gap: spacing.s8,
    padding: spacing.s6,
  },
});
