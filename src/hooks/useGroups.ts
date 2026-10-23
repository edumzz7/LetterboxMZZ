import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGroup,
  getGroup,
  getGroupRanking,
  inviteToGroup,
  leaveGroup,
  listGroupPendingRequests,
  listMyGroups,
  removeGroupMember,
  requestToJoinGroup,
  resolveGroupRequest,
  searchGroups,
  updateGroup,
} from '../lib/groups';
import type { GroupRequestAction } from '../types/app';
import { SPECIAL_NOTIFICATIONS_QUERY_KEY } from './useSpecialNotifications';

export const GROUPS_QUERY_KEY = 'groups';

export function useMyGroups() {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, 'me'],
    queryFn: listMyGroups,
    staleTime: 30_000,
  });
}

export function useGroupSearch(search: string, page: number, enabled = true) {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, 'search', search.trim().toLowerCase(), page],
    queryFn: () => searchGroups(search, page),
    enabled,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, 'detail', groupId],
    queryFn: () => getGroup(groupId),
    staleTime: 15_000,
    retry: false,
  });
}

export function useGroupRanking(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, 'ranking', groupId],
    queryFn: () => getGroupRanking(groupId),
    enabled,
    staleTime: 30_000,
  });
}

export function useGroupPendingRequests(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, 'pending', groupId],
    queryFn: () => listGroupPendingRequests(groupId),
    enabled,
    staleTime: 15_000,
  });
}

/** Every group mutation can change "my groups", the group page and notifications. */
function useInvalidateGroups() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
    void queryClient.invalidateQueries({ queryKey: [SPECIAL_NOTIFICATIONS_QUERY_KEY] });
  };
}

export function useCreateGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) => createGroup(input),
    onSuccess: invalidate,
  });
}

export function useGroupActions(groupId: string) {
  const invalidate = useInvalidateGroups();
  const options = { onSuccess: invalidate };

  return {
    update: useMutation({
      mutationFn: (input: { name?: string; description?: string }) => updateGroup(groupId, input),
      ...options,
    }),
    invite: useMutation({
      mutationFn: (username: string) => inviteToGroup(groupId, username),
      ...options,
    }),
    requestToJoin: useMutation({
      mutationFn: () => requestToJoinGroup(groupId),
      ...options,
    }),
    resolve: useMutation({
      mutationFn: ({ requestId, action }: { requestId: string; action: GroupRequestAction }) =>
        resolveGroupRequest(groupId, requestId, action),
      ...options,
    }),
    leave: useMutation({
      mutationFn: () => leaveGroup(groupId),
      ...options,
    }),
    removeMember: useMutation({
      mutationFn: (userId: string) => removeGroupMember(groupId, userId),
      ...options,
    }),
  };
}
