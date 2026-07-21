export type BusinessData = {
  id: number;
  owner: number | { id: number; name?: string } | undefined;
  businessName: string;
  address: string;
  averageRating: number; 
  reservationDepositPercentage: number;
  active: boolean;
  locality: number | { id: number; name?: string };
  openingAt: string;
  closingAt: string;
};