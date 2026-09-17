import type { PetDto, PetMedicalRecordDto } from '@data/pets/dtos/petDtos';
import {
  toCreateMedicalRecordRequest,
  toCreatePetCareTaskRequest,
  toCreatePetRequest,
  toPet,
  toPetMedicalRecord,
  toPetPermission,
  toSetPetPermissionRequest,
  toUpdateMedicalRecordRequest,
  toUpdatePetRequest,
} from '@data/pets/mappers/petMappers';
import { describe, expect, it } from 'vitest';

const petDto: PetDto = {
  id: 'p1',
  householdId: 'h1',
  name: 'Luna',
  species: 'Perro',
  breed: 'Mestiza',
  birthDate: '2020-05-01T00:00:00.000Z',
  ageYears: 6,
  photoUrl: null,
  weightKg: 12.5,
  allergies: 'Pollo',
  notes: null,
  microchipNumber: '981000000000',
  vetName: 'Dra. Ruiz',
  vetPhone: '600000000',
  emergencyContactName: 'Ana',
  emergencyContactPhone: '611111111',
  createdAt: '2026-09-17T09:00:00.000Z',
  updatedAt: '2026-09-17T09:00:00.000Z',
};

const recordDto: PetMedicalRecordDto = {
  id: 'm1',
  petId: 'p1',
  type: 'VACCINE',
  title: 'Rabia',
  notes: null,
  date: '2026-08-01T00:00:00.000Z',
  nextDueDate: '2027-08-01T00:00:00.000Z',
  createdBy: 'u1',
  createdAt: '2026-08-01T10:00:00.000Z',
};

describe('petMappers', () => {
  it('maps a pet dto onto the entity', () => {
    expect(toPet(petDto)).toEqual({
      id: 'p1',
      householdId: 'h1',
      name: 'Luna',
      species: 'Perro',
      breed: 'Mestiza',
      birthDate: '2020-05-01T00:00:00.000Z',
      ageYears: 6,
      photoUrl: null,
      weightKg: 12.5,
      allergies: 'Pollo',
      notes: null,
      microchipNumber: '981000000000',
      vetName: 'Dra. Ruiz',
      vetPhone: '600000000',
      emergencyContactName: 'Ana',
      emergencyContactPhone: '611111111',
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
    });
  });

  it('normalises the optional pet fields to null', () => {
    const sparse: PetDto = {
      id: 'p2',
      householdId: 'h1',
      name: 'Nube',
      species: 'Gato',
      ageYears: 0,
      createdAt: '2026-09-17T09:00:00.000Z',
      updatedAt: '2026-09-17T09:00:00.000Z',
    };

    const mapped = toPet(sparse);

    expect(mapped.breed).toBeNull();
    expect(mapped.birthDate).toBeNull();
    expect(mapped.weightKg).toBeNull();
    expect(mapped.allergies).toBeNull();
    expect(mapped.notes).toBeNull();
  });

  it('maps a medical record dto onto the entity', () => {
    expect(toPetMedicalRecord(recordDto)).toEqual({
      id: 'm1',
      petId: 'p1',
      type: 'VACCINE',
      title: 'Rabia',
      notes: null,
      date: '2026-08-01T00:00:00.000Z',
      nextDueDate: '2027-08-01T00:00:00.000Z',
      createdBy: 'u1',
      createdAt: '2026-08-01T10:00:00.000Z',
    });
  });

  it('maps a permission dto onto the entity', () => {
    expect(toPetPermission({ householdId: 'h1', userId: 'u2', level: 'BASIC' })).toEqual({
      householdId: 'h1',
      userId: 'u2',
      level: 'BASIC',
    });
  });

  it('serialises only the provided optional pet fields', () => {
    expect(toCreatePetRequest({ name: 'Luna', species: 'Perro' })).toEqual({
      name: 'Luna',
      species: 'Perro',
    });
  });

  it('keeps an explicit zero weight (it must not be dropped as falsy)', () => {
    expect(toCreatePetRequest({ name: 'Nube', species: 'Gato', weightKg: 0 })).toEqual({
      name: 'Nube',
      species: 'Gato',
      weightKg: 0,
    });
  });

  it('serialises a partial pet update', () => {
    expect(toUpdatePetRequest({ allergies: 'Ninguna' })).toEqual({ allergies: 'Ninguna' });
  });

  it('never sends the medical record type on update', () => {
    expect(toUpdateMedicalRecordRequest({ title: 'Revisión anual' })).toEqual({
      title: 'Revisión anual',
    });
  });

  it('serialises a medical record creation', () => {
    expect(
      toCreateMedicalRecordRequest({ type: 'CHECKUP', title: 'Revisión', date: '2026-09-01' }),
    ).toEqual({ type: 'CHECKUP', title: 'Revisión', date: '2026-09-01' });
  });

  it('serialises the permission level', () => {
    expect(toSetPetPermissionRequest('MEDICAL')).toEqual({ level: 'MEDICAL' });
  });

  describe('toCreatePetCareTaskRequest (TD-021)', () => {
    it('serialises the required fields', () => {
      expect(toCreatePetCareTaskRequest({ title: 'Pasear', dueDate: '2026-09-20' })).toEqual({
        title: 'Pasear',
        dueDate: '2026-09-20',
      });
    });

    it('omits optional keys that were not provided', () => {
      const request = toCreatePetCareTaskRequest({ title: 'Pasear', dueDate: '2026-09-20' });
      expect('description' in request).toBe(false);
      expect('rotative' in request).toBe(false);
      expect('assignedTo' in request).toBe(false);
    });

    it('keeps rotative when it is explicitly false', () => {
      // false is a value, not an absence: sending it is what switches a
      // rotative task back to a single assignment.
      const request = toCreatePetCareTaskRequest({
        title: 'Pasear',
        dueDate: '2026-09-20',
        rotative: false,
      });
      expect('rotative' in request).toBe(true);
      expect(request.rotative).toBe(false);
    });

    it('carries the optional fields when they are set', () => {
      expect(
        toCreatePetCareTaskRequest({
          title: 'Pasear',
          dueDate: '2026-09-20',
          description: 'Por la mañana',
          rotative: true,
          assignedTo: 'u2',
        }),
      ).toEqual({
        title: 'Pasear',
        dueDate: '2026-09-20',
        description: 'Por la mañana',
        rotative: true,
        assignedTo: 'u2',
      });
    });
  });
});
