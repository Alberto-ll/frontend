// Types for the Reserve Pitch feature
import type { Pitch, PitchBusiness } from './pitchType';

export type { PitchBusiness };

/**
 * @deprecated Use Pitch from pitchType instead
 */
export type ReservePitch = Pitch;

export interface ReservePitchFilters {
  roof: 'all' | 'covered' | 'uncovered';
  size: string;
  groundType: string;
  priceMin: number;
  priceMax: number;
  searchTerm: string;
}

export interface ReservationFormData {
  pitchId: number;
  date: string;
  time: string;
}

export interface ReservationRequest {
  ReservationDate: string | Date;
  ReservationTime: string | Date;
  pitch: number;
  user: number;
}
