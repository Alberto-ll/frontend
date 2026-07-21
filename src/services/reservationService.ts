import { api } from './api';

interface Reservation {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status: string;
  user?: number | { id: number; name?: string };
  pitch?: number | { id: number };
  createdAt?: string;
}

export async function findAll(): Promise<Reservation[]> {
  return api.get<Reservation[]>('/api/reservations/findAll');
}

export async function findOne(id: number | string): Promise<Reservation> {
  return api.get<Reservation>(`/api/reservations/findOne/${id}`);
}

export async function findAllFromUser(userId: number | string): Promise<Reservation[]> {
  return api.get<Reservation[]>(`/api/reservations/findAllFromUser/${userId}`);
}

export async function findOccupiedSlotsByPitch(pitchId: number | string): Promise<Reservation[]> {
  return api.get<Reservation[]>(`/api/reservations/findOccupiedSlotsByPitch/${pitchId}`);
}

export async function findByBusiness(
  businessId: number | string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<Reservation[]> {
  return api.get<Reservation[]>(`/api/reservations/findByBusiness/${businessId}`, params);
}

export async function add(data: Partial<Reservation>): Promise<Reservation> {
  return api.post<Reservation>('/api/reservations/add', data);
}

export async function update(id: number | string, data: Partial<Reservation>): Promise<Reservation> {
  return api.put<Reservation>(`/api/reservations/update/${id}`, data);
}

export async function cancel(id: number | string): Promise<Reservation> {
  return api.put<Reservation>(`/api/reservations/cancel/${id}`);
}

export async function remove(id: number | string): Promise<void> {
  return api.del<void>(`/api/reservations/remove/${id}`);
}
