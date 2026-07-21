import { api } from './api';

interface Coupon {
  id: number;
  discount: number;
  expiringDate: string;
  status: string;
}

export async function getAll(): Promise<Coupon[]> {
  return api.get<Coupon[]>('/api/coupons/getAll');
}

export async function getOne(id: number | string): Promise<Coupon> {
  return api.get<Coupon>(`/api/coupons/getOne/${id}`);
}

export async function add(data: Partial<Coupon>): Promise<Coupon> {
  return api.post<Coupon>('/api/coupons/add', data);
}

export async function update(id: number | string, data: Partial<Coupon>): Promise<Coupon> {
  return api.patch<Coupon>(`/api/coupons/update/${id}`, data);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/coupons/remove/${id}`);
}
