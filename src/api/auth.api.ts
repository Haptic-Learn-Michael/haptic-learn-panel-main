import { api } from './client';
import type { LoginResponse } from '../types';

export const login = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password });

export const logout = () => api.post('/auth/logout');
