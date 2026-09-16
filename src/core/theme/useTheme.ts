import { useColorScheme } from 'react-native';
import { colors } from './colors';

/** Whether the OS reports the dark scheme (light is the default). */
export const useIsDarkScheme = (): boolean => useColorScheme() === 'dark';

/** Colour tokens for the scheme the OS reports (light is the default). */
export const useTheme = () => (useIsDarkScheme() ? colors.dark : colors.light);
