import { petRepository } from '@data/pets/repositories/PetRepositoryImpl';
import type {
  CreateMedicalRecordInput,
  CreatePetInput,
  Pet,
  PetMedicalRecord,
  PetPermission,
  PetPermissionLevel,
  UpdatePetInput,
} from '@domain/pets/entities/Pet';
import type { PetsResult } from '@domain/pets/repositories/PetRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  petMedicalRecordsQueryKey,
  petPermissionsQueryKey,
  petQueryKey,
  petsQueryKey,
} from './usePets';

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para gestionar sus mascotas', 400);

const unwrap = <T>(result: PetsResult<T>): T => {
  if (!result.success) {
    throw new AppError(result.error.code, result.error.message, result.error.statusCode);
  }
  return result.value;
};

const requiredHouseholdId = (householdId: string | null): string => {
  if (householdId === null) throw noHousehold();
  return householdId;
};

export const useCreatePet = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<Pet, AppError, CreatePetInput>({
    mutationFn: async (input) =>
      unwrap(await petRepository.createPet(requiredHouseholdId(householdId), input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: petsQueryKey(householdId) });
    },
  });
};

export const useUpdatePet = (petId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<Pet, AppError, UpdatePetInput>({
    mutationFn: async (input) =>
      unwrap(await petRepository.updatePet(requiredHouseholdId(householdId), petId, input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: petsQueryKey(householdId) });
      void queryClient.invalidateQueries({ queryKey: petQueryKey(householdId, petId) });
    },
  });
};

export const useArchivePet = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<void, AppError, string>({
    mutationFn: async (petId) => {
      const result = await petRepository.archivePet(requiredHouseholdId(householdId), petId);
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: (_void, petId) => {
      void queryClient.invalidateQueries({ queryKey: petsQueryKey(householdId) });
      void queryClient.removeQueries({ queryKey: petQueryKey(householdId, petId) });
    },
  });
};

export const useCreateMedicalRecord = (petId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<PetMedicalRecord, AppError, CreateMedicalRecordInput>({
    mutationFn: async (input) =>
      unwrap(
        await petRepository.createMedicalRecord(requiredHouseholdId(householdId), petId, input),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: petMedicalRecordsQueryKey(householdId, petId),
      });
    },
  });
};

export const useDeleteMedicalRecord = (petId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<void, AppError, string>({
    mutationFn: async (recordId) => {
      const result = await petRepository.deleteMedicalRecord(
        requiredHouseholdId(householdId),
        petId,
        recordId,
      );
      if (!result.success) {
        throw new AppError(result.error.code, result.error.message, result.error.statusCode);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: petMedicalRecordsQueryKey(householdId, petId),
      });
    },
  });
};

export interface SetPermissionVariables {
  userId: string;
  level: PetPermissionLevel;
}

export const useSetPetPermission = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);
  const queryClient = useQueryClient();

  return useMutation<PetPermission, AppError, SetPermissionVariables>({
    mutationFn: async ({ userId, level }) =>
      unwrap(await petRepository.setPermission(requiredHouseholdId(householdId), userId, level)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: petPermissionsQueryKey(householdId) });
    },
  });
};
