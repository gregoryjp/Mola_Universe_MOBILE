import { colors, spacing, typography } from '@core/theme';
import type { Task } from '@domain/tasks/entities/Task';
import type { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  task: Task;
  onPress: () => void;
}

export const TaskListItem = ({ task, onPress }: Props): JSX.Element => (
  <TouchableOpacity style={styles.row} onPress={onPress} accessibilityRole="button">
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  body: {
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
