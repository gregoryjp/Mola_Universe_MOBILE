import type { ColorTokens } from '@core/theme';
import { radius, useTheme, useThemedStyles } from '@core/theme';
import { Image, type StyleProp, Text, View, type ViewStyle } from 'react-native';

/** Exactly the six sizes avatars.md defines, in pixels. */
export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;

interface AvatarProps {
  /** Used for the initials and, when there is no image, the accessible label. */
  name: string;
  imageUrl?: string;
  /** Renders the status dot. */
  status?: 'online' | 'offline';
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Up to two initials, as avatars.md describes ("la(s) inicial(es) del nombre"). */
const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const makeStyles = (theme: ColorTokens) => ({
  base: {
    borderRadius: radius.full,
    backgroundColor: theme.primarySoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  image: { width: '100%' as const, height: '100%' as const },
  status: {
    position: 'absolute' as const,
    right: 0,
    bottom: 0,
    borderRadius: radius.full,
    borderColor: theme.surface,
  },
});

export const Avatar = ({ name, imageUrl, status, size = 40, style, testID }: AvatarProps) => {
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const statusColor =
    status === 'online' ? theme.success : status === 'offline' ? theme.textMuted : null;
  const dotSize = Math.max(8, Math.round(size * 0.28));

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[styles.base, { width: size, height: size }, style]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} accessible={false} />
      ) : (
        <Text
          style={{ fontSize: Math.round(size * 0.4), fontWeight: '600', color: theme.primary }}
          numberOfLines={1}
        >
          {initialsOf(name)}
        </Text>
      )}
      {statusColor ? (
        <View
          style={[
            styles.status,
            {
              width: dotSize,
              height: dotSize,
              borderWidth: Math.max(1, Math.round(size * 0.06)),
              backgroundColor: statusColor,
            },
          ]}
        />
      ) : null}
    </View>
  );
};
