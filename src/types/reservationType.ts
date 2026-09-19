import type { Pitch } from "./pitchType.ts";
import type { UserData } from "./userData.ts";

export type Reservation = {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status?: string;
  pitchRating?: number;
  pitch: Pitch; 
  user: UserData;
};