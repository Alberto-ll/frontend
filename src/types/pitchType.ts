import type { BusinessData } from './businessType';
import type { Reservation } from './reservationType';

export interface PitchBusiness {
  id: number;
  businessName: string;
}

export type Pitch = {
  id: number;
  rating: number;
  size: string;
  groundType: string;
  roof: boolean;
  price: number;
  business?: BusinessData | PitchBusiness | number;
  imageUrl?: string;
  driveFileId?: string;
  createdAt: string | number | Date;
  updatedAt?: string | number | Date;
  reservations?: Reservation[];
};