import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import type { TaskScope } from '@domain/tasks/entities/Task';
import { Button, Chip, Input, Screen, ScreenHeader } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useCreateHouseholdTask, useCreateTask } from '../hooks/useTaskMutations';
import { isoDaysFromNow } from '../taskDates';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickTaskCreate'>;

type When = 'TODAY' | 'TOMORROW';

const WHEN_OPTIONS: readonly { key: When; label: string }[] = [
  { key: 'TODAY', label: 'Hoy' },
  { key: 'TOMORROW', label: 'Mañana' },
];

/**
 * The everyday way to capture a task: name it, then confirm the two answers the
 * system already has a defensible default for (when, and for whom).
 *
 * Every field behind "Más opciones" is real — they live in `TaskForm` — so this
 * screen is a front door, not a second implementation. It posts to the same two
 * endpoints (`/users/tasks` and `/households/:id/tasks`) that the full form uses;
 * `scope` is never sent because the backend derives it from the route.
 */
export const QuickTaskCreateScreen = ({ navigation, route }: Props): JSX.Element => {
  const activeHouseholdId = useHouseholdStore((state) => state.activeHouseholdId);
  const hasHousehold = activeHouseholdId !== null;

  const [title, setTitle] = useState('');
  const [when, setWhen] = useState<When>('TODAY');
  const [scopeChoice, setScopeChoice] = useState<TaskScope | null>(null);

  // Precedence: an explicit tap, then the context the entry point passed (the
  // Tareas list knows its own scope filter), then the active household. Nothing
  // is assumed that the user cannot see — the chip reflects the result.
  const scope: TaskScope =
    scopeChoice ?? route.params?.scope ?? (hasHousehold ? 'HOUSEHOLD' : 'PERSONAL');

  const createPersonal = useCreateTask();
  const createHousehold = useCreateHouseholdTask();
  const isSaving = createPersonal.isPending || createHousehold.isPending;
  const failure = createPersonal.error ?? createHousehold.error;

  const trimmedTitle = title.trim();
  const canSubmit = trimmedTitle.length > 0 && !isSaving;

  const handleSubmit = (): void => {
    const dueDate = isoDaysFromNow(when === 'TOMORROW' ? 1 : 0);
    const options = { onSuccess: () => navigation.goBack() };

    if (scope === 'HOUSEHOLD' && activeHouseholdId !== null) {
      createHousehold.mutate(
        { householdId: activeHouseholdId, input: { title: trimmedTitle, dueDate } },
        options,
      );
      return;
    }

    createPersonal.mutate({ title: trimmedTitle, dueDate }, options);
  };

  const handleMoreOptions = (): void => {
    if (trimmedTitle.length === 0) {
      navigation.navigate('TaskForm');
      return;
    }
    // Carries the draft over instead of making the user type it again.
    navigation.navigate('TaskForm', { title: trimmedTitle });
  };

  const styles = useThemedStyles(makeStyles);

  return (
    <Screen keyboardAware dismissKeyboardOnTap gap={spacing.s5} testID="quick-task-screen">
      <ScreenHeader
        title="Nueva tarea"
        onBack={() => navigation.goBack()}
        testID="quick-task-header"
      />

      <Input
        label="¿Qué hay que hacer?"
        value={title}
        onChangeText={setTitle}
        placeholder="Ej. Sacar la basura"
        required
        testID="quick-task-title"
      />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Cuándo</Text>
        <View style={styles.chipRow}>
          {WHEN_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={when === option.key}
              onPress={() => setWhen(option.key)}
              testID={`quick-task-when-${option.key.toLowerCase()}`}
            />
          ))}
        </View>
      </View>

      {hasHousehold ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Para</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Para mí"
              selected={scope === 'PERSONAL'}
              onPress={() => setScopeChoice('PERSONAL')}
              testID="quick-task-scope-personal"
            />
            <Chip
              label="Para casa"
              selected={scope === 'HOUSEHOLD'}
              onPress={() => setScopeChoice('HOUSEHOLD')}
              testID="quick-task-scope-household"
            />
          </View>
        </View>
      ) : null}

      {failure ? (
        <View style={styles.errorBox} testID="quick-task-error">
          <Text style={styles.errorText}>{failure.message}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label="Crear tarea"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSaving}
          size="lg"
          testID="quick-task-submit"
        />
        <Button
          label="Más opciones"
          variant="linkNeutral"
          onPress={handleMoreOptions}
          accessibilityHint="Abre el formulario completo para añadir prioridad, descripción y más"
          testID="quick-task-more"
        />
      </View>
    </Screen>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  field: {
    gap: spacing.s2,
  },
  fieldLabel: {
    ...typography.overline,
    color: theme.textMuted,
  },
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.s2,
  },
  actions: {
    gap: spacing.s3,
    paddingTop: spacing.s2,
  },
  // The tint lives in the fill and the border, not in the text: `error` as TEXT
  // measures 2.47:1 on white (TD-040), while `text` clears AA in both palettes
  // (14.67:1 on `errorSoft`, 12.30:1 on the derived dark one).
  errorBox: {
    gap: spacing.s1,
    backgroundColor: theme.errorSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.error,
    padding: spacing.s4,
  },
  errorText: {
    ...typography.bodySmall,
    color: theme.text,
  },
});
