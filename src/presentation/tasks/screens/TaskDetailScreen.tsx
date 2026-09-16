import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { useCompleteTask, useDeleteTask } from '../hooks/useTaskMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { taskId } = route.params;
  const { data: task, isLoading, isError, error } = useTaskDetail(taskId);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{isError ? error.message : 'Tarea no encontrada'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.meta}>
        {task.priority} · {task.status}
        {task.isOverdue ? ' · atrasada' : ''}
      </Text>
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
      <Text style={styles.meta}>Vence: {task.dueDate}</Text>

      {completeTask.isError ? <Text style={styles.error}>{completeTask.error.message}</Text> : null}
      {deleteTask.isError ? <Text style={styles.error}>{deleteTask.error.message}</Text> : null}

      <TouchableOpacity
        style={styles.primary}
        onPress={() => completeTask.mutate({ taskId })}
        disabled={completeTask.isPending || task.status === 'COMPLETED'}
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>
          {task.status === 'COMPLETED' ? 'Completada' : 'Completar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.danger}
        onPress={() => deleteTask.mutate(taskId, { onSuccess: () => navigation.goBack() })}
        disabled={deleteTask.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.dangerText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.text,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryText: {
    ...typography.body,
    color: colors.background,
  },
  danger: {
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dangerText: {
    ...typography.body,
    color: colors.error,
  },
});
