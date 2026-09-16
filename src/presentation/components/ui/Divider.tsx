import type { ColorTokens } from '@core/theme';
import { useThemedStyles } from '@core/theme';
import { type StyleProp, View, type ViewStyle } from 'react-native';

interface DividerProps {
  /** Vertical rules are useful inside rows; horizontal is the default. */
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * GAP 3: no design-system doc specifies a Divider. This is the minimum that
 * reads as one — 1px of the `border` token — so nothing outside the token set is
 * introduced, but the component has no approved spec to follow.
 */
const makeStyles = (theme: ColorTokens) => ({
  horizontal: { height: 1, width: '100%' as const, backgroundColor: theme.border },
  vertical: { width: 1, alignSelf: 'stretch' as const, backgroundColor: theme.border },
});

export const Divider = ({ orientation = 'horizontal', style, testID }: DividerProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      testID={testID}
      accessibilityRole="none"
      style={[orientation === 'vertical' ? styles.vertical : styles.horizontal, style]}
    />
  );
};
