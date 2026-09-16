import { useColorScheme } from 'react-native';
import { colors } from './colors';

/** Colour tokens for the scheme the OS reports (light is the default). */
export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
};
