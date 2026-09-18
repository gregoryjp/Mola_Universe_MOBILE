import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { ChevronLeft } from 'lucide-react-native';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { IconButton } from './IconButton';

interface ScreenHeaderProps {
  title: string;
  /**
   * Renders the back affordance. Omit on screens that are the root of what the
   * user is doing (the five tabs): they are never pushed, so they have nothing
   * to go back to.
   */
  onBack?: () => void;
  testID?: string;
}

/**
 * Section title with an optional way back.
 *
 * The root stack hides its native header (see RootNavigator), so every pushed
 * screen owns its own exit. Without it, opening a section from Casa is a dead
 * end anywhere the platform has no hardware back button — iOS relies on the
 * edge-swipe gesture, which a first-time user has no reason to guess.
 */
export const ScreenHeader = ({ title, onBack, testID }: ScreenHeaderProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row} testID={testID}>
      {onBack ? (
        <IconButton
          icon={ChevronLeft}
          onPress={onBack}
          accessibilityLabel="Volver"
          size={40}
          testID={testID === undefined ? undefined : `${testID}-back`}
        />
      ) : null}
      <Text style={styles.title} accessibilityRole="header" numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s3,
  },
  title: {
    ...typography.h2,
    color: theme.text,
    flex: 1,
  },
});
