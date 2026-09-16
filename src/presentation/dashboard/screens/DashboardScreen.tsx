import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface StatProps {
  label: string;
  value: number;
}

const Stat = ({ label, value }: StatProps): JSX.Element => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const DashboardScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Mi día</Text>

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {isError ? (
        <View style={styles.block}>
          <Text style={styles.error}>{error.message}</Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={styles.link}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {data ? (
        <>
          <Text style={styles.summary}>{data.meowSummary}</Text>
          <View style={styles.statsRow}>
            <Stat label="Tareas" value={data.tasksToday.length} />
            <Stat label="Eventos" value={data.eventsToday.length} />
            <Stat label="Listas" value={data.openShoppingLists.length} />
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TasksList')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Ver mis tareas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ShoppingLists')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Compras</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('InventoryList')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Inventario</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Expenses')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Gastos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Savings')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Ahorros</Text>
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
    ...typography.body,
    color: colors.textMuted,
  },
  block: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
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
