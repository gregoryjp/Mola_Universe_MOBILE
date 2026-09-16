import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SavingsBoard } from '../components/SavingsBoard';
import {
  useSavingsCells,
  useSavingsContributions,
  useSavingsGoal,
  useSavingsMovements,
} from '../hooks/useSavingsGoals';
import {
  useCreateContribution,
  useDeleteSavingsGoal,
  useMarkCell,
  useUnmarkCell,
} from '../hooks/useSavingsMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'SavingsGoalDetail'>;

export const SavingsGoalDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { goalId } = route.params;
  const goal = useSavingsGoal(goalId);
  const cells = useSavingsCells(goalId);
  const movements = useSavingsMovements(goalId);
  const contributions = useSavingsContributions(goalId);
  const mark = useMarkCell(goalId);
  const unmark = useUnmarkCell(goalId);
  const remove = useDeleteSavingsGoal();
  const contribute = useCreateContribution(goalId);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');

  const isQuota = goal.data?.contributionMode === 'QUOTA';
  const pendingCellId = mark.isPending
    ? (mark.variables ?? null)
    : unmark.isPending
      ? (unmark.variables ?? null)
      : null;

  const handleToggle = (cellId: string, isMarked: boolean): void => {
    if (isMarked) {
      unmark.mutate(cellId);
    } else {
      mark.mutate(cellId);
    }
  };

  const handleDelete = (): void => {
    remove.mutate(goalId, { onSuccess: () => navigation.goBack() });
  };

  const canContribute =
    amount.length > 0 && (!isQuota || month.length > 0) && !contribute.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{goal.data?.name ?? 'Meta de ahorro'}</Text>

      {goal.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {goal.isError ? <Text style={styles.error}>{goal.error.message}</Text> : null}

      {goal.data ? (
        <View style={styles.summary}>
          <Text style={styles.meta}>
            {goal.data.savedAmount} / {goal.data.targetAmount} {goal.data.currency}
          </Text>
          <Text style={styles.meta}>
            {goal.data.scope === 'HOUSEHOLD' ? 'Hogar' : 'Personal'} ·{' '}
            {goal.data.status === 'COMPLETED' ? 'Completado' : 'En curso'}
            {goal.data.contributionMode ? ` · ${goal.data.contributionMode}` : ''}
          </Text>
          {goal.data.notes ? <Text style={styles.meta}>{goal.data.notes}</Text> : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tablero</Text>
        {cells.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {mark.isError ? <Text style={styles.error}>{mark.error.message}</Text> : null}
        {unmark.isError ? <Text style={styles.error}>{unmark.error.message}</Text> : null}
        {cells.data ? (
          <SavingsBoard
            cells={cells.data}
            pendingCellId={pendingCellId}
            onToggle={(cell) => handleToggle(cell.id, cell.isMarked)}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aportaciones</Text>
        {contributions.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {contributions.isError ? (
          <Text style={styles.error}>{contributions.error.message}</Text>
        ) : null}
        {(contributions.data ?? []).map((entry) => (
          <View key={entry.id} style={styles.entryRow}>
            <Text style={styles.meta}>{entry.month ?? '—'}</Text>
            <Text style={styles.meta}>
              {entry.amount} {goal.data?.currency}
            </Text>
          </View>
        ))}
        <TextInput
          style={styles.input}
          placeholder="Importe (ej. 25.00)"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        {isQuota ? (
          <TextInput
            style={styles.input}
            placeholder="Mes (YYYY-MM)"
            placeholderTextColor={colors.textMuted}
            value={month}
            onChangeText={setMonth}
          />
        ) : null}
        {contribute.isError ? <Text style={styles.error}>{contribute.error.message}</Text> : null}
        <TouchableOpacity
          style={[styles.button, canContribute ? null : styles.buttonDisabled]}
          onPress={() =>
            contribute.mutate({
              amount,
              ...(month.length > 0 && { month }),
            })
          }
          disabled={!canContribute}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{contribute.isPending ? 'Aportando…' : 'Aportar'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movimientos</Text>
        {movements.isError ? <Text style={styles.error}>{movements.error.message}</Text> : null}
        {(movements.data ?? []).map((movement) => (
          <View key={movement.id} style={styles.entryRow}>
            <Text style={styles.meta}>
              {movement.type === 'MARK' ? 'Ingreso' : 'Reverso'} · saldo {movement.balanceAfter}
            </Text>
            <Text style={styles.meta}>{movement.amount}</Text>
          </View>
        ))}
        {movements.data && movements.data.length === 0 ? (
          <Text style={styles.muted}>Sin movimientos todavía</Text>
        ) : null}
      </View>

      {remove.isError ? <Text style={styles.error}>{remove.error.message}</Text> : null}
      <TouchableOpacity
        style={[
          styles.button,
          styles.dangerButton,
          remove.isPending ? styles.buttonDisabled : null,
        ]}
        onPress={handleDelete}
        disabled={remove.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{remove.isPending ? 'Eliminando…' : 'Eliminar meta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  summary: {
    gap: 2,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
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
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
