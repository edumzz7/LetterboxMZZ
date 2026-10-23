import apiClient from './apiClient';
import { normalizeAvatarPath } from './appData';
import type {
  GroupDetails,
  GroupProfile,
  GroupPendingRequests,
  GroupRanking,
  GroupRequestAction,
  GroupSearchResponse,
  MyGroup,
  MyGroupsResponse,
  SpecialNotificationsResponse,
} from '../types/app';

export const MAX_GROUPS_PER_USER = 3;
export const MAX_GROUP_MEMBERS = 15;

export function groupPath(groupId: string) {
  return `/grupo/${groupId}`;
}

/** Same avatar/display name rules as the user lists (legacy profiles keep both as JSON in avatarPath). */
function normalizeProfile<T extends GroupProfile>(profile: T): T {
  const { avatarId, displayName } = normalizeAvatarPath(profile.avatarPath, profile.id, profile.displayName);
  return { ...profile, avatarPath: avatarId, displayName: displayName ?? null };
}

export async function listMyGroups(): Promise<MyGroupsResponse> {
  return (await apiClient.get<MyGroupsResponse>('/groups/me')).data;
}

export async function searchGroups(search: string, page = 1): Promise<GroupSearchResponse> {
  const params: Record<string, string | number> = { page };
  if (search.trim()) params.search = search.trim();
  return (await apiClient.get<GroupSearchResponse>('/groups', { params })).data;
}

export async function createGroup(input: { name: string; description?: string }): Promise<MyGroup> {
  return (await apiClient.post<MyGroup>('/groups', input)).data;
}

export async function getGroup(groupId: string): Promise<GroupDetails> {
  const group = (await apiClient.get<GroupDetails>(`/groups/${groupId}`)).data;
  return {
    ...group,
    admin: group.admin ? normalizeProfile(group.admin) : null,
    members: group.members?.map(normalizeProfile),
  };
}

export async function updateGroup(groupId: string, input: { name?: string; description?: string }) {
  return (await apiClient.patch(`/groups/${groupId}`, input)).data;
}

export async function getGroupRanking(groupId: string): Promise<GroupRanking> {
  const ranking = (await apiClient.get<GroupRanking>(`/groups/${groupId}/ranking`)).data;
  return { ...ranking, items: ranking.items.map(normalizeProfile) };
}

export async function listGroupPendingRequests(groupId: string): Promise<GroupPendingRequests> {
  const pending = (await apiClient.get<GroupPendingRequests>(`/groups/${groupId}/requests`)).data;
  const normalizeItem = (item: GroupPendingRequests['invites'][number]) => ({ ...item, user: normalizeProfile(item.user) });
  return { invites: pending.invites.map(normalizeItem), requests: pending.requests.map(normalizeItem) };
}

export async function inviteToGroup(groupId: string, username: string) {
  return (await apiClient.post(`/groups/${groupId}/invites`, { username })).data;
}

export async function requestToJoinGroup(groupId: string) {
  return (await apiClient.post(`/groups/${groupId}/requests`)).data;
}

export async function resolveGroupRequest(groupId: string, requestId: string, action: GroupRequestAction) {
  return (await apiClient.post(`/groups/${groupId}/requests/${requestId}/${action}`)).data;
}

export async function leaveGroup(groupId: string): Promise<{ groupDeleted: boolean; newAdminUserId: string | null }> {
  return (await apiClient.delete(`/groups/${groupId}/members/me`)).data;
}

export async function removeGroupMember(groupId: string, userId: string) {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
}

export async function listSpecialNotifications(limit = 20): Promise<SpecialNotificationsResponse> {
  return (await apiClient.get<SpecialNotificationsResponse>('/special-notifications', { params: { limit } })).data;
}

export async function markSpecialNotificationRead(id: string) {
  await apiClient.patch(`/special-notifications/${id}/read`);
}

export async function markAllSpecialNotificationsRead() {
  await apiClient.patch('/special-notifications/read-all');
}
