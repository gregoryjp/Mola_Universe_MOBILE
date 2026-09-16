import { calendarRepository } from '@data/calendar/repositories/CalendarRepositoryImpl';
import type { CalendarEvent } from '@domain/calendar/entities/CalendarEvent';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const householdEventsQueryKey = (householdId: string | null) =>
  ['calendar', 'events', householdId] as const;
export const personalEventsQueryKey = () => ['calendar', 'events', 'personal'] as const;
export const calendarEventQueryKey = (eventId: string) => ['calendar', 'event', eventId] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver su calendario', 400);

export const useHouseholdEvents = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<CalendarEvent[], AppError>({
    queryKey: householdEventsQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await calendarRepository.listHouseholdEvents(householdId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
};

export const usePersonalEvents = () =>
  useQuery<CalendarEvent[], AppError>({
    queryKey: personalEventsQueryKey(),
    queryFn: async () => {
      const result = await calendarRepository.listPersonalEvents();
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });

export const useCalendarEvent = (eventId: string) =>
  useQuery<CalendarEvent, AppError>({
    queryKey: calendarEventQueryKey(eventId),
    enabled: eventId.length > 0,
    queryFn: async () => {
      const result = await calendarRepository.getEvent(eventId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
      return result.value;
    },
  });
