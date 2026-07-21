import { api } from './api';

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  category?: number | { id: number; usertype?: string };
  createdAt?: string;
  updatedAt?: string;
}

export async function findAll(): Promise<User[]> {
  return api.get<User[]>('/api/users/findAll');
}

export async function findOne(id: number | string): Promise<User> {
  return api.get<User>(`/api/users/findOne/${id}`);
}

export async function add(data: Partial<User>): Promise<User> {
  return api.post<User>('/api/users/add', data);
}

export async function update(id: number | string, data: Partial<User>): Promise<User> {
  return api.put<User>(`/api/users/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/users/delete/${id}`);
}

export async function hasBusiness(id: number | string): Promise<{ response: boolean }> {
  return api.get<{ response: boolean }>(`/api/users/hasBusiness/${id}`);
}
