import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useTheme, useThemedStyles } from '@core/theme';
import type { Task } from '@domain/tasks/entities/Task';
import { Spinner } from '@presentation/components/ui';
import { Check, TriangleAlert } from 'lucide-react-native';
import type { JSX } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatDueLabel } from '../taskDates';

export interface TaskRowProps {
  task: Task;
  onPress: () => void;
  /**
   * Display name resolved from `task.assignedTo`. Pass `null`/`undefined` when it
   * cannot be resolved — the row then omits the assignee rather than showing a
   * raw user id.
   */
  assigneeName?: string | null;
  /** Renders the completion control. Without it the row is read-only. */
  onToggleComplete?: () => void;
  /** Draws progress in the control and blocks a second tap. */
  isCompleting?: boolean;
  /** The last completion attempt failed; the row says so and stays unchecked. */
  completionFailed?: boolean;
  /**
   * Drops the date label when the surrounding group already states the date.
   * Overdue is never dropped — that badge is driven by `isOverdue`.
   */
  hideDueLabel?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// 22px visual control + 11px of slop on each side = the 44px minimum target,
// without the padding pushing the title off its optical baseline.
const CHECK_HIT_SLOP = { top: 11, bottom: 11, left: 11, right: 11 } as const;

const TASK_TITLE_MAX_LINES = 2;

/**
 * One task, rendered identically in Hoy and in Tareas.
 *
 * Only fields the backend actually sends are shown: there is no time-of-day on a
 * task, so no clock is drawn, and the assignee appears only when a caller has
 * resolved the id to a name. Pills carry overdue/priority/scope text AND a
 * background tint, so nothing depends on colour alone.
 */
export const TaskRow = ({
  task,
  onPress,
  assigneeName,
  onToggleComplete,
  isCompleting = false,
  completionFailed = false,
  hideDueLabel = false,
  style,
  testID,
}: TaskRowProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  const isCompleted = task.status === 'COMPLETED';
  const dueLabel = hideDueLabel ? '' : formatDueLabel(task.dueDate);

  const checkVisual = (
    <View style={[styles.checkbox, isCompleted ? styles.checkboxDone : null]}>
      {isCompleting ? (
        <Spinner size="sm" />
      ) : isCompleted ? (
        <Check size={14} strokeWidth={3} color={theme.surface} />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.row, style]} testID={testID}>
      {onToggleComplete ? (
        <TouchableOpacity
          style={styles.checkTarget}
          onPress={onToggleComplete}
          disabled={isCompleting || isCompleted}
          hitSlop={CHECK_HIT_SLOP}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted, disabled: isCompleting || isCompleted }}
          accessibilityLabel={
            isCompleted ? `${task.title}, completada` : `Marcar ${task.title} como completada`
          }
          testID={testID ? `${testID}-complete` : undefined}
        >
          {checkVisual}
        </TouchableOpacity>
      ) : (
        <View style={styles.checkTarget}>{checkVisual}</View>
      )}

      <TouchableOpacity
        style={styles.main}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={task.title}
        accessibilityHint="Abre el detalle de la tarea"
        testID={testID ? `${testID}-body` : undefined}
      >
        <Text
          style={[styles.title, isCompleted ? styles.titleCompleted : null]}
          numberOfLines={TASK_TITLE_MAX_LINES}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          {dueLabel ? <Text style={styles.metaText}>{dueLabel}</Text> : null}
          {assigneeName ? <Text style={styles.metaText}>{assigneeName}</Text> : null}
          {task.isOverdue && !isCompleted ? (
            <View style={styles.pill}>
              <TriangleAlert size={12} strokeWidth={2.5} color={theme.text} />
              <Text style={styles.pillText}>Atrasada</Text>
            </View>
          ) : null}
          {task.priority === 'HIGH' && !isCompleted ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>Prioridad alta</Text>
            </View>
          ) : null}
          {task.scope === 'HOUSEHOLD' ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>Hogar</Text>
            </View>
          ) : null}
          {completionFailed ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>No se pudo completar</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: ColorTokens) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.s3,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s4,
  },
  checkTarget: {
    paddingTop: spacing.s1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.text,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxDone: {
    backgroundColor: theme.text,
    borderColor: theme.text,
  },
  main: {
    flex: 1,
    gap: spacing.s2,
  },
  title: {
    ...typography.body,
    color: theme.text,
  },
  titleCompleted: {
    color: theme.textMuted,
    textDecorationLine: 'line-through' as const,
  },
  metaRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    gap: spacing.s2,
  },
  metaText: {
    ...typography.caption,
    color: theme.textMuted,
  },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.s1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.s2,
    paddingVertical: 2,
    backgroundColor: theme.surfaceAlt,
  },
  // Every pill shares one neutral fill. The chromatic `*Soft` tokens are not
  // overridden for dark mode, so there they stay near-white and `text` lands at
  // 1.00:1 (warningSoft) / 1.09:1 (errorSoft) — invisible. `surfaceAlt` is a
  // real token in both palettes (15.24:1 light, 13.28:1 dark), and the words
  // carry the meaning, so no pill depends on colour alone.
  pillText: {
    ...typography.caption,
    color: theme.text,
  },
});
