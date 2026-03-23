import { useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';
import { AuthContext } from './authContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    localStorage.setItem('token', result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
