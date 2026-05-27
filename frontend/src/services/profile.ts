import { api } from './api';
import type { Profile, ProfileStats } from '../types';

export async function getProfile(): Promise<{ user: any; profile: Profile | null }> {
  return api.get('/profile');
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  return api.put<Profile>('/profile', data);
}

export async function getProfileStats(): Promise<ProfileStats> {
  return api.get<ProfileStats>('/profile/stats');
}
