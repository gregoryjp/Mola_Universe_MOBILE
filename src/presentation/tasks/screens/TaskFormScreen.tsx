import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { TaskPriority } from '@domain/tasks/entities/Task';
import { Button, Input, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCreateTask } from '../hooks/useTaskMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

const PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const TaskFormScreen = ({ navigation }: Props): JSX.Element => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(todayIso());
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const createTask = useCreateTask();
  const styles = useThemedStyles(makeStyles);

  const handleSubmit = (): void => {
    createTask.mutate({ title, dueDate, priority }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Nueva tarea"
        onBack={() => navigation.goBack()}
        testID="task-form-header"
      />
      <Input
        label="Título"
        value={title}
        onChangeText={setTitle}
        placeholder="Título"
        required
        testID="task-title"
      />
      <Input
        label="Fecha límite"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        testID="task-due-date"
      />

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.row}>
        {PRIORITIES.map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, priority === value ? styles.chipActive : null]}
            onPress={() => setPriority(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: priority === value }}
            accessibilityLabel={`Prioridad ${value}`}
          >
            <Text style={priority === value ? styles.chipTextActive : styles.chipText}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {createTask.isError ? <Text style={styles.error}>{createTask.error.message}</Text> : null}

      <Button
        label="Crear tarea"
        onPress={handleSubmit}
        loading={createTask.isPending}
        size="lg"
        accessibilityHint="Crea la tarea con el título, la fecha y la prioridad elegidos"
        testID="task-submit"
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
  label: {
    ...typography.bodySmall,
    color: theme.textMuted,
    marginTop: spacing.s2,
  },
  row: {
    flexDirection: 'row' as const,
    gap: spacing.s2,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center' as const,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: theme.text,
  },
  chipTextActive: {
    ...typography.bodySmall,
    color: theme.textInverse,
  },
  error: {
    ...typography.bodySmall,
    color: theme.error,
  },
});
