// Mirrors the backend pets payloads (modules/pets/services/petService.ts and friends).

export interface PetDto {
  id: string;
  householdId: string;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  ageYears: number;
  photoUrl?: string | null;
  weightKg?: number | null;
  allergies?: string | null;
  notes?: string | null;
  microchipNumber?: string | null;
  vetName?: string | null;
  vetPhone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PetMedicalRecordDto {
  id: string;
  petId: string;
  type: string;
  title: string;
  notes?: string | null;
  date: string;
  nextDueDate?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface PetPermissionDto {
  householdId: string;
  userId: string;
  level: string;
}

/** `CreatePetSchema`: adheres to `additionalProperties: false`. */
export interface CreatePetRequestDto {
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

export type UpdatePetRequestDto = Partial<CreatePetRequestDto>;

export interface CreateMedicalRecordRequestDto {
  type: string;
  title: string;
  notes?: string;
  date: string;
  nextDueDate?: string;
}

export type UpdateMedicalRecordRequestDto = Partial<Omit<CreateMedicalRecordRequestDto, 'type'>>;

/** `CreatePetCareTaskSchema`. `additionalProperties: false`, so omit undefined keys. */
export interface CreatePetCareTaskRequestDto {
  title: string;
  dueDate: string;
  description?: string;
  rotative?: boolean;
  assignedTo?: string;
}

/** `SetPetPermissionSchema`: `{ level }`. */
export interface SetPetPermissionRequestDto {
  level: string;
}
