import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import { HouseholdSelector } from '@presentation/households/components/HouseholdSelector';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarEventRow } from '../components/CalendarEventRow';
import { useHouseholdEvents, usePersonalEvents } from '../hooks/useCalendarEvents';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

export const CalendarScreen = ({ navigation }: Props): JSX.Element => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const householdEvents = useHouseholdEvents();
  const personalEvents = usePersonalEvents();

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
        {householdEvents.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {householdEvents.isError ? (
          <Text style={styles.error}>{householdEvents.error.message}</Text>
        ) : null}
        {events.map((event) => (
          <CalendarEventRow key={event.id} event={event} onPress={() => openEvent(event.id)} />
        ))}
        {householdEvents.data && events.length === 0 && householdId !== null ? (
          <Text style={styles.muted}>Sin eventos de hogar todavía</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personales</Text>
        {personalEvents.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {personalEvents.isError ? (
          <Text style={styles.error}>{personalEvents.error.message}</Text>
        ) : null}
        {personal.map((event) => (
          <CalendarEventRow key={event.id} event={event} onPress={() => openEvent(event.id)} />
        ))}
        {personalEvents.data && personal.length === 0 ? (
          <Text style={styles.muted}>Sin eventos personales todavía</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CalendarEventForm', {})}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>+ Nuevo evento</Text>
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
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodySmall,
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
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
