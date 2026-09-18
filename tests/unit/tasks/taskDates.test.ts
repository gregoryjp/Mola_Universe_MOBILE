import type { Task } from '@domain/tasks/entities/Task';
import {
  bucketTasks,
  countOpen,
  daysUntil,
  formatDueLabel,
  parseDueDate,
} from '@presentation/tasks/taskDates';
import { describe, expect, it } from 'vitest';

const task = (id: string, dueDate: string, overrides: Partial<Task> = {}): Task => ({
  id,
  createdBy: 'u1',
  assignedTo: null,
  title: id,
  description: null,
  scope: 'HOUSEHOLD',
  householdId: 'hh-1',
  category: 'GENERAL',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate,
  completedAt: null,
  completedBy: null,
  approvedAt: null,
  approvedBy: null,
  requiresApproval: false,
  isOverdue: false,
  recurrence: 'NONE',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
  ...overrides,
});

// A Wednesday, so the weekday arithmetic in the buckets is unambiguous.
const NOW = new Date(2026, 8, 16, 10, 30);

describe('parseDueDate', () => {
  it('reads YYYY-MM-DD as a local calendar day, never as UTC midnight', () => {
    const parsed = parseDueDate('2026-09-16');

    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(16);
  });

  it('returns null for a value it cannot parse, so callers can drop the label', () => {
    expect(parseDueDate('')).toBeNull();
    expect(parseDueDate('not-a-date')).toBeNull();
  });
});

describe('daysUntil', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    // 23:59 today -> 00:01 tomorrow is minutes apart but a full day boundary.
    expect(daysUntil('2026-09-17', NOW)).toBe(1);
    expect(daysUntil('2026-09-16', NOW)).toBe(0);
    expect(daysUntil('2026-09-13', NOW)).toBe(-3);
  });
});

describe('formatDueLabel', () => {
  it('names today and tomorrow instead of printing a date', () => {
    expect(formatDueLabel('2026-09-16', NOW)).toBe('Hoy');
    expect(formatDueLabel('2026-09-17', NOW)).toBe('Mañana');
  });

  it('prints day and short month for anything further out', () => {
    expect(formatDueLabel('2026-09-25', NOW)).toBe('25 sep');
  });

  it('adds the year only when it differs from the current one', () => {
    expect(formatDueLabel('2027-01-04', NOW)).toBe('4 ene 2027');
  });

  it('returns an empty label rather than "Invalid Date"', () => {
    expect(formatDueLabel('')).toBe('');
    expect(formatDueLabel('basura')).toBe('');
  });
});

describe('bucketTasks', () => {
  it('sorts into today, tomorrow and upcoming', () => {
    const buckets = bucketTasks(
      [task('upcoming', '2026-09-30'), task('today', '2026-09-16'), task('tomorrow', '2026-09-17')],
      NOW,
    );

    expect(buckets.today.map((t) => t.id)).toEqual(['today']);
    expect(buckets.tomorrow.map((t) => t.id)).toEqual(['tomorrow']);
    expect(buckets.upcoming.map((t) => t.id)).toEqual(['upcoming']);
    expect(buckets.completed).toEqual([]);
  });

  it('keeps overdue work in today, where it needs attention', () => {
    const buckets = bucketTasks([task('late', '2026-09-10')], NOW);

    expect(buckets.today.map((t) => t.id)).toEqual(['late']);
    expect(buckets.upcoming).toEqual([]);
  });

  it('separates completed tasks, most recent first', () => {
    const buckets = bucketTasks(
      [
        task('older', '2026-09-16', { status: 'COMPLETED', completedAt: '2026-09-15T10:00:00Z' }),
        task('newer', '2026-09-16', { status: 'COMPLETED', completedAt: '2026-09-16T10:00:00Z' }),
      ],
      NOW,
    );

    expect(buckets.completed.map((t) => t.id)).toEqual(['newer', 'older']);
  });

  it('drops cancelled tasks entirely', () => {
    const buckets = bucketTasks([task('gone', '2026-09-16', { status: 'CANCELLED' })], NOW);

    expect(buckets.today).toEqual([]);
    expect(buckets.tomorrow).toEqual([]);
    expect(buckets.upcoming).toEqual([]);
    expect(buckets.completed).toEqual([]);
  });

  it('treats an unparseable due date as due now instead of losing the task', () => {
    const buckets = bucketTasks([task('broken', '')], NOW);

    expect(buckets.today.map((t) => t.id)).toEqual(['broken']);
  });
});

describe('countOpen', () => {
  it('counts neither completed nor cancelled tasks', () => {
    const tasks = [
      task('a', '2026-09-16'),
      task('b', '2026-09-16', { status: 'COMPLETED' }),
      task('c', '2026-09-16', { status: 'CANCELLED' }),
    ];

    expect(countOpen(tasks)).toBe(1);
  });
});
