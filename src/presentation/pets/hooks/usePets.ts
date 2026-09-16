import { petRepository } from '@data/pets/repositories/PetRepositoryImpl';
import type { Pet, PetMedicalRecord, PetPermission } from '@domain/pets/entities/Pet';
import type { PetsError } from '@domain/pets/repositories/PetRepository';
import { AppError } from '@shared/errors/AppError';
import { useHouseholdStore } from '@shared/store/householdStore';
import { useQuery } from '@tanstack/react-query';

export const petsQueryKey = (householdId: string | null) => ['pets', householdId] as const;
export const petQueryKey = (householdId: string | null, petId: string) =>
  ['pets', householdId, 'pet', petId] as const;
export const petMedicalRecordsQueryKey = (householdId: string | null, petId: string) =>
  ['pets', householdId, 'pet', petId, 'medical-records'] as const;
export const petPermissionsQueryKey = (householdId: string | null) =>
  ['pets', householdId, 'permissions'] as const;

const noHousehold = (): AppError =>
  new AppError('NO_HOUSEHOLD', 'Selecciona un hogar para ver sus mascotas', 400);

function fail(error: PetsError): never {
  throw new AppError(error.code, error.message, error.statusCode);
}

export const usePets = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<Pet[], AppError>({
    queryKey: petsQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await petRepository.listPets(householdId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
};

export const usePet = (petId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<Pet, AppError>({
    queryKey: petQueryKey(householdId, petId),
    enabled: householdId !== null && petId.length > 0,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await petRepository.getPet(householdId, petId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
};

export const usePetMedicalRecords = (petId: string) => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<PetMedicalRecord[], AppError>({
    queryKey: petMedicalRecordsQueryKey(householdId, petId),
    enabled: householdId !== null && petId.length > 0,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await petRepository.listMedicalRecords(householdId, petId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
};

export const usePetPermissions = () => {
  const householdId = useHouseholdStore((state) => state.activeHouseholdId);

  return useQuery<PetPermission[], AppError>({
    queryKey: petPermissionsQueryKey(householdId),
    enabled: householdId !== null,
    queryFn: async () => {
      if (householdId === null) throw noHousehold();
      const result = await petRepository.listPermissions(householdId);
      if (!result.success) fail(result.error);
      return result.value;
    },
  });
};
