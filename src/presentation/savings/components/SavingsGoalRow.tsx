import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { SavingsGoal } from '@domain/savings/entities/SavingsGoal';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  goal: SavingsGoal;
  onPress: () => void;
}

export const SavingsGoalRow = ({ goal, onPress }: Props): JSX.Element => {
  const target = Number(goal.targetAmount);
  const saved = Number(goal.savedAmount);
  const ratio = target > 0 ? Math.min(saved / target, 1) : 0;
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${saved.toFixed(2)} de ${goal.targetAmount} ${goal.currency}`}
      accessibilityHint="Abre el detalle de la meta de ahorro"
    >
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

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    gap: spacing.s2,
  },
  info: {
    flex: 1,
    gap: spacing.s1,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  meta: {
    ...typography.caption,
    color: theme.textMuted,
  },
  track: {
    height: 6,
    borderRadius: radius.xs,
    backgroundColor: theme.border,
    overflow: 'hidden' as const,
  },
  fill: {
    height: 6,
    backgroundColor: theme.primary,
  },
  badge: {
    ...typography.caption,
    color: theme.textMuted,
  },
});
