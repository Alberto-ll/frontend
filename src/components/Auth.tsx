import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { UserData } from '../types/userData';
import { getStoredAuthToken, getStoredUserData, readStoredAuthSession } from '../services/authSession';

export function useAuth() {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); 
  const navigate = useNavigate();
    
  const checkAuth = useCallback(() => {
    setIsLoading(true); 
    const session = readStoredAuthSession();

    if (!session) {
      setUserData(undefined);
      setToken(undefined);
      setIsLoading(false);
      return;
    }

    try {
      setUserData(getStoredUserData());
      setToken(getStoredAuthToken());
    } catch (error) {
      console.error('Error decodificando token:', error);
      localStorage.removeItem('user');
      setUserData(undefined);
      setToken(undefined);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  const hasRole = useCallback((roles: string[]): boolean => {
    if (!userData || !userData.category) return false;
    return roles.includes(userData.category);
  }, [userData]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    window.location.href = '/';
  }, []);

  const isAuthenticated = !!token;

  return { userData, token, isLoading, checkAuth, hasRole, isAuthenticated, logout };
}