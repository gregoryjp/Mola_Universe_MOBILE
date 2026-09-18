import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import type { Task } from '@domain/tasks/entities/Task';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  Spinner,
} from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { PhraseBanner } from '@presentation/phrases/components/PhraseBanner';
import { useHouseholdStore } from '@shared/store/householdStore';
import { Plus } from 'lucide-react-native';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TaskListItem } from '../components/TaskListItem';
import { useHouseholdTasks } from '../hooks/useHouseholdTasks';
import { useTasksList } from '../hooks/useTasksList';

type Props = TabScreenProps<'TasksList'>;

type ScopeFilter = 'ALL' | 'HOUSEHOLD' | 'PERSONAL';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const isSameDay = (isoA: string, isoB: string): boolean => isoA.slice(0, 10) === isoB.slice(0, 10);

const isDueToday = (task: Task): boolean =>
  task.status !== 'COMPLETED' &&
  task.status !== 'CANCELLED' &&
  isSameDay(task.dueDate, new Date().toISOString());

const isCompletedThisWeek = (task: Task): boolean => {
  if (task.status !== 'COMPLETED' || !task.completedAt) return false;
  return new Date(task.completedAt).getTime() >= Date.now() - ONE_WEEK_MS;
};

interface StatTileProps {
  label: string;
  value: number;
}

/** Counts are derived from whatever pages are already loaded — not a new
 * aggregate endpoint — so they only reflect what the screen has fetched so far. */
const StatTile = ({ label, value }: StatTileProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Card size="sm" accessibilityLabel={`${label}: ${value}`} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

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
  const [filter, setFilter] = useState<ScopeFilter>('ALL');
  const styles = useThemedStyles(makeStyles);

  const openTask = (taskId: string): void => navigation.navigate('TaskDetail', { taskId });

  const allLoadedTasks = [...householdTasks, ...personalTasks];
  const dueTodayCount = allLoadedTasks.filter(isDueToday).length;
  const completedThisWeekCount = allLoadedTasks.filter(isCompletedThisWeek).length;
  const totalCount =
    (household.data?.pages?.[0]?.total ?? 0) + (personal.data?.pages?.[0]?.total ?? 0);

  const showHousehold = filter !== 'PERSONAL';
  const showPersonal = filter !== 'HOUSEHOLD';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Tareas</Text>
        <PhraseBanner module="TASKS" context="DAY_START" testID="tasks-phrase" />
        <HouseholdSelector />

        <View style={styles.statsRow}>
          <StatTile label="Vencen hoy" value={dueTodayCount} />
          <StatTile label="Completadas (7 días)" value={completedThisWeekCount} />
          <StatTile label="Total" value={totalCount} />
        </View>

        <View style={styles.filterRow}>
          <Chip label="Todas" selected={filter === 'ALL'} onPress={() => setFilter('ALL')} />
          <Chip
            label="Del hogar"
            selected={filter === 'HOUSEHOLD'}
            onPress={() => setFilter('HOUSEHOLD')}
          />
          <Chip
            label="Personales"
            selected={filter === 'PERSONAL'}
            onPress={() => setFilter('PERSONAL')}
          />
        </View>

        {householdId === null ? (
          <Text style={styles.muted}>Selecciona un hogar para ver sus tareas</Text>
        ) : null}

        {showHousehold ? (
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
        ) : null}

        {showPersonal ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personales</Text>
            {personal.isLoading ? <Spinner /> : null}
            {personal.isError ? (
              <ErrorState
                message={personal.error.message}
                onRetry={() => void personal.refetch()}
              />
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
        ) : null}
      </ScrollView>

      <IconButton
        icon={Plus}
        onPress={() => navigation.navigate('TaskForm')}
        accessibilityLabel="Nueva tarea"
        variant="primary"
        size={56}
        style={styles.fab}
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
    paddingBottom: spacing.s20,
  },
  header: {
    ...typography.h1,
    color: theme.text,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
  },
  stat: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    ...typography.h3,
    color: theme.text,
  },
  statLabel: {
    ...typography.caption,
    color: theme.textMuted,
    textAlign: 'center' as const,
  },
  filterRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s2,
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
    right: spacing.s4,
    bottom: spacing.s4,
  },
});
