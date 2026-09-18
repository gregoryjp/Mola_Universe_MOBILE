import type { DashboardEvent } from '@domain/dashboard/entities/DashboardSummary';
import type { Task } from '@domain/tasks/entities/Task';

/**
 * Pure formatting for Hoy. Kept out of the screen so the temporal
 * representation and the copy can be tested without mounting anything.
 *
 * No `Intl` on purpose: Hermes ships without full ICU data, so
 * `toLocaleTimeString` is unreliable on device. Everything here is manual.
 */

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Month abbreviations as used in the Hoy headline: "17 SEP · JUEVES". */
const MONTHS_SHORT = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

export const formatFriendlyDate = (date: Date): string =>
  `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;

/** The headline over the timeline. */
export const formatDayHeadline = (date: Date): string =>
  `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} · ${WEEKDAYS[date.getDay()]?.toUpperCase() ?? ''}`;

export const greetingFor = (hour: number): string => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

/** Local wall-clock time of an ISO instant, as "10:00". */
export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isOpenTask = (task: Task): boolean =>
  task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

/** Agenda order: earliest first. */
export const byStart = (a: DashboardEvent, b: DashboardEvent): number =>
  a.startAt.localeCompare(b.startAt);

export const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** "2 tareas y 1 evento" — no trailing comma, Spanish does not use one. */
export const joinNatural = (parts: string[]): string => {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0] ?? '';
  const head = parts.slice(0, -1).join(', ');
  return `${head} y ${parts[parts.length - 1]}`;
};

export interface DayNarrative {
  /** Warm, human sentence. Never a count of zeroes. */
  title: string;
  /** The breakdown, only when there is something to break down. */
  detail: string | null;
}

export interface DayInput {
  tasks: Task[];
  events: DashboardEvent[];
  /** Open shopping lists, so the sentence can account for them too. */
  openShoppingLists?: number;
}

/**
 * The one line at the top of Hoy.
 *
 * Deliberately not `${n} tarea(s) y ${m} evento(s)`: the empty case reads as a
 * machine reporting zeroes. When there is nothing, Hoy says so like a person.
 */
export const dayNarrative = ({ tasks, events, openShoppingLists = 0 }: DayInput): DayNarrative => {
  const open = tasks.filter(isOpenTask).length;
  const parts: string[] = [];
  if (open > 0) parts.push(plural(open, 'tarea', 'tareas'));
  if (events.length > 0) parts.push(plural(events.length, 'evento', 'eventos'));
  if (openShoppingLists > 0) {
    parts.push(plural(openShoppingLists, 'lista de la compra', 'listas de la compra'));
  }

  if (parts.length === 0) {
    return { title: 'Hoy está todo tranquilo', detail: 'No tienes tareas ni eventos para hoy.' };
  }

  return { title: `Tienes ${joinNatural(parts)} por delante.`, detail: null };
};
