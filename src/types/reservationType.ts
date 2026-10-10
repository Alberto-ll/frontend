import type { Pitch } from "./pitchType";
import type { UserData } from "./userData";

export type Reservation = {
  id: number;
  ReservationDate: string;
  ReservationTime: string;
  status?: string;
  pitchRating?: number;
  pitch: Pitch; 
  user: UserData;
};