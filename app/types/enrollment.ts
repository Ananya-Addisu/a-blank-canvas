export interface Bundle {
  id: string;
  name: string;
  description: string;
  semester: string;
  year_level: string;
  price: number;
  discount_percentage: number;
  thumbnail_url: string;
  is_active: boolean;
  home_category_id?: string;
  course_count?: number;
  courses?: Course[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  price: number;
  teacher_id: string;
  thumbnail_url?: string;
  status: string;
  sample_video_url?: string;
  sample_pdf_url?: string;
  syllabus?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id?: string;
  bundle_id?: string;
  enrollment_type: 'course' | 'bundle';
  status: 'pending' | 'approved' | 'rejected';
  payment_amount: number;
  created_at: string;
  updated_at: string;
  course?: Course;
  bundle?: Bundle;
  payment_submission?: PaymentSubmission;
}

export interface PaymentSubmission {
  id: string;
  enrollment_id: string;
  student_id: string;
  screenshot_urls: string[];
  payment_method: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface PaymentMethod {
  id: string;
  method_name: string;
  account_name: string;
  account_number: string;
  bank_name?: string;
  is_active: boolean;
}
