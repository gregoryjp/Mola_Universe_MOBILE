import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TaskListItem } from '../components/TaskListItem';
import { useTasksList } from '../hooks/useTasksList';

type Props = NativeStackScreenProps<RootStackParamList, 'TasksList'>;

export const TasksListScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error, refetch } = useTasksList();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis tareas</Text>
      {isLoading ? <ActivityIndicator color={colors.primary} style={styles.center} /> : null}
      {isError ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error.message}</Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={styles.link}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!isLoading && !isError ? (
        <FlatList
          data={data?.tasks ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskListItem
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tienes tareas todavía</Text>}
        />
      ) : null}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm')}
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+ Nueva tarea</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    ...typography.h2,
    color: colors.text,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  center: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  fab: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  fabText: {
    ...typography.body,
    color: colors.background,
  },
});
