export type PaymentType = 'deposit' | 'balance';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Payment {
  id: number;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  preferenceId?: string;
  paymentId?: string;
  statusDetail?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPreference {
  init_point: string;
  sandbox_init_point?: string;
  preference_id: string;
  payment_id: number;
  reused: boolean;
}

export interface PaymentSnapshotReservation {
  id: number;
  status: string;
  ReservationDate: string;
  ReservationTime: string;
  pitchId: number;
  totalAmount: number;
  depositAmount: number;
  paymentExpiresAt?: string;
}

export interface PaymentSnapshot {
  reservation: PaymentSnapshotReservation;
  payments: Payment[];
}
