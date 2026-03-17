export type BusinessData = {
  id?: number;
  owner:number | undefined;
  businessName: string;
  address: string;
  averageRating: number; 
  reservationDepositPercentage:number,
  active:boolean;
  locality:number;
  openingAt:string;
  closingAt:string;
  activatedAt?: Date;
};