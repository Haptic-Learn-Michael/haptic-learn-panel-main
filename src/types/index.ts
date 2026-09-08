export type UserRole = 'admin' | 'lead_educator' | 'educator' | 'student';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface SchoolLead {
  user_id: string;
  added_at: string;
  users?: { id: string; full_name: string; email: string };
}

export interface School {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  school_leads?: SchoolLead[];
}

export interface SchoolEducator {
  id: string;
  school_id: string;
  educator_id: string;
  added_at: string;
  users?: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  qr_code?: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  code: string;
  lead_educator_id: string;
  created_at: string;
  lead_educator?: { full_name: string; email: string };
}

export interface ClassroomEducator {
  educator_id: string;
  classroom_id: string;
  assigned_at: string;
  users?: { id: string; email: string; full_name: string; role: string; status?: string };
}

export interface ClassroomStudent {
  student_id: string;
  classroom_id: string;
  enrolled_at: string;
  users?: { id: string; email: string; full_name: string; status: string; qr_code?: string };
}

export interface HapticPattern {
  id: string;
  pattern_key: string;
  name: string;
  description?: string;
  category: string;
  pattern_data: unknown;
  created_at: string;
}

export interface Course {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  is_published: boolean;
  educator_id: string;
  created_at: string;
}

export interface CourseWithEducator extends Course {
  users?: { id: string; full_name: string };
}

export type ContentType = 'braille' | 'letter' | 'number' | 'quiz_mc' | 'quiz_voice';

export interface ContentItem {
  id: string;
  course_id: string;
  content_type: ContentType;
  title: string;
  point_map?: Array<{ x: number; y: number; active: boolean }>;
  haptic_pattern_id?: string;
  talkback_text?: string;
  sort_order: number;
  created_by: string;
  haptic_patterns?: { id: string; pattern_key: string; name: string };
}
