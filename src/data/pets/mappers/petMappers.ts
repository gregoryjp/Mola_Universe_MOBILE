import type {
  CreateMedicalRecordInput,
  CreatePetInput,
  Pet,
  PetMedicalRecord,
  PetMedicalRecordType,
  PetPermission,
  PetPermissionLevel,
  UpdateMedicalRecordInput,
  UpdatePetInput,
} from '@domain/pets/entities/Pet';
import type {
  CreateMedicalRecordRequestDto,
  CreatePetRequestDto,
  PetDto,
  PetMedicalRecordDto,
  PetPermissionDto,
  SetPetPermissionRequestDto,
  UpdateMedicalRecordRequestDto,
  UpdatePetRequestDto,
} from '../dtos/petDtos';

export const toPet = (dto: PetDto): Pet => ({
  id: dto.id,
  householdId: dto.householdId,
  name: dto.name,
  species: dto.species,
  breed: dto.breed ?? null,
  birthDate: dto.birthDate ?? null,
  ageYears: dto.ageYears,
  photoUrl: dto.photoUrl ?? null,
  weightKg: dto.weightKg ?? null,
  allergies: dto.allergies ?? null,
  notes: dto.notes ?? null,
  microchipNumber: dto.microchipNumber ?? null,
  vetName: dto.vetName ?? null,
  vetPhone: dto.vetPhone ?? null,
  emergencyContactName: dto.emergencyContactName ?? null,
  emergencyContactPhone: dto.emergencyContactPhone ?? null,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toPetMedicalRecord = (dto: PetMedicalRecordDto): PetMedicalRecord => ({
  id: dto.id,
  petId: dto.petId,
  type: dto.type as PetMedicalRecordType,
  title: dto.title,
  notes: dto.notes ?? null,
  date: dto.date,
  nextDueDate: dto.nextDueDate ?? null,
  createdBy: dto.createdBy,
  createdAt: dto.createdAt,
});

export const toPetPermission = (dto: PetPermissionDto): PetPermission => ({
  householdId: dto.householdId,
  userId: dto.userId,
  level: dto.level as PetPermissionLevel,
});

export const toCreatePetRequest = (input: CreatePetInput): CreatePetRequestDto => ({
  name: input.name,
  species: input.species,
  ...(input.breed !== undefined && { breed: input.breed }),
  ...(input.birthDate !== undefined && { birthDate: input.birthDate }),
  ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
  ...(input.weightKg !== undefined && { weightKg: input.weightKg }),
  ...(input.allergies !== undefined && { allergies: input.allergies }),
  ...(input.notes !== undefined && { notes: input.notes }),
  ...(input.microchipNumber !== undefined && { microchipNumber: input.microchipNumber }),
  ...(input.vetName !== undefined && { vetName: input.vetName }),
  ...(input.vetPhone !== undefined && { vetPhone: input.vetPhone }),
  ...(input.emergencyContactName !== undefined && {
    emergencyContactName: input.emergencyContactName,
  }),
  ...(input.emergencyContactPhone !== undefined && {
    emergencyContactPhone: input.emergencyContactPhone,
  }),
});

export const toUpdatePetRequest = (input: UpdatePetInput): UpdatePetRequestDto =>
  toCreatePetRequest(input as CreatePetInput);

export const toCreateMedicalRecordRequest = (
  input: CreateMedicalRecordInput,
): CreateMedicalRecordRequestDto => ({
  type: input.type,
  title: input.title,
  date: input.date,
  ...(input.notes !== undefined && { notes: input.notes }),
  ...(input.nextDueDate !== undefined && { nextDueDate: input.nextDueDate }),
});

export const toUpdateMedicalRecordRequest = (
  input: UpdateMedicalRecordInput,
): UpdateMedicalRecordRequestDto => ({
  ...(input.title !== undefined && { title: input.title }),
  ...(input.notes !== undefined && { notes: input.notes }),
  ...(input.date !== undefined && { date: input.date }),
  ...(input.nextDueDate !== undefined && { nextDueDate: input.nextDueDate }),
});

export const toSetPetPermissionRequest = (
  level: PetPermissionLevel,
): SetPetPermissionRequestDto => ({
  level,
});
