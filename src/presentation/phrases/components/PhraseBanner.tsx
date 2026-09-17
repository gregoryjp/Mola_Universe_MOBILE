import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { PhraseContext, PhraseModule } from '@domain/phrases/entities/Phrase';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { usePhrase } from '../hooks/usePhrase';

interface PhraseBannerProps {
  module: PhraseModule;
  context: PhraseContext;
  testID?: string;
}

/**
 * A line from the phrase bank, rendered inline wherever it fits. It is
 * decoration, not content: while it loads, or if the bank is unreachable, it
 * renders nothing. Showing an error box for an encouragement line would make
 * the screen worse than having no line at all.
 */
export const PhraseBanner = ({
  module,
  context,
  testID,
}: PhraseBannerProps): JSX.Element | null => {
  const { phrase } = usePhrase(module, context);
  const styles = useThemedStyles(makeStyles);

  if (!phrase) return null;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.text}>{phrase.text}</Text>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    backgroundColor: theme.surfaceAlt,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s4,
  },
  text: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
});
