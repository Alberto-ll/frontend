import { api } from './api';

interface UserCoupon {
  id: number;
  user: number | { id: number; name?: string };
  coupon: number | { id: number; discount?: number };
  assignedAt: string;
  status: string;
}

export async function getAll(): Promise<UserCoupon[]> {
  return api.get<UserCoupon[]>('/api/user-coupons/getAll');
}

export async function getOne(id: number | string): Promise<UserCoupon> {
  return api.get<UserCoupon>(`/api/user-coupons/getOne/${id}`);
}

export async function findByUser(userId: number | string): Promise<UserCoupon[]> {
  return api.get<UserCoupon[]>(`/api/user-coupons/user/${userId}`);
}

export async function assign(userId: number | string, couponId: number | string): Promise<UserCoupon> {
  return api.post<UserCoupon>('/api/user-coupons/assign', { userId, couponId });
}

export async function updateStatus(id: number | string, status: string): Promise<UserCoupon> {
  return api.patch<UserCoupon>(`/api/user-coupons/updateStatus/${id}`, { status });
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/user-coupons/remove/${id}`);
}
