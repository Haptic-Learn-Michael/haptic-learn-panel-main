import { api } from './client';

export interface ProgressEntry {
  student_id: string;
  content_item_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
}

export interface ClassroomSummary {
  courses: { id: string; title: string }[];
  students: { student_id: string; users?: { id: string; full_name: string } }[];
  items: { id: string; course_id: string }[];
  progress: ProgressEntry[];
}

export interface StudentItemProgress {
  student_id: string;
  content_item_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  attempts: number;
  completed_at: string | null;
  content_items: {
    id: string;
    title: string;
    content_type: string;
    sort_order: number;
  };
}

export const getClassroomSummary = (classroomId: string) =>
  api.get<ClassroomSummary>(`/progress/classroom/${classroomId}/summary`);

export const getStudentProgressByCourse = (studentId: string, courseId: string) =>
  api.get<StudentItemProgress[]>(`/progress/student/${studentId}/course/${courseId}`);
