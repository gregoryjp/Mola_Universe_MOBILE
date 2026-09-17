import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Card } from '@presentation/components/ui';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import type { CapabilityMeta } from '../capabilities';

interface Props {
  meta: CapabilityMeta;
  expanded: boolean;
  disabled: boolean;
  onPress: () => void;
}

/** One capability, selectable. Selecting it reveals its params panel. */
export const CapabilityCard = ({ meta, expanded, disabled, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Card
      variant="interactive"
      size="sm"
      onPress={disabled ? undefined : onPress}
      accessibilityLabel={meta.label}
      testID={`meow-capability-${meta.id}`}
    >
      <View style={styles.body}>
        <View style={styles.heading}>
          <Text style={styles.label}>{meta.label}</Text>
          {expanded ? <View style={styles.dot} /> : null}
        </View>
        <Text style={styles.description}>{meta.description}</Text>
        {disabled ? <Text style={styles.blocked}>Necesita un hogar activo</Text> : null}
      </View>
    </Card>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  body: {
    gap: spacing.s1,
  },
  heading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s2,
  },
  label: {
    ...typography.body,
    color: theme.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.lg,
    backgroundColor: theme.primary,
  },
  description: {
    ...typography.caption,
    color: theme.textMuted,
  },
  blocked: {
    ...typography.caption,
    color: theme.warning,
  },
});
