import type { Locality } from "./localityType";
import type { UserData } from "./userData";

export type BusinessData = {
  id?: number;
  owner: UserData | number;
  businessName: string;
  address: string;
  averageRating: number; 
  reservationDepositPercentage:number,
  active:boolean;
  locality: Locality | number;
  openingAt:string;
  closingAt:string;
  activatedAt?: Date;
};