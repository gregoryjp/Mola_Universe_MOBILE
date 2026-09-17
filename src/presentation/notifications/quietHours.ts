/**
 * Quiet-hours semantics, kept out of the component so they are testable.
 *
 * The backend stores two `HH:mm` strings in 24h format and compares them against
 * **server UTC**, not the device's local time — per-user timezone is explicitly
 * out of scope for the notifications MVP (`notificationService.ts`). The field
 * therefore means UTC, and the UI has to say so rather than imply local time.
 *
 * The backend also treats a half-set window as "off": with either bound null it
 * returns `false` from its quiet-hours check, so a single value would silently
 * do nothing. `validateQuietHours` enforces both-or-neither for that reason.
 */

/** Mirrors the backend pattern: `^([01][0-9]|2[0-3]):[0-5][0-9]$`. */
const QUIET_HOUR_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export interface QuietHoursDraft {
  start: string;
  end: string;
}

export interface QuietHoursSource {
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export type QuietHoursValidation =
  | { ok: true; value: { quietHoursStart: string | null; quietHoursEnd: string | null } }
  | { ok: false; error: string };

export const isValidQuietHour = (value: string): boolean => QUIET_HOUR_PATTERN.test(value);

export const toQuietHoursDraft = (source: QuietHoursSource): QuietHoursDraft => ({
  start: source.quietHoursStart ?? '',
  end: source.quietHoursEnd ?? '',
});

export const isQuietHoursConfigured = (source: QuietHoursSource): boolean =>
  isValidQuietHour(source.quietHoursStart ?? '') && isValidQuietHour(source.quietHoursEnd ?? '');

/**
 * Both empty clears the window (a meaningful action: it switches the feature
 * off). One set and the other empty is rejected instead of sent, because the
 * backend would accept it and then ignore it — an invisible no-op.
 */
export const validateQuietHours = (draft: QuietHoursDraft): QuietHoursValidation => {
  const start = draft.start.trim();
  const end = draft.end.trim();

  if (start === '' && end === '') {
    return { ok: true, value: { quietHoursStart: null, quietHoursEnd: null } };
  }
  if (start === '' || end === '') {
    return { ok: false, error: 'Indica la hora de inicio y la de fin, o deja las dos vacías.' };
  }
  if (!isValidQuietHour(start) || !isValidQuietHour(end)) {
    return { ok: false, error: 'Usa el formato HH:mm en 24 h, por ejemplo 22:00.' };
  }
  return { ok: true, value: { quietHoursStart: start, quietHoursEnd: end } };
};
