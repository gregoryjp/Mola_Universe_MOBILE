import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { radius, spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Input, Spinner } from '@presentation/components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
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
  const styles = useThemedStyles(makeStyles);

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

      {goal.isLoading ? <Spinner /> : null}
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
        {cells.isLoading ? <Spinner /> : null}
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
        {contributions.isLoading ? <Spinner /> : null}
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
        <Input
          label="Importe"
          value={amount}
          onChangeText={setAmount}
          placeholder="Importe (ej. 25.00)"
          keyboardType="decimal-pad"
          required
          testID="savings-contribution-amount"
        />
        {isQuota ? (
          <Input
            label="Mes"
            value={month}
            onChangeText={setMonth}
            placeholder="Mes (YYYY-MM)"
            testID="savings-contribution-month"
          />
        ) : null}
        {contribute.isError ? <Text style={styles.error}>{contribute.error.message}</Text> : null}
        <Button
          label="Aportar"
          onPress={() =>
            contribute.mutate({
              amount,
              ...(month.length > 0 && { month }),
            })
          }
          disabled={!canContribute}
          loading={contribute.isPending}
          accessibilityHint="Registra una aportación a esta meta de ahorro"
          testID="savings-contribution-submit"
        />
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
      <Button
        label="Eliminar meta"
        onPress={handleDelete}
        loading={remove.isPending}
        variant="danger"
        size="lg"
        accessibilityHint="Elimina esta meta de ahorro definitivamente"
      />
    </ScrollView>
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
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  summary: {
    gap: 2,
  },
  section: {
    gap: spacing.s1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: theme.textMuted,
  },
  entryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
  },
  meta: {
    ...typography.caption,
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
});
