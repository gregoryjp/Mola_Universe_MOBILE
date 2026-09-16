import type { RootStackParamList } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SavingsGoalRow } from '../components/SavingsGoalRow';
import { useHouseholdSavingsGoals, usePersonalSavingsGoals } from '../hooks/useSavingsGoals';

type Props = NativeStackScreenProps<RootStackParamList, 'Savings'>;

export const SavingsScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const householdGoals = useHouseholdSavingsGoals();
  const personalGoals = usePersonalSavingsGoals();
  const styles = useThemedStyles(makeStyles);

  const goals = householdGoals.data?.goals ?? [];
  const personal = personalGoals.data?.goals ?? [];

  const openGoal = (goalId: string): void => navigation.navigate('SavingsGoalDetail', { goalId });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Ahorros</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus metas de ahorro</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Del hogar</Text>
        {householdGoals.isLoading ? <Spinner /> : null}
        {householdGoals.isError ? (
          <Text style={styles.error}>{householdGoals.error.message}</Text>
        ) : null}
        {goals.map((goal) => (
          <SavingsGoalRow key={goal.id} goal={goal} onPress={() => openGoal(goal.id)} />
        ))}
        {householdGoals.data && goals.length === 0 && householdId !== null ? (
          <EmptyState title="Sin metas de hogar todavía" />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personales</Text>
        {personalGoals.isLoading ? <Spinner /> : null}
        {personalGoals.isError ? (
          <Text style={styles.error}>{personalGoals.error.message}</Text>
        ) : null}
        {personal.map((goal) => (
          <SavingsGoalRow key={goal.id} goal={goal} onPress={() => openGoal(goal.id)} />
        ))}
        {personalGoals.data && personal.length === 0 ? (
          <EmptyState title="Sin metas personales todavía" />
        ) : null}
      </View>

      <Button
        label="+ Nueva meta de ahorro"
        onPress={() => navigation.navigate('SavingsGoalForm')}
        size="lg"
        accessibilityHint="Abre el formulario para crear una meta de ahorro"
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
});
