import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, ErrorState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TaskListItem } from '../components/TaskListItem';
import { useHouseholdTasks } from '../hooks/useHouseholdTasks';
import { useTasksList } from '../hooks/useTasksList';

type Props = TabScreenProps<'TasksList'>;

/**
 * Household tasks live under `/households/:id/tasks` and were never listed: this
 * screen only ever called `listPersonal`, so a task created for the household
 * (including the pet-care tasks from TD-021) disappeared from the app. It now
 * mirrors the Savings screen — selector plus a "Del hogar" and a "Personales"
 * section — so both are reachable (P0-5).
 */
export const TasksListScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const { tasks: householdTasks, ...household } = useHouseholdTasks();
  const { tasks: personalTasks, ...personal } = useTasksList();
  const styles = useThemedStyles(makeStyles);

  const openTask = (taskId: string): void => navigation.navigate('TaskDetail', { taskId });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Mis tareas</Text>
        <HouseholdSelector />

        {householdId === null ? (
          <Text style={styles.muted}>Selecciona un hogar para ver sus tareas</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Del hogar</Text>
          {household.isLoading ? <Spinner /> : null}
          {household.isError ? <Text style={styles.error}>{household.error.message}</Text> : null}
          {householdTasks.map((task) => (
            <TaskListItem key={task.id} task={task} onPress={() => openTask(task.id)} />
          ))}
          {household.data && householdTasks.length === 0 && householdId !== null ? (
            <EmptyState title="Sin tareas de hogar todavía" />
          ) : null}
          {household.hasNextPage ? (
            <Button
              label="Cargar más"
              onPress={() => void household.fetchNextPage()}
              loading={household.isFetchingNextPage}
              variant="secondary"
              size="md"
              accessibilityHint="Carga la siguiente página de tareas del hogar"
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personales</Text>
          {personal.isLoading ? <Spinner /> : null}
          {personal.isError ? (
            <ErrorState message={personal.error.message} onRetry={() => void personal.refetch()} />
          ) : null}
          {personalTasks.map((task) => (
            <TaskListItem key={task.id} task={task} onPress={() => openTask(task.id)} />
          ))}
          {personal.data && personalTasks.length === 0 ? (
            <EmptyState title="No tienes tareas todavía" />
          ) : null}
          {personal.hasNextPage ? (
            <Button
              label="Cargar más"
              onPress={() => void personal.fetchNextPage()}
              loading={personal.isFetchingNextPage}
              variant="secondary"
              size="md"
              accessibilityHint="Carga la siguiente página de tareas"
            />
          ) : null}
        </View>
      </ScrollView>

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
  },
  content: {
    padding: spacing.s4,
    gap: spacing.s4,
    paddingBottom: spacing.s12,
  },
  header: {
    ...typography.h2,
    color: theme.text,
  },
  section: {
    gap: spacing.s1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
  fab: {
    position: 'absolute' as const,
    left: spacing.s4,
    right: spacing.s4,
    bottom: spacing.s4,
  },
});
