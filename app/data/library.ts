export interface LibraryItem {
  id: string;
  title: string;
  type: "book" | "exam" | "reference";
  subject: string;
  author?: string;
  pages?: number;
  thumbnail: string;
  description: string;
  isDownloaded?: boolean;
}

export const libraryItems: LibraryItem[] = [
  {
    id: "b1",
    title: "Calculus: Early Transcendentals",
    type: "book",
    subject: "Mathematics",
    author: "James Stewart",
    pages: 1368,
    thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    description: "Comprehensive calculus textbook covering limits, derivatives, and integrals.",
    isDownloaded: true,
  },
  {
    id: "b2",
    title: "Physics for Scientists",
    type: "book",
    subject: "Physics",
    author: "Raymond Serway",
    pages: 1024,
    thumbnail: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80",
    description: "Essential physics concepts for science and engineering students.",
    isDownloaded: false,
  },
  {
    id: "e1",
    title: "Mathematics Final Exam 2023",
    type: "exam",
    subject: "Mathematics",
    pages: 12,
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    description: "Previous year's final examination with solutions.",
    isDownloaded: true,
  },
  {
    id: "e2",
    title: "Physics Midterm Practice",
    type: "exam",
    subject: "Physics",
    pages: 8,
    thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
    description: "Practice questions for midterm preparation.",
    isDownloaded: false,
  },
  {
    id: "r1",
    title: "Chemistry Quick Reference",
    type: "reference",
    subject: "Chemistry",
    pages: 24,
    thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    description: "Essential formulas and periodic table reference.",
    isDownloaded: true,
  },
  {
    id: "r2",
    title: "Programming Language Guide",
    type: "reference",
    subject: "Computer Science",
    pages: 156,
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    description: "Comprehensive guide to modern programming languages.",
    isDownloaded: false,
  },
  {
    id: "b3",
    title: "Organic Chemistry Principles",
    type: "book",
    subject: "Chemistry",
    author: "Paula Bruice",
    pages: 1248,
    thumbnail: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
    description: "In-depth exploration of organic chemistry concepts.",
    isDownloaded: false,
  },
  {
    id: "b4",
    title: "World History: A Global Perspective",
    type: "book",
    subject: "History",
    author: "Howard Spodek",
    pages: 896,
    thumbnail: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
    description: "Comprehensive overview of world historical events.",
    isDownloaded: true,
  },
];

export const libraryCategories = ["All", "Books", "Exams", "References"];
