import {
  toCreateExternalInviteRequest,
  toCreateMomentRequest,
  toMoment,
  toMomentDetail,
  toMomentExternalInvite,
  toMomentParticipant,
  toRespondToMomentRequest,
  toUpdateMomentRequest,
} from '@data/moments/mappers/momentMappers';
import { describe, expect, it } from 'vitest';

describe('moment mappers', () => {
  it('fills every nullable field of a moment', () => {
    const moment = toMoment({
      id: 'm1',
      householdId: 'h1',
      createdBy: 'u1',
      type: 'POLL',
      title: '¿Pizza o sushi?',
      status: 'OPEN',
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
    });

    expect(moment).toEqual({
      id: 'm1',
      householdId: 'h1',
      createdBy: 'u1',
      type: 'POLL',
      title: '¿Pizza o sushi?',
      description: null,
      eventDate: null,
      detail: null,
      status: 'OPEN',
      calendarEventId: null,
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
    });
  });

  it('keeps the participants of the detail payload', () => {
    const detail = toMomentDetail({
      id: 'm1',
      householdId: 'h1',
      createdBy: 'u1',
      type: 'EVENT',
      title: 'Quedada',
      status: 'OPEN',
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
      participants: [
        { id: 'p1', momentId: 'm1', userId: 'u1', response: 'GOING' },
        { id: 'p2', momentId: 'm1', userId: 'u2', response: 'NOT_GOING' },
      ],
    });

    expect(detail.participants).toHaveLength(2);
    expect(detail.participants[0]?.respondedAt).toBeNull();
    expect(detail.participants[1]?.response).toBe('NOT_GOING');
  });

  it('normalises a participant with no response date', () => {
    expect(
      toMomentParticipant({ id: 'p1', momentId: 'm1', userId: 'u1', response: 'PENDING' }),
    ).toEqual({
      id: 'p1',
      momentId: 'm1',
      userId: 'u1',
      response: 'PENDING',
      respondedAt: null,
    });
  });

  it('maps an external invite and drops any token that might arrive', () => {
    const invite = toMomentExternalInvite({
      id: 'i1',
      momentId: 'm1',
      email: 'ana@ejemplo.com',
      isMolaUser: true,
      status: 'ACCEPTED',
      invitedAt: '2026-09-17T09:00:00.000Z',
    });

    expect(invite).toEqual({
      id: 'i1',
      momentId: 'm1',
      email: 'ana@ejemplo.com',
      name: null,
      isMolaUser: true,
      status: 'ACCEPTED',
      invitedAt: '2026-09-17T09:00:00.000Z',
      respondedAt: null,
    });
    expect(invite).not.toHaveProperty('inviteToken');
  });

  it('omits undefined optional fields on create (additionalProperties: false)', () => {
    expect(toCreateMomentRequest({ type: 'POLL', title: 'Solo lo obligatorio' })).toEqual({
      type: 'POLL',
      title: 'Solo lo obligatorio',
    });
  });

  it('sends the optional fields it is given on create', () => {
    expect(
      toCreateMomentRequest({
        type: 'EVENT',
        title: 'Cena',
        description: 'Con postre',
        eventDate: '2026-09-20T18:00:00.000Z',
        detail: 'En el salón',
        participantUserIds: ['u1', 'u2'],
      }),
    ).toEqual({
      type: 'EVENT',
      title: 'Cena',
      description: 'Con postre',
      eventDate: '2026-09-20T18:00:00.000Z',
      detail: 'En el salón',
      participantUserIds: ['u1', 'u2'],
    });
  });

  it('omits undefined optional fields on update but keeps the ones set', () => {
    expect(toUpdateMomentRequest({ title: 'Nuevo título' })).toEqual({ title: 'Nuevo título' });
    expect(toUpdateMomentRequest({ status: 'CANCELLED' })).toEqual({ status: 'CANCELLED' });
  });

  it('maps the RSVP body', () => {
    expect(toRespondToMomentRequest('GOING')).toEqual({ response: 'GOING' });
    expect(toRespondToMomentRequest('NOT_GOING')).toEqual({ response: 'NOT_GOING' });
  });

  it('maps the invite body with and without a name', () => {
    expect(toCreateExternalInviteRequest({ email: 'ana@ejemplo.com' })).toEqual({
      email: 'ana@ejemplo.com',
    });
    expect(toCreateExternalInviteRequest({ email: 'ana@ejemplo.com', name: 'Ana' })).toEqual({
      email: 'ana@ejemplo.com',
      name: 'Ana',
    });
  });
});
