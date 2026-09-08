import { api } from './client';
import type { User, UserRole, UserStatus } from '../types';

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
}

export const getUsers = () => api.get<User[]>('/users');

export const createUser = (payload: CreateUserPayload) =>
  api.post<User>('/users', payload);

export const updateUserStatus = (id: string, status: UserStatus) =>
  api.patch<User>(`/users/${id}/status`, { status });
