import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import {
  Household,
  HouseholdMember,
  HouseholdInvite,
  CreateHouseholdRequest,
  CreateHouseholdResponse,
  UpdateHouseholdRequest,
  UpdateHouseholdResponse,
  InviteMemberRequest,
  InviteMemberResponse,
  AcceptInviteRequest,
  AcceptInviteResponse,
  FetchHouseholdsResponse,
  FetchHouseholdResponse,
  FetchMembersResponse,
  FetchInvitesResponse,
} from '../interface/types';

const HOUSEHOLDS_QUERY_KEY = 'households';

async function fetchHouseholds(): Promise<Household[]> {
  const response = await apiClient.get<FetchHouseholdsResponse>('/households');
  return response.data.households;
}

async function fetchHousehold(id: string): Promise<Household> {
  const response = await apiClient.get<FetchHouseholdResponse>(
    `/households/${id}`
  );
  return response.data.household;
}

async function createHousehold(data: CreateHouseholdRequest): Promise<Household> {
  const response = await apiClient.post<CreateHouseholdResponse>(
    '/households',
    data
  );
  return response.data.household;
}

async function updateHousehold(
  id: string,
  data: UpdateHouseholdRequest
): Promise<Household> {
  const response = await apiClient.patch<UpdateHouseholdResponse>(
    `/households/${id}`,
    data
  );
  return response.data.household;
}

async function deleteHousehold(id: string): Promise<void> {
  await apiClient.delete(`/households/${id}`);
}

async function fetchMembers(householdId: string): Promise<HouseholdMember[]> {
  const response = await apiClient.get<FetchMembersResponse>(
    `/households/${householdId}/members`
  );
  return response.data.members;
}

async function inviteMember(
  householdId: string,
  data: InviteMemberRequest
): Promise<HouseholdInvite> {
  const response = await apiClient.post<InviteMemberResponse>(
    `/households/${householdId}/invites`,
    data
  );
  return response.data.invite;
}

async function fetchInvites(): Promise<HouseholdInvite[]> {
  const response = await apiClient.get<FetchInvitesResponse>('/households/invites');
  return response.data.invites;
}

async function acceptInvite(data: AcceptInviteRequest): Promise<Household> {
  const response = await apiClient.post<AcceptInviteResponse>(
    `/households/invites/${data.inviteId}/accept`,
    {}
  );
  return response.data.household;
}

export function useHouseholds(selectedHouseholdId?: string) {
  const queryClient = useQueryClient();

  const householdsQuery = useQuery({
    queryKey: [HOUSEHOLDS_QUERY_KEY],
    queryFn: fetchHouseholds,
  });

  const selectedHouseholdQuery = useQuery({
    queryKey: [HOUSEHOLDS_QUERY_KEY, selectedHouseholdId],
    queryFn: () => selectedHouseholdId ? fetchHousehold(selectedHouseholdId) : null,
    enabled: !!selectedHouseholdId,
  });

  const membersQuery = useQuery({
    queryKey: [HOUSEHOLDS_QUERY_KEY, selectedHouseholdId, 'members'],
    queryFn: () => selectedHouseholdId ? fetchMembers(selectedHouseholdId) : [],
    enabled: !!selectedHouseholdId,
  });

  const invitesQuery = useQuery({
    queryKey: [HOUSEHOLDS_QUERY_KEY, 'invites'],
    queryFn: fetchInvites,
  });

  const createMutation = useMutation({
    mutationFn: createHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHouseholdRequest }) =>
      updateHousehold(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY],
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InviteMemberRequest }) =>
      inviteMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY, selectedHouseholdId, 'members'],
      });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [HOUSEHOLDS_QUERY_KEY, 'invites'],
      });
    },
  });

  return {
    households: householdsQuery.data || [],
    isLoadingHouseholds: householdsQuery.isLoading,
    householdsError: householdsQuery.error,

    selectedHousehold: selectedHouseholdQuery.data,
    isLoadingSelected: selectedHouseholdQuery.isLoading,

    members: membersQuery.data || [],
    isLoadingMembers: membersQuery.isLoading,

    invites: invitesQuery.data || [],
    isLoadingInvites: invitesQuery.isLoading,

    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    invite: inviteMutation,
    acceptInvite: acceptInviteMutation,

    isLoading:
      householdsQuery.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
