import type { RawResult } from '@data/api/client';
import { apiClient } from '@data/api/client';
import type {
  CreateMedicalRecordInput,
  CreatePetInput,
  Pet,
  PetMedicalRecord,
  PetPermission,
  PetPermissionLevel,
  UpdateMedicalRecordInput,
  UpdatePetInput,
} from '@domain/pets/entities/Pet';
import type { PetRepository, PetsResult } from '@domain/pets/repositories/PetRepository';
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
import {
  toCreateMedicalRecordRequest,
  toCreatePetRequest,
  toPet,
  toPetMedicalRecord,
  toPetPermission,
  toSetPetPermissionRequest,
  toUpdateMedicalRecordRequest,
  toUpdatePetRequest,
} from '../mappers/petMappers';

const toError = (raw: Extract<RawResult<unknown>, { success: false }>) => ({
  code: raw.error.code,
  message: raw.error.message,
  statusCode: raw.error.statusCode ?? raw.status,
});

const toResult = <TD, T>(raw: RawResult<TD>, map: (dto: TD) => T): PetsResult<T> =>
  raw.success ? { success: true, value: map(raw.data) } : { success: false, error: toError(raw) };

const toArrayResult = <TD, T>(raw: RawResult<TD[]>, map: (dto: TD) => T): PetsResult<T[]> =>
  raw.success
    ? { success: true, value: raw.data.map(map) }
    : { success: false, error: toError(raw) };

const emptyOk = (): PetsResult<void> => ({ success: true, value: undefined });

const pets = (householdId: string): string => `/households/${householdId}/pets`;

const medicalRecords = (householdId: string, petId: string): string =>
  `${pets(householdId)}/${petId}/medical-records`;

export class PetRepositoryImpl implements PetRepository {
  async listPets(householdId: string): Promise<PetsResult<Pet[]>> {
    const raw = await apiClient.getRaw<PetDto[]>(pets(householdId));
    return toArrayResult(raw, toPet);
  }

  async createPet(householdId: string, input: CreatePetInput): Promise<PetsResult<Pet>> {
    const body: CreatePetRequestDto = toCreatePetRequest(input);
    const raw = await apiClient.postRaw<PetDto>(pets(householdId), body);
    return toResult(raw, toPet);
  }

  async getPet(householdId: string, petId: string): Promise<PetsResult<Pet>> {
    const raw = await apiClient.getRaw<PetDto>(`${pets(householdId)}/${petId}`);
    return toResult(raw, toPet);
  }

  async updatePet(
    householdId: string,
    petId: string,
    input: UpdatePetInput,
  ): Promise<PetsResult<Pet>> {
    const body: UpdatePetRequestDto = toUpdatePetRequest(input);
    const raw = await apiClient.patchRaw<PetDto>(`${pets(householdId)}/${petId}`, body);
    return toResult(raw, toPet);
  }

  async archivePet(householdId: string, petId: string): Promise<PetsResult<void>> {
    const raw = await apiClient.deleteRaw<void>(`${pets(householdId)}/${petId}`);
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }

  async listPermissions(householdId: string): Promise<PetsResult<PetPermission[]>> {
    const raw = await apiClient.getRaw<PetPermissionDto[]>(`${pets(householdId)}/permissions`);
    return toArrayResult(raw, toPetPermission);
  }

  async setPermission(
    householdId: string,
    userId: string,
    level: PetPermissionLevel,
  ): Promise<PetsResult<PetPermission>> {
    const body: SetPetPermissionRequestDto = toSetPetPermissionRequest(level);
    const raw = await apiClient.patchRaw<PetPermissionDto>(
      `${pets(householdId)}/permissions/${userId}`,
      body,
    );
    return toResult(raw, toPetPermission);
  }

  async listMedicalRecords(
    householdId: string,
    petId: string,
  ): Promise<PetsResult<PetMedicalRecord[]>> {
    const raw = await apiClient.getRaw<PetMedicalRecordDto[]>(medicalRecords(householdId, petId));
    return toArrayResult(raw, toPetMedicalRecord);
  }

  async createMedicalRecord(
    householdId: string,
    petId: string,
    input: CreateMedicalRecordInput,
  ): Promise<PetsResult<PetMedicalRecord>> {
    const body: CreateMedicalRecordRequestDto = toCreateMedicalRecordRequest(input);
    const raw = await apiClient.postRaw<PetMedicalRecordDto>(
      medicalRecords(householdId, petId),
      body,
    );
    return toResult(raw, toPetMedicalRecord);
  }

  async updateMedicalRecord(
    householdId: string,
    petId: string,
    recordId: string,
    input: UpdateMedicalRecordInput,
  ): Promise<PetsResult<PetMedicalRecord>> {
    const body: UpdateMedicalRecordRequestDto = toUpdateMedicalRecordRequest(input);
    const raw = await apiClient.patchRaw<PetMedicalRecordDto>(
      `${medicalRecords(householdId, petId)}/${recordId}`,
      body,
    );
    return toResult(raw, toPetMedicalRecord);
  }

  async deleteMedicalRecord(
    householdId: string,
    petId: string,
    recordId: string,
  ): Promise<PetsResult<void>> {
    const raw = await apiClient.deleteRaw<void>(
      `${medicalRecords(householdId, petId)}/${recordId}`,
    );
    return raw.success ? emptyOk() : { success: false, error: toError(raw) };
  }
}

export const petRepository: PetRepository = new PetRepositoryImpl();
