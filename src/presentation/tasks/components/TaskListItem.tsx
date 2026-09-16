import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { Task } from '@domain/tasks/entities/Task';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  task: Task;
  onPress: () => void;
}

export const TaskListItem = ({ task, onPress }: Props): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={task.title}
      accessibilityHint="Abre el detalle de la tarea"
    >
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.meta}>
          {task.priority} · {task.status}
          {task.isOverdue ? ' · atrasada' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    backgroundColor: theme.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  body: {
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
});
