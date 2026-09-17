import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, Card, ErrorState, Spinner } from '@presentation/components/ui';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

type Props = TabScreenProps<'Dashboard'>;

interface StatProps {
  label: string;
  value: number;
}

const Stat = ({ label, value }: StatProps): JSX.Element => {
  const styles = useThemedStyles(makeStyles);

  return (
    <Card size="sm" style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
};

export const DashboardScreen = ({ navigation }: Props): JSX.Element => {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Mi día</Text>

      {isLoading ? <Spinner /> : null}
      {isError ? <ErrorState message={error.message} onRetry={() => void refetch()} /> : null}

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

      <Button
        label="Ver mis tareas"
        onPress={() => navigation.navigate('TasksList')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Compras"
        onPress={() => navigation.navigate('ShoppingLists')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Inventario"
        onPress={() => navigation.navigate('InventoryList')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Gastos"
        onPress={() => navigation.navigate('Expenses')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Ahorros"
        onPress={() => navigation.navigate('Savings')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Calendario"
        onPress={() => navigation.navigate('Calendar')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Notificaciones"
        onPress={() => navigation.navigate('NotificationsList')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Mascotas"
        onPress={() => navigation.navigate('Pets')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Momentos"
        onPress={() => navigation.navigate('Moments')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="SOS"
        onPress={() => navigation.navigate('SOSActivation')}
        size="lg"
        style={styles.navButton}
      />
      <Button
        label="Contactos de confianza"
        onPress={() => navigation.navigate('TrustedContacts')}
        size="lg"
        style={styles.navButton}
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
    gap: spacing.s3,
  },
  heading: {
    ...typography.h2,
    color: theme.text,
  },
  summary: {
    ...typography.body,
    color: theme.textMuted,
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
  },
  navButton: {
    alignSelf: 'stretch' as const,
  },
});
