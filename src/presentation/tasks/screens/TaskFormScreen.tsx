import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { TaskPriority } from '@domain/tasks/entities/Task';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateTask } from '../hooks/useTaskMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

const PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const TaskFormScreen = ({ navigation }: Props): JSX.Element => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(todayIso());
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const createTask = useCreateTask();

  const handleSubmit = (): void => {
    createTask.mutate({ title, dueDate, priority }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nueva tarea</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha límite (YYYY-MM-DD)"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.row}>
        {PRIORITIES.map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, priority === value ? styles.chipActive : null]}
            onPress={() => setPriority(value)}
            accessibilityRole="button"
          >
            <Text style={priority === value ? styles.chipTextActive : styles.chipText}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {createTask.isError ? <Text style={styles.error}>{createTask.error.message}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={createTask.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{createTask.isPending ? 'Creando…' : 'Crear tarea'}</Text>
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
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  chipTextActive: {
    ...typography.bodySmall,
    color: colors.background,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
