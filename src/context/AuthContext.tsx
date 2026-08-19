import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, verify any stored session against the backend
  // rather than trusting localStorage blindly.
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Confirm the token is still valid by hitting a protected route
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setToken(storedToken);
        setUser(res.data.user);
        // Keep localStorage in sync with the freshest server data
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } catch (err) {
        // Token invalid, expired, or server unreachable — clear stale session
        console.warn('Session invalid or server unreachable, logging out.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const loginUser = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};