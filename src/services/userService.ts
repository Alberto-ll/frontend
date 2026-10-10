import { api } from './api';

import type { User } from '../types/userType';

export async function findAll(): Promise<User[]> {
  return api.get<User[]>('/api/users/findAll');
}

export async function findOne(id: number | string): Promise<User> {
  return api.get<User>(`/api/users/findOne/${id}`);
}

export async function add(data: Partial<User> | Record<string, unknown>): Promise<User> {
  return api.post<User>('/api/users/add', data);
}

export async function update(id: number | string, data: Partial<User> | Record<string, unknown>): Promise<User> {
  return api.put<User>(`/api/users/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/users/delete/${id}`);
}

export async function hasBusiness(id: number | string): Promise<{ hasBusiness: boolean }> {
  return api.get<{ hasBusiness: boolean }>(`/api/users/hasBusiness/${id}`);
}
