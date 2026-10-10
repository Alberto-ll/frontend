import type { Category } from './categoryType';

export interface UserCategory extends Partial<Category> {
  id: number;
  name?: string;
  description?: string;
  usertype?: string;
}

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  categoryName?: string;
  category?: UserCategory;
  createdAt?: string;
  updatedAt?: string;
}
