import { jwtDecode } from 'jwt-decode';
import type { UserData } from '../types/userData';

export interface StoredAuthSession {
  token: string;
  user?: Omit<Partial<UserData>, 'category'> & { category?: string | { usertype?: string } };
}

export function readStoredAuthSession(): StoredAuthSession | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;
    if (typeof parsed.token === 'string' && parsed.token) {
      return { token: parsed.token, user: parsed.user };
    }
  } catch {
    if (raw) {
      return { token: raw };
    }
  }

  return null;
}

export function getStoredAuthToken(): string | undefined {
  return readStoredAuthSession()?.token;
}

export function getStoredUserData(): UserData | undefined {
  const session = readStoredAuthSession();
  if (!session) return undefined;

  if (session.user) {
    const category = session.user.category;
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      password: '',
      name: session.user.name,
      surname: session.user.surname,
      phoneNumber: session.user.phoneNumber,
      category: typeof category === 'string' ? category : category?.usertype,
      exp: session.user.exp,
    };
  }

  try {
    return jwtDecode<UserData>(session.token);
  } catch {
    return undefined;
  }
}
