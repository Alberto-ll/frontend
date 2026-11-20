import type { Pitch } from "./pitchType";
import type { UserData } from "./userData";
import type { Payment } from "./paymentType";

export type Reservation = {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status?: string;
  pitchRating?: number;
  paymentExpiresAt?: string;
  totalAmount?: number;
  depositAmount?: number;
  payments?: Payment[];
  createdAt?: string;
  pitch: Pitch; 
  user: UserData;
};
