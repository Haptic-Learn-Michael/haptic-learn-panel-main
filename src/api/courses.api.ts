import { api } from './client';
import type { ContentItem, CourseWithEducator } from '../types';

export const getCoursesByClassroom = (classroomId: string) =>
  api.get<CourseWithEducator[]>(`/courses/classroom/${classroomId}`);

export const getContentItemsByCourse = (courseId: string) =>
  api.get<ContentItem[]>(`/content-items/course/${courseId}`);
