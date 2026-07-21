import { api } from './api';

interface Category {
  id: number;
  description: string;
  usertype: string;
}

export async function getAll(): Promise<Category[]> {
  return api.get<Category[]>('/api/category/getAll');
}

export async function getOne(id: number | string): Promise<Category> {
  return api.get<Category>(`/api/category/getOne/${id}`);
}

export async function add(data: Partial<Category>): Promise<Category> {
  return api.post<Category>('/api/category/add', data);
}

export async function update(id: number | string, data: Partial<Category>): Promise<Category> {
  return api.patch<Category>(`/api/category/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/category/remove/${id}`);
}
