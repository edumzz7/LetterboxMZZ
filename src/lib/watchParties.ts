import apiClient from './apiClient';
import type { CreateWatchPartyInput, WatchParty, WatchPartyMediaType } from '../types/app';

export async function listWatchParties(): Promise<WatchParty[]> {
  return (await apiClient.get<WatchParty[]>('/watchparties')).data;
}

export async function listActiveWatchParties(mediaType: WatchPartyMediaType, providerExternalId: string): Promise<WatchParty[]> {
  return (await apiClient.get<WatchParty[]>('/watchparties/active', { params: { mediaType, providerExternalId } })).data;
}

export async function createWatchParty(input: CreateWatchPartyInput): Promise<WatchParty> {
  return (await apiClient.post<WatchParty>('/watchparties', input)).data;
}

export async function updateWatchPartyProgress(id: string, season: number, episode: number, isRetroactive = false): Promise<WatchParty> {
  return (await apiClient.patch<WatchParty>(`/watchparties/${id}/progress`, { season, episode, isRetroactive })).data;
}

export async function completeWatchParty(id: string, isRetroactive = false): Promise<WatchParty> {
  return (await apiClient.patch<WatchParty>(`/watchparties/${id}/complete`, { isRetroactive })).data;
}
