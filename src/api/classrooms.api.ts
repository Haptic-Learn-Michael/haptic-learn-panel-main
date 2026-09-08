import { api } from './client';
import type { Classroom, ClassroomEducator, ClassroomStudent } from '../types';

export const getClassrooms = () => api.get<Classroom[]>('/classrooms');

export const getClassroom = (id: string) =>
  api.get<Classroom>(`/classrooms/${id}`);

export const createClassroom = (data: { name: string; description?: string }) =>
  api.post<Classroom>('/classrooms', data);

export const updateClassroom = (
  id: string,
  data: { name?: string; description?: string },
) => api.patch<Classroom>(`/classrooms/${id}`, data);

export const deleteClassroom = (id: string) =>
  api.delete(`/classrooms/${id}`);

export const getClassroomEducators = (id: string) =>
  api.get<ClassroomEducator[]>(`/classrooms/${id}/educators`);

export const addEducator = (classroomId: string, educatorId: string) =>
  api.post(`/classrooms/${classroomId}/educators`, { educator_id: educatorId });

export const removeEducator = (classroomId: string, educatorId: string) =>
  api.delete(`/classrooms/${classroomId}/educators/${educatorId}`);

export const getClassroomStudents = (id: string) =>
  api.get<ClassroomStudent[]>(`/classrooms/${id}/students`);

export const enrollStudent = (classroomId: string, studentId: string) =>
  api.post(`/classrooms/${classroomId}/students`, { student_id: studentId });

export const removeStudent = (classroomId: string, studentId: string) =>
  api.delete(`/classrooms/${classroomId}/students/${studentId}`);
