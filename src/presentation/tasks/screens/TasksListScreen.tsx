import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { breakpoints, spacing, typography, useThemedStyles } from '@core/theme';
import type { Task } from '@domain/tasks/entities/Task';
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
} from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { PhraseBanner } from '@presentation/phrases/components/PhraseBanner';
import { useHouseholdStore } from '@shared/store/householdStore';
import { Plus } from 'lucide-react-native';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TaskRow } from '../components/TaskRow';
import { useHouseholdTasks } from '../hooks/useHouseholdTasks';
import { useCompleteTask } from '../hooks/useTaskMutations';
import { useTasksList } from '../hooks/useTasksList';
import { bucketTasks } from '../taskDates';

type Props = TabScreenProps<'TasksList'>;

type ScopeFilter = 'ALL' | 'HOUSEHOLD' | 'PERSONAL';

const FILTERS: { key: ScopeFilter; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'HOUSEHOLD', label: 'Del hogar' },
  { key: 'PERSONAL', label: 'Personales' },
];

const EMPTY_TITLE: Record<ScopeFilter, string> = {
  ALL: 'No hay tareas todavía',
  HOUSEHOLD: 'Sin tareas de hogar todavía',
  PERSONAL: 'No tienes tareas todavía',
};

/**
 * Tareas — the full list, in the same visual grammar as Hoy.
 *
 * Household tasks live under `/households/:id/tasks` and were once never listed:
 * the screen only called `listPersonal`, so a task created for the household
 * (including the pet-care tasks) vanished from the app (P0-5). Both sources are
 * still merged here; the scope is now carried by the "Hogar" pill on each row
 * and by the filter, rather than by two parallel sections that forced the reader
 * to reconcile two lists by hand.
 */
export const TasksListScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const { tasks: householdTasks, ...household } = useHouseholdTasks();
  const { tasks: personalTasks, ...personal } = useTasksList();
  const completeTask = useCompleteTask();
  const [filter, setFilter] = useState<ScopeFilter>('ALL');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const styles = useThemedStyles(makeStyles);

  const showHousehold = filter !== 'PERSONAL';
  const showPersonal = filter !== 'HOUSEHOLD';

  const buckets = useMemo(
    () =>
      bucketTasks([
        ...(showHousehold ? householdTasks : []),
        ...(showPersonal ? personalTasks : []),
      ]),
    [showHousehold, showPersonal, householdTasks, personalTasks],
  );

  const openTask = (taskId: string): void => navigation.navigate('TaskDetail', { taskId });

  /**
   * Feedback is immediate — the control turns into a spinner and refuses a second
   * tap — but the list itself is not rewritten by hand: the mutation invalidates
   * `['tasks']` and the row moves to its real group once the server agrees. On
   * failure the control returns to unchecked and the row says so, which is the
   * rollback. Patching the paginated cache pages directly would be the unsafe
   * kind of optimism.
   */
  const complete = (task: Task): void => {
    setFailedId(null);
    setCompletingId(task.id);
    completeTask.mutate(
      { taskId: task.id },
      {
        onSuccess: () => setCompletingId(null),
        onError: () => {
          setCompletingId(null);
          setFailedId(task.id);
        },
      },
    );
  };

  const renderGroup = (title: string, tasks: Task[], groupKey: string): JSX.Element | null => {
    if (tasks.length === 0) return null;
    return (
      <View style={styles.group} testID={`tasks-group-${groupKey}`}>
        <Text style={styles.groupTitle} accessibilityRole="header">
          {title}
        </Text>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onPress={() => openTask(task.id)}
            onToggleComplete={() => complete(task)}
            isCompleting={completingId === task.id}
            completionFailed={failedId === task.id}
            testID={`task-${task.id}`}
          />
        ))}
      </View>
    );
  };

  const visibleCount =
    buckets.today.length +
    buckets.tomorrow.length +
    buckets.upcoming.length +
    buckets.completed.length;
  const isLoading = (showHousehold && household.isLoading) || (showPersonal && personal.isLoading);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} testID="tasks-scroll">
        <Text style={styles.header} accessibilityRole="header">
          Tareas
        </Text>
        <PhraseBanner module="TASKS" context="DAY_START" testID="tasks-phrase" />
        <HouseholdSelector />

        <View style={styles.filterRow}>
          {FILTERS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={filter === option.key}
              onPress={() => setFilter(option.key)}
              accessibilityLabel={`${option.label}${filter === option.key ? ', seleccionado' : ''}`}
              testID={`tasks-filter-${option.key}`}
            />
          ))}
        </View>

        {householdId === null ? (
          <Text style={styles.muted}>Selecciona un hogar para ver sus tareas</Text>
        ) : null}

        {isLoading ? (
          <View style={styles.skeletons} testID="tasks-loading">
            <Skeleton variant="list" />
            <Skeleton variant="list" />
          </View>
        ) : null}

        {/* One failing source must not blank the other one. */}
        {showHousehold && household.isError ? (
          <ErrorState
            message={household.error.message}
            onRetry={() => void household.refetch()}
            testID="tasks-household-error"
          />
        ) : null}
        {showPersonal && personal.isError ? (
          <ErrorState
            message={personal.error.message}
            onRetry={() => void personal.refetch()}
            testID="tasks-personal-error"
          />
        ) : null}

        {renderGroup('Hoy', buckets.today, 'today')}
        {renderGroup('Mañana', buckets.tomorrow, 'tomorrow')}
        {renderGroup('Próximas', buckets.upcoming, 'upcoming')}
        {renderGroup('Completadas', buckets.completed, 'completed')}

        {!isLoading && visibleCount === 0 && !household.isError && !personal.isError ? (
          <EmptyState
            title={EMPTY_TITLE[filter]}
            description="Añade la primera y aparecerá aquí agrupada por fecha."
            actionLabel="Nueva tarea"
            onAction={() => navigation.navigate('TaskForm')}
            testID="tasks-empty"
          />
        ) : null}

        {showHousehold && household.hasNextPage ? (
          <Button
            label="Cargar más del hogar"
            onPress={() => void household.fetchNextPage()}
            loading={household.isFetchingNextPage}
            variant="secondary"
            size="md"
            style={styles.moreButton}
            accessibilityHint="Carga la siguiente página de tareas del hogar"
            testID="tasks-load-more-household"
          />
        ) : null}

        {showPersonal && personal.hasNextPage ? (
          <Button
            label="Cargar más"
            onPress={() => void personal.fetchNextPage()}
            loading={personal.isFetchingNextPage}
            variant="secondary"
            size="md"
            style={styles.moreButton}
            accessibilityHint="Carga la siguiente página de tareas personales"
            testID="tasks-load-more-personal"
          />
        ) : null}
      </ScrollView>

      <IconButton
        icon={Plus}
        onPress={() => navigation.navigate('TaskForm')}
        accessibilityLabel="Nueva tarea"
        variant="primary"
        size={56}
        style={styles.fab}
        testID="tasks-fab"
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
    paddingHorizontal: spacing.s6,
    paddingTop: spacing.s6,
    paddingBottom: spacing.s20,
    gap: spacing.s4,
    alignSelf: 'center' as const,
    width: '100%' as const,
    maxWidth: breakpoints.tablet,
  },
  header: {
    ...typography.h1,
    color: theme.text,
  },
  filterRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s2,
  },
  group: {
    gap: spacing.s2,
  },
  groupTitle: {
    ...typography.overline,
    color: theme.textMuted,
  },
  skeletons: {
    gap: spacing.s3,
  },
  muted: {
    ...typography.body,
    color: theme.textMuted,
  },
  moreButton: {
    alignSelf: 'flex-start' as const,
  },
  fab: {
    position: 'absolute' as const,
    right: spacing.s6,
    bottom: spacing.s6,
  },
});
