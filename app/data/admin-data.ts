export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  academicYear: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: string;
  qualifications: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PendingUpload {
  id: string;
  teacherName: string;
  contentType: string;
  title: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Course {
  id: string;
  name: string;
  teacher: string;
  category: string;
  department: string;
  price: number;
  thumbnail: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  registeredCount: number;
  status: 'upcoming' | 'completed';
}

export interface LibraryTab {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  user: string;
  course: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Abebe Bikila',
    email: 'abebe.bikila@example.com',
    phone: '+251912345678',
    institution: 'Addis Ababa University',
    academicYear: '3rd Year',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Tigist Girma',
    email: 'tigist.girma@example.com',
    phone: '+251923456789',
    institution: 'Jimma University',
    academicYear: '2nd Year',
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Kebede Mulugeta',
    email: 'kebede.m@example.com',
    phone: '+251934567890',
    institution: 'Bahir Dar University',
    academicYear: '4th Year',
    status: 'active',
    createdAt: '2024-01-25',
  },
];

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Solomon Tesfaye',
    email: 'solomon.t@example.com',
    phone: '+251911223344',
    subject: 'Mathematics',
    experience: '10 years',
    qualifications: 'PhD in Mathematics',
    status: 'active',
    createdAt: '2023-12-01',
  },
  {
    id: '2',
    name: 'Dr. Marta Haile',
    email: 'marta.h@example.com',
    phone: '+251922334455',
    subject: 'Physics',
    experience: '8 years',
    qualifications: 'PhD in Physics',
    status: 'active',
    createdAt: '2023-12-15',
  },
];

export const pendingUploads: PendingUpload[] = [
  {
    id: '1',
    teacherName: 'Dr. Solomon Tesfaye',
    contentType: 'Course Material',
    title: 'Advanced Calculus Notes',
    uploadedAt: '2024-03-10',
    status: 'pending',
  },
  {
    id: '2',
    teacherName: 'Dr. Marta Haile',
    contentType: 'Video Lecture',
    title: 'Quantum Mechanics Introduction',
    uploadedAt: '2024-03-11',
    status: 'pending',
  },
];

export const adminCourses: Course[] = [
  {
    id: '1',
    name: 'Logic & Critical Thinking',
    teacher: 'Dr. Solomon Tesfaye',
    category: 'Philosophy',
    department: 'Humanities',
    price: 899,
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    description: 'Introduction to logic and critical thinking',
    status: 'active',
  },
  {
    id: '2',
    name: 'Physics',
    teacher: 'Dr. Marta Haile',
    category: 'Science',
    department: 'Natural Sciences',
    price: 1049,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    description: 'General physics fundamentals',
    status: 'active',
  },
  {
    id: '3',
    name: 'Applied Math II',
    teacher: 'Dr. Solomon Tesfaye',
    category: 'Mathematics',
    department: 'Mathematics',
    price: 1109,
    thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400',
    description: 'Advanced applied mathematics',
    status: 'active',
  },
];

export const competitions: Competition[] = [
  {
    id: '1',
    title: 'National Math Olympiad 2024',
    description: 'Annual mathematics competition for university students',
    date: '2024-04-15',
    time: '10:00 AM',
    duration: 120,
    maxParticipants: 100,
    registeredCount: 45,
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Physics Challenge 2024',
    description: 'Test your physics knowledge',
    date: '2024-03-01',
    time: '2:00 PM',
    duration: 90,
    maxParticipants: 50,
    registeredCount: 50,
    status: 'completed',
  },
];

export const libraryTabs: LibraryTab[] = [
  {
    id: '1',
    name: 'Books',
    description: 'Academic books and textbooks',
    icon: 'Book',
    itemCount: 245,
    status: 'active',
  },
  {
    id: '2',
    name: 'Mid Exams',
    description: 'Past mid-term examinations',
    icon: 'FileText',
    itemCount: 89,
    status: 'active',
  },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    user: 'Abebe Bikila',
    course: 'Logic & Critical Thinking',
    amount: 899,
    method: 'Telebirr',
    status: 'completed',
    date: '2024-03-10',
  },
  {
    id: '2',
    user: 'Tigist Girma',
    course: 'Physics',
    amount: 1049,
    method: 'CBE Birr',
    status: 'completed',
    date: '2024-03-11',
  },
  {
    id: '3',
    user: 'Kebede Mulugeta',
    course: 'Applied Math II',
    amount: 1109,
    method: 'Telebirr',
    status: 'completed',
    date: '2024-03-12',
  },
];
