import { colors, spacing, typography } from '@core/theme';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const HomeScreen = (): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.title}>Hello MOLA</Text>
    <Text style={styles.subtitle}>Mobile setup ready</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
