import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, ErrorState, ScreenHeader, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { useCompleteTask, useDeleteTask } from '../hooks/useTaskMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { taskId } = route.params;
  const { data: task, isLoading, isError, error } = useTaskDetail(taskId);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const styles = useThemedStyles(makeStyles);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View style={styles.center}>
        <ErrorState message={isError ? error.message : 'Tarea no encontrada'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={task.title}
        onBack={() => navigation.goBack()}
        testID="task-detail-header"
      />
      <Text style={styles.meta}>
        {task.priority} · {task.status}
        {task.isOverdue ? ' · atrasada' : ''}
      </Text>
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
      <Text style={styles.meta}>Vence: {task.dueDate}</Text>

      {completeTask.isError ? <Text style={styles.error}>{completeTask.error.message}</Text> : null}
      {deleteTask.isError ? <Text style={styles.error}>{deleteTask.error.message}</Text> : null}

      <Button
        label={task.status === 'COMPLETED' ? 'Completada' : 'Completar'}
        onPress={() => completeTask.mutate({ taskId })}
        loading={completeTask.isPending}
        disabled={task.status === 'COMPLETED'}
        size="lg"
        accessibilityHint="Marca esta tarea como completada"
      />

      <Button
        label="Eliminar"
        onPress={() => deleteTask.mutate(taskId, { onSuccess: () => navigation.goBack() })}
        loading={deleteTask.isPending}
        variant="danger"
        size="lg"
        accessibilityHint="Elimina esta tarea"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
    gap: spacing.s3,
  },
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.background,
    padding: spacing.s6,
  },
  meta: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  description: {
    ...typography.body,
    color: theme.text,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
