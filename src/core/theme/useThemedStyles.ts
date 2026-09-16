import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ColorTokens } from './colors';
import { useTheme } from './useTheme';

/**
 * Builds a StyleSheet from the active colour tokens.
 *
 * Existing screens declare their styles at module level, where a hook cannot
 * run, so the theme cannot reach them. Turning the module-level object into a
 * `makeStyles(theme)` factory and calling this hook inside the component keeps
 * the styles static (the factory lives at module level and is therefore a stable
 * dependency) while letting them react to light/dark.
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: ColorTokens) => T,
): T => {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
};
