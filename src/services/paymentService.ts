import { api } from './api';
import type { PaymentPreference, PaymentSnapshot } from '../types/paymentType';

// Servicio de pagos (MercadoPago).
// El cliente `api` ya desenvuelve el envelope { data: ... } del backend,
// por lo que cada método retorna el payload tipado directamente.

export async function createDepositPreference(reservationId: number): Promise<PaymentPreference> {
  return api.post<PaymentPreference>(`/api/payments/deposit/${reservationId}`);
}

export async function createBalancePreference(reservationId: number): Promise<PaymentPreference> {
  return api.post<PaymentPreference>(`/api/payments/balance/${reservationId}`);
}

export async function checkPayment(reservationId: number): Promise<PaymentSnapshot> {
  return api.get<PaymentSnapshot>(`/api/payments/check/${reservationId}`);
}

export async function getPaymentStatus(reservationId: number): Promise<PaymentSnapshot> {
  return api.get<PaymentSnapshot>(`/api/payments/status/${reservationId}`);
}
