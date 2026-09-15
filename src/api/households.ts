import { apiClient } from './client';
import { HouseholdEntity, HouseholdMemberEntity } from '../types/entities';

export interface CreateHouseholdPayload {
  name: string;
  description?: string;
}

export async function getMyHouseholds(): Promise<HouseholdEntity[]> {
  const { data } = await apiClient.get<HouseholdEntity[]>('/households');
  return data;
}

export async function getHousehold(householdId: string): Promise<HouseholdEntity> {
  const { data } = await apiClient.get<HouseholdEntity>(`/households/${householdId}`);
  return data;
}

export async function createHousehold(payload: CreateHouseholdPayload): Promise<HouseholdEntity> {
  const { data } = await apiClient.post<HouseholdEntity>('/households', payload);
  return data;
}

export async function updateHousehold(
  householdId: string,
  payload: Partial<CreateHouseholdPayload>
): Promise<HouseholdEntity> {
  const { data } = await apiClient.patch<HouseholdEntity>(
    `/households/${householdId}`,
    payload
  );
  return data;
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMemberEntity[]> {
  const { data } = await apiClient.get<HouseholdMemberEntity[]>(
    `/households/${householdId}/members`
  );
  return data;
}

export async function inviteMember(
  householdId: string,
  email: string,
  role?: 'ADMIN' | 'MEMBER'
): Promise<{ id: string; email: string; role: string; status: string }> {
  const { data } = await apiClient.post(`/households/${householdId}/members/invite`, {
    email,
    role,
  });
  return data;
}

export async function transferOwnership(
  householdId: string,
  newOwnerId: string
): Promise<HouseholdEntity> {
  const { data } = await apiClient.post<HouseholdEntity>(
    `/households/${householdId}/transfer-ownership`,
    { newOwnerId }
  );
  return data;
}

export async function removeMember(householdId: string, userId: string): Promise<void> {
  await apiClient.delete(`/households/${householdId}/members/${userId}`);
}
