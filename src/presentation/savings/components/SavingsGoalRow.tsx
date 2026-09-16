import { colors, spacing, typography } from '@core/theme';
import type { SavingsGoal } from '@domain/savings/entities/SavingsGoal';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  goal: SavingsGoal;
  onPress: () => void;
}

export const SavingsGoalRow = ({ goal, onPress }: Props): JSX.Element => {
  const target = Number(goal.targetAmount);
  const saved = Number(goal.savedAmount);
  const ratio = target > 0 ? Math.min(saved / target, 1) : 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.info}>
        <Text style={styles.title}>{goal.name}</Text>
        <Text style={styles.meta}>
          {saved.toFixed(2)} / {goal.targetAmount} {goal.currency} ·{' '}
          {goal.status === 'COMPLETED' ? 'Completado' : `${Math.round(ratio * 100)}%`}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.badge}>{goal.scope === 'HOUSEHOLD' ? 'Hogar' : 'Personal'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    backgroundColor: colors.primary,
  },
  badge: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
