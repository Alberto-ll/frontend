import { api } from './api';
import type { Pitch } from '../types/pitchType';

export async function getAll(): Promise<Pitch[]> {
  return api.get<Pitch[]>('/api/pitchs/getAll');
}

export async function getOne(id: number | string): Promise<Pitch> {
  return api.get<Pitch>(`/api/pitchs/getOne/${id}`);
}

export async function getActive(
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: { signal?: AbortSignal }
): Promise<Pitch[]> {
  return api.get<Pitch[]>('/api/pitchs/getAllFromActiveBusinesses', params, options);
}

export async function getByBusiness(businessId: number | string): Promise<Pitch[]> {
  return api.get<Pitch[]>(`/api/pitchs/getByBusiness/${businessId}`);
}

export async function add(formData: FormData): Promise<Pitch> {
  return api.upload<Pitch>('/api/pitchs/add', formData, 'POST');
}

export async function update(id: number | string, payload: FormData | Record<string, unknown>): Promise<Pitch> {
  if (payload instanceof FormData) {
    return api.upload<Pitch>(`/api/pitchs/update/${id}`, payload, 'PATCH');
  }
  return api.patch<Pitch>(`/api/pitchs/update/${id}`, payload);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/pitchs/remove/${id}`);
}
