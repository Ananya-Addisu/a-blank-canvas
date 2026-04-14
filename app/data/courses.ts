export interface Course {
  id: string;
  title: string;
  category: string;
  semester: string;
  semesterPart?: string;
  instructor: string;
  duration: string;
  lessons: number;
  students?: number;
  rating?: number;
  price?: number;
  progress?: number;
  thumbnail: string;
  description: string;
  isPurchased?: boolean;
  featured?: boolean;
  isNew?: boolean;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted?: boolean;
}

export const courses: Course[] = [
  {
    id: "1",
    title: "Logic & Critical Thinking",
    category: "Foundation",
    semester: "Freshman",
    semesterPart: "1st Semester",
    instructor: "Dr. Samuel Bekele",
    duration: "8 weeks",
    lessons: 24,
    students: 1234,
    rating: 4.8,
    price: 899,
    progress: 0,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description: "Develop essential reasoning and analytical skills for academic success.",
    isPurchased: false,
    featured: true,
    isNew: true,
    chapters: [
      {
        id: "c1",
        title: "Introduction to Logic",
        lessons: [
          { id: "l1", title: "What is Logic?", duration: "15 min", isCompleted: false },
          { id: "l2", title: "Types of Reasoning", duration: "20 min", isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Physics",
    category: "Science",
    semester: "Freshman",
    semesterPart: "1st Semester",
    instructor: "Prof. Alemayehu Tadesse",
    duration: "12 weeks",
    lessons: 40,
    students: 2156,
    rating: 4.8,
    price: 1049,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description: "Explore fundamental principles of physics including mechanics and thermodynamics.",
    isPurchased: false,
    featured: true,
    chapters: [],
  },
  {
    id: "3",
    title: "Chemistry",
    category: "Science",
    semester: "Freshman",
    semesterPart: "1st Semester",
    instructor: "Dr. Hanna Gebre",
    duration: "10 weeks",
    lessons: 32,
    price: 989,
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    description: "Master fundamentals of chemistry including atomic structure and reactions.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "4",
    title: "Mathematics I",
    category: "Foundation",
    semester: "Freshman",
    semesterPart: "2nd Semester",
    instructor: "Prof. Yohannes Assefa",
    duration: "14 weeks",
    lessons: 48,
    price: 799,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description: "Build a strong mathematical foundation with algebra and calculus.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "5",
    title: "Introduction to Programming",
    category: "Technology",
    semester: "2nd Year",
    instructor: "Eng. Dawit Tesfaye",
    duration: "16 weeks",
    lessons: 56,
    price: 1299,
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    description: "Learn programming fundamentals using Python.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "6",
    title: "Engineering Mechanics",
    category: "Engineering",
    semester: "2nd Year",
    semesterPart: "1st Semester",
    instructor: "Dr. Mulugeta Haile",
    duration: "12 weeks",
    lessons: 36,
    price: 1199,
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    description: "Study statics and dynamics with practical applications.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "7",
    title: "Biology",
    category: "Science",
    semester: "Freshman",
    semesterPart: "1st Semester",
    instructor: "Dr. Sara Mengistu",
    duration: "10 weeks",
    lessons: 35,
    price: 949,
    thumbnail: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
    description: "Explore the fundamentals of life sciences and cellular biology.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "8",
    title: "English Composition",
    category: "Foundation",
    semester: "Freshman",
    semesterPart: "2nd Semester",
    instructor: "Prof. John Smith",
    duration: "8 weeks",
    lessons: 28,
    price: 699,
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    description: "Improve your academic writing and communication skills.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "9",
    title: "Statistics",
    category: "Mathematics",
    semester: "Freshman",
    semesterPart: "2nd Semester",
    instructor: "Dr. Bethlehem Kidane",
    duration: "10 weeks",
    lessons: 30,
    price: 849,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    description: "Learn statistical analysis and data interpretation.",
    isPurchased: false,
    chapters: [],
  },
  {
    id: "10",
    title: "Data Structures",
    category: "Technology",
    semester: "2nd Year",
    semesterPart: "1st Semester",
    instructor: "Eng. Michael Assefa",
    duration: "14 weeks",
    lessons: 42,
    price: 1399,
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    description: "Master fundamental data structures and algorithms.",
    isPurchased: false,
    chapters: [],
  },
];

export const categories = ["All", "Foundation", "Science", "Technology", "Engineering", "Mathematics"];

export const semesters = ["All Semesters", "Freshman", "2nd Year", "3rd Year", "Masters"];
