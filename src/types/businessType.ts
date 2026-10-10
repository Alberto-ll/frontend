import type { Locality } from "./localityType";
import type { User } from "./userType";

export type ScheduleItem = {
  day: number;
  open: string | null;
  close: string | null;
};

export type BusinessOwner =
  | number
  | User
  | { id: number; name?: string; email?: string };
export type BusinessLocality =
  | number
  | Locality
  | { id: number; name?: string };

export interface Business {
  id: number;
  businessName: string;
  name?: string;
  address: string;
  averageRating: number;
  reservationDepositPercentage: number;
  active: boolean;
  activatedAt?: Date | string;
  schedule: ScheduleItem[];
  locality: BusinessLocality;
  owner?: BusinessOwner;
}

export type BusinessData = Business;
