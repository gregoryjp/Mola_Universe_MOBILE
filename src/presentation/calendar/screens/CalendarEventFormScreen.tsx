import type { RootStackParamList } from '@core/navigation/types';
import { colors, spacing, typography } from '@core/theme';
import type { CalendarEventType } from '@domain/calendar/entities/CalendarEvent';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHouseholdStore } from '@shared/store/householdStore';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCalendarEvent } from '../hooks/useCalendarEvents';
import { useCreateCalendarEvent, useUpdateCalendarEvent } from '../hooks/useCalendarMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarEventForm'>;

const EVENT_TYPES: CalendarEventType[] = [
  'GENERAL',
  'BIRTHDAY',
  'APPOINTMENT',
  'PAYMENT',
  'SUBSCRIPTION',
  'INSURANCE',
  'MAINTENANCE',
  'PET',
  'TRIP',
  'CUSTOM',
];

export const CalendarEventFormScreen = ({ route, navigation }: Props): JSX.Element => {
  const eventId = route.params?.eventId;
  const isEdit = eventId !== undefined;
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  const existing = useCalendarEvent(eventId ?? '');
  const create = useCreateCalendarEvent();
  const update = useUpdateCalendarEvent(eventId ?? '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('GENERAL');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isHousehold, setIsHousehold] = useState(householdId !== null);

  useEffect(() => {
    const event = existing.data;
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description ?? '');
    setType(event.type);
    setStartAt(event.startAt);
    setEndAt(event.endAt ?? '');
    setTimezone(event.timezone);
    setIsHousehold(event.scope === 'HOUSEHOLD');
  }, [existing.data]);

  const mutation = isEdit ? update : create;
  const canSubmit = title.length > 0 && startAt.length > 0 && !mutation.isPending;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    const shared = {
      ...(description.length > 0 && { description }),
      type,
      startAt,
      ...(timezone.length > 0 && { timezone }),
    };

    const done = (): void => navigation.goBack();

    if (isEdit) {
      update.mutate(
        {
          title,
          ...shared,
          ...(endAt.length > 0 ? { endAt } : { endAt: null }),
        },
        { onSuccess: done },
      );
      return;
    }

    create.mutate(
      {
        scope: isHousehold ? 'HOUSEHOLD' : 'PERSONAL',
        input: {
          title,
          ...shared,
          ...(endAt.length > 0 && { endAt }),
        },
      },
      { onSuccess: done },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{isEdit ? 'Editar evento' : 'Nuevo evento'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción (opcional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.sectionTitle}>Tipo</Text>
      <View style={styles.chips}>
        {EVENT_TYPES.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, type === option ? styles.chipActive : null]}
            onPress={() => setType(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: type === option }}
          >
            <Text style={[styles.chipText, type === option ? styles.chipTextActive : null]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Inicio (ISO, ej. 2026-09-20T18:00:00Z)"
        placeholderTextColor={colors.textMuted}
        value={startAt}
        onChangeText={setStartAt}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Fin (opcional)"
        placeholderTextColor={colors.textMuted}
        value={endAt}
        onChangeText={setEndAt}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Zona horaria (opcional, ej. Europe/Madrid)"
        placeholderTextColor={colors.textMuted}
        value={timezone}
        onChangeText={setTimezone}
        autoCapitalize="none"
      />

      {isEdit ? (
        <Text style={styles.hint}>
          Alcance: {isHousehold ? 'Hogar' : 'Personal'} (no modificable al editar)
        </Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Alcance</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              style={[styles.chip, !isHousehold ? styles.chipActive : null]}
              onPress={() => setIsHousehold(false)}
              accessibilityRole="button"
              accessibilityState={{ selected: !isHousehold }}
            >
              <Text style={[styles.chipText, !isHousehold ? styles.chipTextActive : null]}>
                Personal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, isHousehold ? styles.chipActive : null]}
              onPress={() => setIsHousehold(true)}
              disabled={householdId === null}
              accessibilityRole="button"
              accessibilityState={{ selected: isHousehold }}
            >
              <Text style={[styles.chipText, isHousehold ? styles.chipTextActive : null]}>
                Hogar
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {mutation.isError ? <Text style={styles.error}>{mutation.error.message}</Text> : null}

      <TouchableOpacity
        style={[styles.button, canSubmit ? null : styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
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
    gap: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.background,
  },
  hint: {
    ...typography.caption,
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
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.body,
    color: colors.background,
  },
});
