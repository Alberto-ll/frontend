export interface ApiError {
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field?: string;
  msg: string;
}

export { errorHandler } from '../utils/errorHandler';