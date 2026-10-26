export type UserRole = 'super_admin' | 'admin' | 'student';

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  require_password_change?: boolean;
}

export interface DeviceSession {
  id: number;
  session_token?: string;
  ip_address?: string;
  device_name: string;
  is_revoked?: boolean;
  last_activity_at?: string;
  last_active_at?: string;
  created_at?: string;
  user_name?: string;
  username?: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  price: string | number;
  level: string;
  is_published: number | boolean;
  instructor_name?: string;
  modules_count?: number;
  sections_count?: number;
  enrolled_count?: number;
  total_sections?: number;
  completed_sections?: number;
  progress_percentage?: number;
  is_course_unlocked?: boolean;
  modules?: Module[];
  sections?: Section[];
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order_index: number;
  sections?: Section[];
}

export type SectionWorkflowStatus = 
  | 'LOCKED' 
  | 'AVAILABLE' 
  | 'IN_PROGRESS' 
  | 'VIDEO_COMPLETED' 
  | 'PENDING_REVIEW' 
  | 'REVISION_REQUIRED' 
  | 'APPROVED'
  | 'REJECTED';

export interface Section {
  id: number;
  module_id: number;
  title: string;
  description?: string;
  learning_objectives?: string;
  order_index: number;
  is_free_preview: number | boolean;
  video_id?: number;
  video_duration_seconds?: number;
  duration_seconds?: number;
  assignment_id?: number;
  assignment_title?: string;
  assignment_instructions?: string;
  submission_type?: 'text' | 'file' | 'both';
  is_unlocked?: boolean;
  workflow_status?: SectionWorkflowStatus;
  progress?: VideoProgress;
  assignment?: Assignment;
  submission?: Submission;
}

export interface VideoProgress {
  id?: number;
  last_watched_position: number;
  watched_seconds: number;
  duration_seconds?: number;
  completion_percentage: number;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'VIDEO_COMPLETED';
  completed_at?: string | null;
}

export interface Assignment {
  id: number;
  section_id: number;
  title: string;
  description?: string;
  instructions: string;
  submission_type: 'text' | 'file' | 'both';
  allowed_file_types?: string;
  max_file_size_bytes?: number;
  deadline_days?: number;
}

export interface SubmissionAttachment {
  id: number;
  submission_id: number;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface ApprovalLog {
  id: number;
  submission_id: number;
  user_id: number;
  section_id: number;
  reviewer_name: string;
  decision: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED';
  remarks?: string;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  submission_text?: string;
  status: 'PENDING_REVIEW' | 'REVISION_REQUIRED' | 'APPROVED' | 'REJECTED';
  admin_feedback?: string;
  reviewed_by?: number;
  reviewer_name?: string;
  submitted_at: string;
  reviewed_at?: string;
  student_name?: string;
  student_username?: string;
  student_email?: string;
  section_title?: string;
  course_title?: string;
  attachments?: SubmissionAttachment[];
  history?: ApprovalLog[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number | boolean;
  created_at: string;
  data_json?: any;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_courses: number;
  published_courses: number;
  pending_approvals: number;
  completed_sections: number;
  students_active_24h: number;
  recent_submissions: any[];
  recent_logins: any[];
  recent_audit: any[];
}
