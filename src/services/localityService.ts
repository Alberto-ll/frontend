import { api } from './api';

interface Locality {
  id: number;
  name: string;
  postal_code: number;
  province: string;
}

export async function getAll(): Promise<Locality[]> {
  return api.get<Locality[]>('/api/localities/getAll');
}

export async function getOne(id: number | string): Promise<Locality> {
  return api.get<Locality>(`/api/localities/getOne/${id}`);
}

export async function add(data: Partial<Locality>): Promise<Locality> {
  return api.post<Locality>('/api/localities/add', data);
}

export async function update(id: number | string, data: Partial<Locality>): Promise<Locality> {
  return api.patch<Locality>(`/api/localities/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/localities/remove/${id}`);
}
