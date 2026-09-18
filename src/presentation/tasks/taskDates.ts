import type { Task } from '@domain/tasks/entities/Task';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/**
 * `dueDate` is a plain `YYYY-MM-DD` with no time and no zone. Parsing it with
 * `new Date(iso)` would treat it as UTC midnight and shift it to the previous
 * day for anybody west of Greenwich, so the parts are read as a local calendar
 * day instead.
 */
export const parseDueDate = (dueDate: string): Date | null => {
  const [year, month, day] = dueDate.slice(0, 10).split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return new Date(year, month - 1, day);
};

/** Whole days between today and the due date. Negative means overdue. */
export const daysUntil = (dueDate: string, now: Date = new Date()): number | null => {
  const due = parseDueDate(dueDate);
  if (!due) return null;
  return Math.round((startOfDay(due) - startOfDay(now)) / MS_PER_DAY);
};

/**
 * The label a row shows next to a task. Returns `''` for an unparseable date so
 * callers can drop the element instead of rendering "Invalid Date".
 *
 * Overdue is deliberately NOT expressed here: the row renders that as its own
 * badge driven by the backend's `isOverdue`, so the label stays free to carry the
 * actual date ("10 sep") rather than losing it to the word "Atrasada".
 */
export const formatDueLabel = (dueDate: string, now: Date = new Date()): string => {
  const due = parseDueDate(dueDate);
  const delta = daysUntil(dueDate, now);
  if (!due || delta === null) return '';
  if (delta === 0) return 'Hoy';
  if (delta === 1) return 'Mañana';
  const day = due.getDate();
  const month = MONTHS_SHORT[due.getMonth()];
  if (due.getFullYear() !== now.getFullYear()) return `${day} ${month} ${due.getFullYear()}`;
  return `${day} ${month}`;
};

export interface TaskBuckets {
  today: Task[];
  tomorrow: Task[];
  upcoming: Task[];
  completed: Task[];
}

const byDueDate = (a: Task, b: Task): number => a.dueDate.localeCompare(b.dueDate);

const byCompletedAtDesc = (a: Task, b: Task): number =>
  (b.completedAt ?? '').localeCompare(a.completedAt ?? '');

/**
 * Groups tasks by when they are due.
 *
 * Overdue tasks land in `today` rather than in a group of their own: they are
 * precisely what needs attention now, and the row keeps its `isOverdue` flag to
 * say so. `CANCELLED` tasks are dropped — they are not actionable and showing
 * them would only add noise to a list meant for acting on.
 */
export const bucketTasks = (tasks: Task[], now: Date = new Date()): TaskBuckets => {
  const buckets: TaskBuckets = { today: [], tomorrow: [], upcoming: [], completed: [] };

  for (const task of tasks) {
    if (task.status === 'COMPLETED') {
      buckets.completed.push(task);
      continue;
    }
    if (task.status === 'CANCELLED') continue;

    const delta = daysUntil(task.dueDate, now);
    if (delta === null || delta <= 0) buckets.today.push(task);
    else if (delta === 1) buckets.tomorrow.push(task);
    else buckets.upcoming.push(task);
  }

  buckets.today.sort(byDueDate);
  buckets.tomorrow.sort(byDueDate);
  buckets.upcoming.sort(byDueDate);
  buckets.completed.sort(byCompletedAtDesc);

  return buckets;
};

/** How many of the given tasks are still open — used for Hoy's day summary. */
export const countOpen = (tasks: Task[]): number =>
  tasks.filter((task) => task.status !== 'COMPLETED' && task.status !== 'CANCELLED').length;
