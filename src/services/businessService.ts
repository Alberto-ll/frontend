import { api } from './api';
import type { BusinessData } from '../types/businessType';

export async function findAll(): Promise<BusinessData[]> {
  return api.get<BusinessData[]>('/api/business/findAll');
}

export async function findOne(id: number | string): Promise<BusinessData> {
  return api.get<BusinessData>(`/api/business/findOne/${id}`);
}

export async function findInactive(): Promise<BusinessData[]> {
  return api.get<BusinessData[]>('/api/business/findInactive');
}

export async function findByOwnerId(ownerId: number | string): Promise<BusinessData> {
  return api.get<BusinessData>(`/api/business/findByOwnerId/${ownerId}`);
}

export async function add(data: Partial<BusinessData>): Promise<BusinessData> {
  return api.post<BusinessData>('/api/business/add', data);
}

export async function update(id: number | string, data: Partial<BusinessData>): Promise<BusinessData> {
  return api.put<BusinessData>(`/api/business/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/business/remove/${id}`);
}

export async function activate(id: number | string): Promise<BusinessData> {
  return api.put<BusinessData>(`/api/business/activate/${id}`);
}
