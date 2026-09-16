import { calendarRepository } from '@data/calendar/repositories/CalendarRepositoryImpl';
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@domain/calendar/entities/CalendarEvent';
import type { CalendarResult } from '@domain/calendar/repositories/CalendarRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  calendarEventQueryKey,
  householdEventsQueryKey,
  personalEventsQueryKey,
} from './useCalendarEvents';

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar su calendario', 400);

const unwrap = <T>(result: CalendarResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const useInvalidateEvents = () => {
  const queryClient = useQueryClient();
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  return () => {
    void queryClient.invalidateQueries({ queryKey: householdEventsQueryKey(householdId) });
    void queryClient.invalidateQueries({ queryKey: personalEventsQueryKey() });
  };
};

export interface CreateCalendarEventVariables {
  /** Household events go under the active household; otherwise personal. */
  scope: 'PERSONAL' | 'HOUSEHOLD';
  input: CreateCalendarEventInput;
}

export const useCreateCalendarEvent = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const invalidate = useInvalidateEvents();

  return useMutation<CalendarEvent, AppError, CreateCalendarEventVariables>({
    mutationFn: async ({ scope, input }) => {
      if (scope === 'PERSONAL') {
        return unwrap(await calendarRepository.createPersonalEvent(input));
      }
      if (householdId === null) throw noHousehold();
      return unwrap(await calendarRepository.createHouseholdEvent(householdId, input));
    },
    onSuccess: invalidate,
  });
};

export const useUpdateCalendarEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEvents();

  return useMutation<CalendarEvent, AppError, UpdateCalendarEventInput>({
    mutationFn: async (input) => unwrap(await calendarRepository.updateEvent(eventId, input)),
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: calendarEventQueryKey(eventId) });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEvents();

  return useMutation<void, AppError, string>({
    mutationFn: async (eventId) => {
      const result = await calendarRepository.deleteEvent(eventId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: (_void, eventId) => {
      invalidate();
      void queryClient.removeQueries({ queryKey: calendarEventQueryKey(eventId) });
    },
  });
};
