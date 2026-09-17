import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, ErrorState, Spinner } from '@presentation/components/ui';
import type { JSX } from 'react';
import { FlatList, Text, View } from 'react-native';
import { TaskListItem } from '../components/TaskListItem';
import { useTasksList } from '../hooks/useTasksList';

type Props = TabScreenProps<'TasksList'>;

export const TasksListScreen = ({ navigation }: Props): JSX.Element => {
  const {
    tasks,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksList();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis tareas</Text>
      {isLoading ? <Spinner /> : null}
      {isError ? <ErrorState message={error.message} onRetry={() => void refetch()} /> : null}
      {!isLoading && !isError ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskListItem
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No tienes tareas todavía" />}
          ListFooterComponent={
            hasNextPage ? (
              <Button
                label="Cargar más"
                onPress={() => void fetchNextPage()}
                loading={isFetchingNextPage}
                variant="secondary"
                size="md"
                accessibilityHint="Carga la siguiente página de tareas"
              />
            ) : null
          }
        />
      ) : null}
      <Button
        label="+ Nueva tarea"
        onPress={() => navigation.navigate('TaskForm')}
        size="lg"
        style={styles.fab}
        accessibilityHint="Abre el formulario para crear una tarea"
      />
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: spacing.s4,
    gap: spacing.s4,
  },
  header: {
    ...typography.h2,
    color: theme.text,
  },
  list: {
    gap: spacing.s2,
    paddingBottom: spacing.s12,
  },
  fab: {
    position: 'absolute' as const,
    left: spacing.s4,
    right: spacing.s4,
    bottom: spacing.s4,
  },
});
