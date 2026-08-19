import api from './axios';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const registerPatient = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
};