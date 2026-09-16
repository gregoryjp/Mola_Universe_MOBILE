import { Platform } from 'react-native';

/**
 * Shadow tokens — design/foundations/shadows.md.
 *
 * The doc gives CSS box-shadow values and does not split iOS from Android. The
 * iOS-style props also work on react-native-web (they map to box-shadow), so
 * `default` carries them and Android overrides with the elevation equivalent.
 * Rule from the doc: never go past `lg` on cards.
 */
export const shadows = {
  sm: Platform.select({
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
  }),
  lg: Platform.select({
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
  }),
  xl: Platform.select({
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
    },
    android: { elevation: 8 },
  }),
} as const;
