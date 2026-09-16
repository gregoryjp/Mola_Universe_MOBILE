import type {
  CreateMedicalRecordInput,
  CreatePetInput,
  Pet,
  PetMedicalRecord,
  PetPermission,
  PetPermissionLevel,
  UpdateMedicalRecordInput,
  UpdatePetInput,
} from '../entities/Pet';

export interface PetsError {
  code: string;
  message: string;
  statusCode: number;
}

export type PetsResult<T> = { success: true; value: T } | { success: false; error: PetsError };

/**
 * Pets port. Every pet route is household-scoped, and the permission routes
 * hang off the household (not the pet) because a level applies to the member
 * across all pets. Medical records hang off the pet.
 * Verified in modules/pets/routes/petRoutes.ts.
 */
export interface PetRepository {
  listPets(householdId: string): Promise<PetsResult<Pet[]>>;
  createPet(householdId: string, input: CreatePetInput): Promise<PetsResult<Pet>>;
  getPet(householdId: string, petId: string): Promise<PetsResult<Pet>>;
  updatePet(householdId: string, petId: string, input: UpdatePetInput): Promise<PetsResult<Pet>>;
  archivePet(householdId: string, petId: string): Promise<PetsResult<void>>;

  listPermissions(householdId: string): Promise<PetsResult<PetPermission[]>>;
  setPermission(
    householdId: string,
    userId: string,
    level: PetPermissionLevel,
  ): Promise<PetsResult<PetPermission>>;

  listMedicalRecords(householdId: string, petId: string): Promise<PetsResult<PetMedicalRecord[]>>;
  createMedicalRecord(
    householdId: string,
    petId: string,
    input: CreateMedicalRecordInput,
  ): Promise<PetsResult<PetMedicalRecord>>;
  updateMedicalRecord(
    householdId: string,
    petId: string,
    recordId: string,
    input: UpdateMedicalRecordInput,
  ): Promise<PetsResult<PetMedicalRecord>>;
  deleteMedicalRecord(
    householdId: string,
    petId: string,
    recordId: string,
  ): Promise<PetsResult<void>>;
}
