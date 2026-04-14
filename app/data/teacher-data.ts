export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  students: number;
  lessons: number;
  rating: number;
  price: number;
  status: 'active' | 'draft';
  image: string;
}

export interface Student {
  id: string;
  name: string;
  initials: string;
  course: string;
  progress: number;
  bgColor: string;
}

export interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  attempts: number;
  average: number;
  status: 'active' | 'draft';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  course: string;
  amount: number;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  duration?: string;
}

export const teacherCourses: TeacherCourse[] = [
  {
    id: '1',
    title: 'Logic & Critical Thinking',
    description: 'Master the fundamentals of logical reasoning and critical analysis',
    students: 2456,
    lessons: 42,
    rating: 4.9,
    price: 899,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
  },
  {
    id: '2',
    title: 'Introduction to Philosophy',
    description: 'Explore fundamental questions about existence, knowledge, and ethics',
    students: 1823,
    lessons: 38,
    rating: 4.8,
    price: 799,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80'
  }
];

export const students: Student[] = [
  {
    id: '1',
    name: 'Abebe Bikila',
    initials: 'AB',
    course: 'Logic & Critical Thinking',
    progress: 75,
    bgColor: '#4169E1'
  },
  {
    id: '2',
    name: 'Tigist Girma',
    initials: 'TG',
    course: 'Logic & Critical Thinking',
    progress: 60,
    bgColor: '#4169E1'
  },
  {
    id: '3',
    name: 'Kebede Mulugeta',
    initials: 'KM',
    course: 'Introduction to Philosophy',
    progress: 45,
    bgColor: '#4169E1'
  }
];

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: 'Chapter 1 Quiz',
    course: 'Logic & Critical Thinking',
    questions: 10,
    attempts: 456,
    average: 8.2,
    status: 'active'
  },
  {
    id: '2',
    title: 'Mid-term Exam',
    course: 'Logic & Critical Thinking',
    questions: 30,
    attempts: 234,
    average: 24,
    status: 'active'
  }
];

export const transactions: Transaction[] = [
  {
    id: '1',
    date: 'Dec 11, 2025',
    description: 'Course Sale',
    course: 'Logic & Critical Thinking',
    amount: 899
  },
  {
    id: '2',
    date: 'Dec 11, 2025',
    description: 'Course Sale',
    course: 'Introduction to Philosophy',
    amount: 799
  },
  {
    id: '3',
    date: 'Dec 10, 2025',
    description: 'Course Sale',
    course: 'Logic & Critical Thinking',
    amount: 899
  }
];

export const courseChapters: Chapter[] = [
  {
    id: '1',
    title: 'Chapter 1: Introduction to Logic',
    lessons: [
      { id: '1-1', title: 'What is Logic?', type: 'video', duration: '15:30' },
      { id: '1-2', title: 'History of Logic', type: 'video', duration: '20:15' },
      { id: '1-3', title: 'Reading Material', type: 'pdf' }
    ]
  },
  {
    id: '2',
    title: 'Chapter 2: Deductive Reasoning',
    lessons: [
      { id: '2-1', title: 'Introduction to Deduction', type: 'video', duration: '18:45' },
      { id: '2-2', title: 'Practice Problems', type: 'pdf' }
    ]
  }
];
