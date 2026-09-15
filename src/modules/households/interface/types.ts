export interface Household {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  status: 'active' | 'invited' | 'removed';
}

export interface HouseholdInvite {
  id: string;
  householdId: string;
  householdName: string;
  invitedBy: string;
  invitedByName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface CreateHouseholdRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateHouseholdResponse {
  household: Household;
}

export interface UpdateHouseholdRequest {
  name?: string;
  description?: string;
  icon?: string;
}

export interface UpdateHouseholdResponse {
  household: Household;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member';
}

export interface InviteMemberResponse {
  invite: HouseholdInvite;
}

export interface AcceptInviteRequest {
  inviteId: string;
}

export interface AcceptInviteResponse {
  household: Household;
}

export interface FetchHouseholdsResponse {
  households: Household[];
}

export interface FetchHouseholdResponse {
  household: Household;
}

export interface FetchMembersResponse {
  members: HouseholdMember[];
}

export interface FetchInvitesResponse {
  invites: HouseholdInvite[];
}
