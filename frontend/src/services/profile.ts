/**
 * @file profile.ts
 * @description 用户档案服务模块，封装档案信息的查询、更新、统计和头像上传等 API 请求。
 */
import { api } from './api';
import type { Profile, ProfileStats } from '../types';

/** 获取用户档案信息（含用户基本信息和档案详情） */
export async function getProfile(): Promise<{ user: any; profile: Profile | null }> {
  return api.get('/profile');
}

/** 更新用户档案 */
export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  return api.put<Profile>('/profile', data);
}

/** 获取用户统计数据（梦境数、分析次数等） */
export async function getProfileStats(): Promise<ProfileStats> {
  return api.get<ProfileStats>('/profile/stats');
}

/** 上传用户头像（base64 格式） */
export async function uploadAvatar(avatar: string) {
  return api.put<{ id: string; avatar: string }>('/profile/avatar', { avatar });
}
