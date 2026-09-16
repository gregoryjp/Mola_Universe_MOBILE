// Mirrors the backend pets contracts (modules/pets/interface/IPet.ts).

export type PetPermissionLevel = 'BASIC' | 'REGULAR' | 'MEDICAL';

export type PetMedicalRecordType =
  | 'CONSULTATION'
  | 'VACCINE'
  | 'TREATMENT'
  | 'MEDICATION'
  | 'CHECKUP';

export interface Pet {
  id: string;
  householdId: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  /** Derived server-side from `birthDate`; floor of the age in years. */
  ageYears: number;
  photoUrl: string | null;
  weightKg: number | null;
  allergies: string | null;
  notes: string | null;
  microchipNumber: string | null;
  vetName: string | null;
  vetPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetMedicalRecord {
  id: string;
  petId: string;
  type: PetMedicalRecordType;
  title: string;
  notes: string | null;
  date: string;
  nextDueDate: string | null;
  createdBy: string;
  createdAt: string;
}

/**
 * A pet's permission is stored per household member. Members without an
 * explicit row get a default: the OWNER is MEDICAL, anyone else REGULAR
 * (backend: petPermissionService.getEffectiveLevel).
 */
export interface PetPermission {
  householdId: string;
  userId: string;
  level: PetPermissionLevel;
}

export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  photoUrl?: string;
  weightKg?: number;
  allergies?: string;
  notes?: string;
  microchipNumber?: string;
  vetName?: string;
  vetPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export type UpdatePetInput = Partial<CreatePetInput>;

export interface CreateMedicalRecordInput {
  type: PetMedicalRecordType;
  title: string;
  notes?: string;
  date: string;
  nextDueDate?: string;
}

/** The record type is immutable after creation, so it is excluded here. */
export type UpdateMedicalRecordInput = Partial<Omit<CreateMedicalRecordInput, 'type'>>;
