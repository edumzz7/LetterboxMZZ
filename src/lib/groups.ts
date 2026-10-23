import apiClient from './apiClient';
import type {
  GroupDetails,
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
  return (await apiClient.get<GroupDetails>(`/groups/${groupId}`)).data;
}

export async function updateGroup(groupId: string, input: { name?: string; description?: string }) {
  return (await apiClient.patch(`/groups/${groupId}`, input)).data;
}

export async function getGroupRanking(groupId: string): Promise<GroupRanking> {
  return (await apiClient.get<GroupRanking>(`/groups/${groupId}/ranking`)).data;
}

export async function listGroupPendingRequests(groupId: string): Promise<GroupPendingRequests> {
  return (await apiClient.get<GroupPendingRequests>(`/groups/${groupId}/requests`)).data;
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
