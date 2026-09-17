import {
  isQuietHoursConfigured,
  isValidQuietHour,
  toQuietHoursDraft,
  validateQuietHours,
} from '@presentation/notifications/quietHours';
import { describe, expect, it } from 'vitest';

describe('isValidQuietHour', () => {
  it.each(['00:00', '07:00', '12:30', '22:00', '23:59'])('accepts %s', (value) => {
    expect(isValidQuietHour(value)).toBe(true);
  });

  it.each([
    ['24:00', 'hour out of range'],
    ['23:60', 'minute out of range'],
    ['7:00', 'hour not zero-padded'],
    ['0700', 'no separator'],
    ['', 'empty'],
    ['abc', 'not a time'],
    ['22:00:00', 'has seconds'],
    [' 22:00', 'leading space'],
  ])('rejects %s (%s)', (value) => {
    expect(isValidQuietHour(value)).toBe(false);
  });

  it('matches the backend pattern, not a looser one', () => {
    // The backend uses ^([01][0-9]|2[0-3]):[0-5][0-9]$. A value the client
    // accepts but the server rejects would surface as a 400 on save.
    expect(isValidQuietHour('09:05')).toBe(true);
    expect(isValidQuietHour('19:59')).toBe(true);
    expect(isValidQuietHour('2:00')).toBe(false);
  });
});

describe('toQuietHoursDraft', () => {
  it('turns nulls into empty strings so the field can be cleared', () => {
    expect(toQuietHoursDraft({ quietHoursStart: null, quietHoursEnd: null })).toEqual({
      start: '',
      end: '',
    });
  });

  it('keeps configured values verbatim', () => {
    expect(toQuietHoursDraft({ quietHoursStart: '22:00', quietHoursEnd: '07:00' })).toEqual({
      start: '22:00',
      end: '07:00',
    });
  });

  it('handles a half-set window coming from the server', () => {
    // Not reachable through this UI, but the server can hold it (the update
    // schema validates each bound on its own).
    expect(toQuietHoursDraft({ quietHoursStart: '22:00', quietHoursEnd: null })).toEqual({
      start: '22:00',
      end: '',
    });
  });
});

describe('isQuietHoursConfigured', () => {
  it('is true only when both bounds are valid times', () => {
    expect(isQuietHoursConfigured({ quietHoursStart: '22:00', quietHoursEnd: '07:00' })).toBe(true);
    expect(isQuietHoursConfigured({ quietHoursStart: '22:00', quietHoursEnd: null })).toBe(false);
    expect(isQuietHoursConfigured({ quietHoursStart: null, quietHoursEnd: '07:00' })).toBe(false);
    expect(isQuietHoursConfigured({ quietHoursStart: null, quietHoursEnd: null })).toBe(false);
    expect(isQuietHoursConfigured({ quietHoursStart: '99:99', quietHoursEnd: '07:00' })).toBe(false);
  });
});

describe('validateQuietHours', () => {
  it('accepts a full valid window', () => {
    expect(validateQuietHours({ start: '22:00', end: '07:00' })).toEqual({
      ok: true,
      value: { quietHoursStart: '22:00', quietHoursEnd: '07:00' },
    });
  });

  it('passes an overnight window through without correcting it', () => {
    // start > end is legal and meaningful (wraps past midnight); a client that
    // "tidied" this into an ordered pair would silently invert the window.
    expect(validateQuietHours({ start: '23:00', end: '06:00' })).toEqual({
      ok: true,
      value: { quietHoursStart: '23:00', quietHoursEnd: '06:00' },
    });
  });

  it('trims surrounding whitespace before sending', () => {
    expect(validateQuietHours({ start: ' 22:00 ', end: ' 07:00 ' })).toEqual({
      ok: true,
      value: { quietHoursStart: '22:00', quietHoursEnd: '07:00' },
    });
  });

  it('clears the window when both fields are empty', () => {
    expect(validateQuietHours({ start: '', end: '' })).toEqual({
      ok: true,
      value: { quietHoursStart: null, quietHoursEnd: null },
    });
  });

  it('rejects a half-set window instead of sending something the server ignores', () => {
    // The backend returns false from its quiet-hours check when either bound is
    // null, so sending one alone would look saved and do nothing.
    const onlyStart = validateQuietHours({ start: '22:00', end: '' });
    const onlyEnd = validateQuietHours({ start: '', end: '07:00' });

    expect(onlyStart.ok).toBe(false);
    expect(onlyEnd.ok).toBe(false);
  });

  it('treats whitespace-only fields as empty', () => {
    expect(validateQuietHours({ start: '   ', end: '   ' }).ok).toBe(true);
  });

  it('rejects a malformed bound and says which format is expected', () => {
    const result = validateQuietHours({ start: '22:0', end: '07:00' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('HH:mm');
  });
});
