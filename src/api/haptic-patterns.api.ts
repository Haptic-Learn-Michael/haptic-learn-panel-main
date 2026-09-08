import { api } from './client';
import type { HapticPattern } from '../types';

export const getPatterns = () => api.get<HapticPattern[]>('/haptic-patterns');

export const getPatternsByCategory = (category: string) =>
  api.get<HapticPattern[]>(`/haptic-patterns/category/${category}`);

export const createPattern = (data: Omit<HapticPattern, 'id' | 'created_at'>) =>
  api.post<HapticPattern>('/haptic-patterns', data);

export const updatePattern = (
  id: string,
  data: Partial<Omit<HapticPattern, 'id' | 'created_at'>>,
) => api.patch<HapticPattern>(`/haptic-patterns/${id}`, data);

export const deletePattern = (id: string) =>
  api.delete(`/haptic-patterns/${id}`);
