import { api } from './client';
import type { LoginResponse } from '../types';

export const login = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password });

export const logout = () => api.post('/auth/logout');

export const forgotPassword = (email: string, redirectTo: string) =>
  api.post('/auth/forgot-password', { email, redirect_to: redirectTo });

export const resetPassword = (accessToken: string, password: string) =>
  api.post('/auth/reset-password', { access_token: accessToken, password });
