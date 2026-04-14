export interface Competition {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  status: "upcoming" | "completed";
  score?: number;
  rank?: number;
  thumbnail: string;
}

export const competitions: Competition[] = [
  {
    id: "comp1",
    title: "National Mathematics Olympiad",
    subject: "Mathematics",
    date: "2024-02-15",
    time: "10:00 AM",
    duration: "3 hours",
    participants: 1250,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
  },
  {
    id: "comp2",
    title: "Physics Challenge 2024",
    subject: "Physics",
    date: "2024-02-20",
    time: "2:00 PM",
    duration: "2 hours",
    participants: 890,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  },
  {
    id: "comp3",
    title: "Chemistry Quiz Competition",
    subject: "Chemistry",
    date: "2024-01-10",
    time: "11:00 AM",
    duration: "90 minutes",
    participants: 654,
    status: "completed",
    score: 87,
    rank: 23,
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
  },
  {
    id: "comp4",
    title: "Computer Science Hackathon",
    subject: "Computer Science",
    date: "2024-01-05",
    time: "9:00 AM",
    duration: "6 hours",
    participants: 2100,
    status: "completed",
    score: 92,
    rank: 15,
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  },
  {
    id: "comp5",
    title: "Literature Essay Contest",
    subject: "Literature",
    date: "2024-02-25",
    time: "1:00 PM",
    duration: "4 hours",
    participants: 456,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  },
];
