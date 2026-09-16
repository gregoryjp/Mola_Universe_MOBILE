import {
  toActivateSosRequest,
  toActivatedSosEvent,
  toCancelSosRequest,
  toCreateTrustedContactRequest,
  toSosEvent,
  toTrustedContact,
} from '@data/sos/mappers/sosMappers';
import { describe, expect, it } from 'vitest';

describe('sos mappers', () => {
  it('maps a trusted contact, defaulting the optional phone to null', () => {
    expect(
      toTrustedContact({
        id: 'c1',
        name: 'Ana',
        email: 'ana@example.com',
        isMolaUser: true,
        pushEnabled: true,
        verified: false,
        createdAt: '2026-09-17T09:00:00.000Z',
      }),
    ).toEqual({
      id: 'c1',
      name: 'Ana',
      email: 'ana@example.com',
      phone: null,
      isMolaUser: true,
      pushEnabled: true,
      verified: false,
      createdAt: '2026-09-17T09:00:00.000Z',
    });
  });

  it('maps a sos event defaulting the nullable fields', () => {
    expect(
      toSosEvent({
        id: 's1',
        status: 'PENDING',
        activatedAt: '2026-09-17T09:00:00.000Z',
      }),
    ).toEqual({
      id: 's1',
      status: 'PENDING',
      message: null,
      locationLat: null,
      locationLng: null,
      activatedAt: '2026-09-17T09:00:00.000Z',
      dispatchedAt: null,
      cancelledAt: null,
    });
  });

  it('keeps the cancellation window on activation', () => {
    const event = toActivatedSosEvent({
      id: 's1',
      status: 'PENDING',
      message: 'Ayuda',
      locationLat: 40.4,
      locationLng: -3.7,
      activatedAt: '2026-09-17T09:00:00.000Z',
      cancelWindowMs: 15000,
    });

    expect(event.cancelWindowMs).toBe(15000);
    expect(event.message).toBe('Ayuda');
    expect(event.locationLat).toBe(40.4);
  });

  it('omits the phone when creating a contact without it', () => {
    expect(toCreateTrustedContactRequest({ name: 'Ana', email: 'ana@example.com' })).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
    });
    expect(
      toCreateTrustedContactRequest({ name: 'Ana', email: 'ana@example.com', phone: '+34600000000' }),
    ).toEqual({ name: 'Ana', email: 'ana@example.com', phone: '+34600000000' });
  });

  it('omits every undefined field when activating', () => {
    expect(toActivateSosRequest({})).toEqual({});
    expect(toActivateSosRequest({ message: 'Ayuda', locationLat: 1, locationLng: 2 })).toEqual({
      message: 'Ayuda',
      locationLat: 1,
      locationLng: 2,
    });
  });

  it('wraps the event id when cancelling', () => {
    expect(toCancelSosRequest('s1')).toEqual({ sosEventId: 's1' });
  });
});
