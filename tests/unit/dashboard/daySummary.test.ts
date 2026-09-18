import type { DashboardEvent } from '@domain/dashboard/entities/DashboardSummary';
import type { Task } from '@domain/tasks/entities/Task';
import { describe, expect, it } from 'vitest';

import {
  byStart,
  dayNarrative,
  formatDayHeadline,
  formatFriendlyDate,
  formatTime,
  greetingFor,
  isOpenTask,
  joinNatural,
  plural,
} from '@presentation/dashboard/daySummary';

/**
 * Local wall-clock instants. Building them through `new Date(y, m, d, h, min)`
 * keeps the expected strings stable regardless of the machine's timezone, which
 * is the whole point of `formatTime` not using `Intl` or `toISOString`.
 */
const localIso = (y: number, m: number, d: number, h: number, min = 0): string =>
  new Date(y, m, d, h, min).toISOString();

const task = (id: string, status: Task['status']): Task => ({
  id,
  createdBy: 'u1',
  assignedTo: null,
  title: id,
  description: null,
  scope: 'HOUSEHOLD',
  householdId: 'hh-1',
  category: 'GENERAL',
  priority: 'MEDIUM',
  status,
  dueDate: '2026-09-20',
  completedAt: null,
  completedBy: null,
  approvedAt: null,
  approvedBy: null,
  requiresApproval: false,
  isOverdue: false,
  recurrence: 'NONE',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
});

const event = (id: string, startAt: string, endAt: string | null = null): DashboardEvent => ({
  id,
  title: id,
  type: 'GENERAL',
  startAt,
  endAt,
});

describe('daySummary — formatting', () => {
  it('formats the friendly date in Spanish, weekday first', () => {
    // 17 September 2026 is a Thursday.
    expect(formatFriendlyDate(new Date(2026, 8, 17))).toBe('jueves, 17 de septiembre');
  });

  it('formats the timeline headline as "17 SEP · JUEVES"', () => {
    expect(formatDayHeadline(new Date(2026, 8, 17))).toBe('17 SEP · JUEVES');
  });

  it('reads the date from the local calendar, not from UTC', () => {
    // 23:30 local on the 17th can be the 18th in UTC (or vice versa). The
    // headline must follow the reader's clock, so it takes the local parts.
    const lateEvening = new Date(2026, 8, 17, 23, 30);
    expect(formatFriendlyDate(lateEvening)).toBe('jueves, 17 de septiembre');
    expect(formatDayHeadline(lateEvening)).toContain('17 SEP');
  });

  it('greets by hour, with the boundaries included in the later greeting', () => {
    expect(greetingFor(0)).toBe('Buenos días');
    expect(greetingFor(11)).toBe('Buenos días');
    expect(greetingFor(12)).toBe('Buenas tardes');
    expect(greetingFor(18)).toBe('Buenas tardes');
    expect(greetingFor(19)).toBe('Buenas noches');
    expect(greetingFor(23)).toBe('Buenas noches');
  });

  it('renders a wall-clock time, zero-padded', () => {
    expect(formatTime(localIso(2026, 8, 17, 9, 5))).toBe('09:05');
    expect(formatTime(localIso(2026, 8, 17, 21, 0))).toBe('21:00');
  });

  it('yields an empty label for a malformed instant instead of "NaN:NaN"', () => {
    expect(formatTime('not-a-date')).toBe('');
    expect(formatTime('')).toBe('');
  });

  it('orders events by start instant, earliest first', () => {
    const evening = event('evening', localIso(2026, 8, 17, 21));
    const morning = event('morning', localIso(2026, 8, 17, 10));

    expect([evening, morning].sort(byStart).map((e) => e.id)).toEqual(['morning', 'evening']);
  });
});

describe('daySummary — pluralisation and joining', () => {
  it('keeps the count and the noun agreeing', () => {
    expect(plural(0, 'tarea', 'tareas')).toBe('0 tareas');
    expect(plural(1, 'tarea', 'tareas')).toBe('1 tarea');
    expect(plural(2, 'tarea', 'tareas')).toBe('2 tareas');
    expect(plural(1, 'persona', 'personas')).toBe('1 persona');
  });

  it('joins with "y" and no Oxford comma, as Spanish does', () => {
    expect(joinNatural([])).toBe('');
    expect(joinNatural(['1 tarea'])).toBe('1 tarea');
    expect(joinNatural(['1 tarea', '2 eventos'])).toBe('1 tarea y 2 eventos');
    expect(joinNatural(['1 tarea', '2 eventos', '1 lista de la compra'])).toBe(
      '1 tarea, 2 eventos y 1 lista de la compra',
    );
  });
});

describe('daySummary — open tasks', () => {
  it('treats only COMPLETED and CANCELLED as closed', () => {
    expect(isOpenTask(task('pending', 'PENDING'))).toBe(true);
    expect(isOpenTask(task('progress', 'IN_PROGRESS'))).toBe(true);
    expect(isOpenTask(task('completed', 'COMPLETED'))).toBe(false);
    expect(isOpenTask(task('cancelled', 'CANCELLED'))).toBe(false);
  });
});

describe('daySummary — the narrative', () => {
  it('speaks like a person when the day is empty, never counting zeroes', () => {
    const narrative = dayNarrative({ tasks: [], events: [] });

    expect(narrative.title).toBe('Hoy está todo tranquilo');
    expect(narrative.detail).toBe('No tienes tareas ni eventos para hoy.');
    expect(narrative.title).not.toContain('0');
  });

  it('counts only open tasks, so a finished task does not colour the day', () => {
    const narrative = dayNarrative({
      tasks: [task('done', 'COMPLETED'), task('open', 'PENDING')],
      events: [],
    });

    expect(narrative.title).toBe('Tienes 1 tarea por delante.');
    expect(narrative.detail).toBeNull();
  });

  it('accounts for events and open shopping lists too', () => {
    const narrative = dayNarrative({
      tasks: [task('a', 'PENDING'), task('b', 'PENDING')],
      events: [event('e1', localIso(2026, 8, 17, 18))],
      openShoppingLists: 1,
    });

    expect(narrative.title).toBe('Tienes 2 tareas, 1 evento y 1 lista de la compra por delante.');
    expect(narrative.detail).toBeNull();
  });

  it('mentions shopping lists alone, when nothing else is pending', () => {
    const narrative = dayNarrative({ tasks: [], events: [], openShoppingLists: 2 });

    expect(narrative.title).toBe('Tienes 2 listas de la compra por delante.');
  });
});
