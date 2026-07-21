import { api } from './api';

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name: string;
    category?: { usertype: string };
  };
}

export async function login(user: { email: string; password: string }): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/login', user, { auth: false });
}

export async function register(user: { name: string; surname: string; email: string; password: string; phoneNumber?: string }): Promise<void> {
  return api.post<void>('/api/users/register', user, { auth: false });
}
