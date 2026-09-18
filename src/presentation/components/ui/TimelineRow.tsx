import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { JSX } from 'react';
import type { FontVariant, StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export interface TimelineRowProps {
  /**
   * Already formatted wall-clock label, e.g. "10:00". The gutter is sized for a
   * single time; longer strings ellipsize rather than push the row sideways.
   */
  time: string;
  title: string;
  meta?: string;
  /** Closes the vertical rail: pass `true` for the last row of the day. */
  isLast?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * One entry of the day's timeline.
 *
 * The time lives in its own gutter, left of a rail, so several entries read as
 * one continuous day instead of a stack of cards. The rail is decorative; the
 * time is real text and is also part of the accessible label, so nothing is
 * conveyed by position alone.
 */
export const TimelineRow = ({
  time,
  title,
  meta,
  isLast = false,
  onPress,
  style,
  testID,
}: TimelineRowProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  const content = (
    <>
      <Text style={styles.time} numberOfLines={1}>
        {time}
      </Text>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {isLast ? null : <View style={styles.line} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, style]} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${time}, ${title}, ${meta}` : `${time}, ${title}`}
      testID={testID}
    >
      {content}
    </TouchableOpacity>
  );
};

const RAIL_WIDTH = 16;

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.s2,
    minHeight: 44,
    paddingVertical: spacing.s2,
  },
  time: {
    ...typography.caption,
    color: theme.textMuted,
    width: 58,
    paddingTop: spacing.s1,
    fontVariant: ['tabular-nums'] as FontVariant[],
  },
  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center' as const,
    alignSelf: 'stretch' as const,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: theme.primaryDark,
    marginTop: spacing.s2,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: theme.border,
  },
  body: {
    flex: 1,
    gap: spacing.s0,
  },
  title: {
    ...typography.bodyLarge,
    color: theme.text,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
});
