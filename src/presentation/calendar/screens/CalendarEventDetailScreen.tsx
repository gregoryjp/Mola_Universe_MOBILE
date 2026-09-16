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
import { useCalendarEvent } from '../hooks/useCalendarEvents';
import { useDeleteCalendarEvent } from '../hooks/useCalendarMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarEventDetail'>;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const CalendarEventDetailScreen = ({ route, navigation }: Props): JSX.Element => {
  const { eventId } = route.params;
  const event = useCalendarEvent(eventId);
  const remove = useDeleteCalendarEvent();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{event.data?.title ?? 'Evento'}</Text>

      {event.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {event.isError ? <Text style={styles.error}>{event.error.message}</Text> : null}

      {event.data ? (
        <View style={styles.block}>
          <Text style={styles.row}>
            <Text style={styles.label}>Tipo: </Text>
            {event.data.type}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Alcance: </Text>
            {event.data.scope === 'HOUSEHOLD' ? 'Hogar' : 'Personal'}
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Inicio: </Text>
            {formatDate(event.data.startAt)}
          </Text>
          {event.data.endAt ? (
            <Text style={styles.row}>
              <Text style={styles.label}>Fin: </Text>
              {formatDate(event.data.endAt)}
            </Text>
          ) : null}
          <Text style={styles.row}>
            <Text style={styles.label}>Zona: </Text>
            {event.data.timezone}
          </Text>
          {event.data.description ? (
            <Text style={styles.description}>{event.data.description}</Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CalendarEventForm', { eventId })}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>

      {remove.isError ? <Text style={styles.error}>{remove.error.message}</Text> : null}
      <TouchableOpacity
        style={[
          styles.button,
          styles.dangerButton,
          remove.isPending ? styles.buttonDisabled : null,
        ]}
        onPress={() => remove.mutate(eventId, { onSuccess: () => navigation.goBack() })}
        disabled={remove.isPending}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {remove.isPending ? 'Eliminando…' : 'Eliminar evento'}
        </Text>
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
  block: {
    gap: spacing.xs,
  },
  row: {
    ...typography.body,
    color: colors.text,
  },
  label: {
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
