import { api } from './client';
import type { School, SchoolEducator, Classroom } from '../types';

export interface CreateSchoolPayload {
  name: string;
  lead_educator_ids?: string[];
}

export interface UpdateSchoolPayload {
  name?: string;
  is_active?: boolean;
}

export interface AddSchoolLeadPayload {
  user_id: string;
}

export interface CreateSchoolEducatorPayload {
  full_name: string;
  email: string;
  password: string;
}

export const getSchools = () => api.get<School[]>('/schools');

export const getSchool = (id: string) => api.get<School>(`/schools/${id}`);

export const createSchool = (payload: CreateSchoolPayload) =>
  api.post<School>('/schools', payload);

export const updateSchool = (id: string, payload: UpdateSchoolPayload) =>
  api.patch<School>(`/schools/${id}`, payload);

export const deleteSchool = (id: string) => api.delete(`/schools/${id}`);

export const addSchoolLead = (schoolId: string, payload: AddSchoolLeadPayload) =>
  api.post<School>(`/schools/${schoolId}/leads`, payload);

export const removeSchoolLead = (schoolId: string, userId: string) =>
  api.delete(`/schools/${schoolId}/leads/${userId}`);

export const getSchoolEducators = (schoolId: string) =>
  api.get<SchoolEducator[]>(`/schools/${schoolId}/educators`);

export const createSchoolEducator = (
  schoolId: string,
  payload: CreateSchoolEducatorPayload,
) => api.post<SchoolEducator>(`/schools/${schoolId}/educators`, payload);

export const getSchoolClassrooms = (schoolId: string) =>
  api.get<Classroom[]>(`/schools/${schoolId}/classrooms`);
