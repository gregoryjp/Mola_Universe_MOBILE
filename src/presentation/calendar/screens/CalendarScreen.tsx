import type { TabScreenProps } from '@core/navigation/types';
import type { ColorTokens } from '@core/theme';
import { spacing, typography, useThemedStyles } from '@core/theme';
import { Button, EmptyState, Spinner } from '@presentation/components/ui';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CalendarEventRow } from '../components/CalendarEventRow';
import { useHouseholdEvents, usePersonalEvents } from '../hooks/useCalendarEvents';

type Props = TabScreenProps<'Calendar'>;

export const CalendarScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const householdEvents = useHouseholdEvents();
  const personalEvents = usePersonalEvents();
  const styles = useThemedStyles(makeStyles);

  const events = householdEvents.data ?? [];
  const personal = personalEvents.data ?? [];

  const openEvent = (eventId: string): void =>
    navigation.navigate('CalendarEventDetail', { eventId });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Calendario</Text>
      <HouseholdSelector />

      {householdId === null ? (
        <Text style={styles.muted}>Selecciona un hogar para ver sus eventos</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Del hogar</Text>
        {householdEvents.isLoading ? <Spinner /> : null}
        {householdEvents.isError ? (
          <Text style={styles.error}>{householdEvents.error.message}</Text>
        ) : null}
        {events.map((event) => (
          <CalendarEventRow key={event.id} event={event} onPress={() => openEvent(event.id)} />
        ))}
        {householdEvents.data && events.length === 0 && householdId !== null ? (
          <EmptyState title="Sin eventos de hogar todavía" />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personales</Text>
        {personalEvents.isLoading ? <Spinner /> : null}
        {personalEvents.isError ? (
          <Text style={styles.error}>{personalEvents.error.message}</Text>
        ) : null}
        {personal.map((event) => (
          <CalendarEventRow key={event.id} event={event} onPress={() => openEvent(event.id)} />
        ))}
        {personalEvents.data && personal.length === 0 ? (
          <EmptyState title="Sin eventos personales todavía" />
        ) : null}
      </View>

      <Button
        label="+ Nuevo evento"
        onPress={() => navigation.navigate('CalendarEventForm', {})}
        size="lg"
        accessibilityHint="Abre el formulario para crear un evento"
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
