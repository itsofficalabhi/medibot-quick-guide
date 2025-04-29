export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewCount: number;
  availability: {
    days: string[];
    hours: string;
  };
  education: string[];
  languages: string[];
  about: string;
  profileImage: string;
  consultationFee: number;
  phone: string;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    experience: 12,
    rating: 4.9,
    reviewCount: 124,
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Friday"],
      hours: "9:00 AM - 5:00 PM"
    },
    education: [
      "MD, Harvard Medical School",
      "Residency, Massachusetts General Hospital"
    ],
    languages: ["English", "Spanish"],
    about: "Dr. Johnson is a board-certified physician with over 12 years of experience in general medicine. She specializes in preventive care and chronic disease management.",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    consultationFee: 80,
    phone: "14155552671"
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    experience: 15,
    rating: 4.8,
    reviewCount: 98,
    availability: {
      days: ["Monday", "Thursday", "Friday"],
      hours: "10:00 AM - 6:00 PM"
    },
    education: [
      "MD, Johns Hopkins University",
      "Cardiology Fellowship, Cleveland Clinic"
    ],
    languages: ["English", "Mandarin"],
    about: "Dr. Chen is a cardiologist with extensive experience in diagnosing and treating heart conditions. He is passionate about preventive cardiology and helping patients maintain heart health.",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    consultationFee: 120,
    phone: "14155552672"
  },
  {
    id: "3",
    name: "Dr. Amanda Rodriguez",
    specialty: "Pediatrics",
    experience: 8,
    rating: 4.9,
    reviewCount: 156,
    availability: {
      days: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
      hours: "8:00 AM - 4:00 PM"
    },
    education: [
      "MD, Stanford University School of Medicine",
      "Pediatric Residency, Children's Hospital of Philadelphia"
    ],
    languages: ["English", "Spanish"],
    about: "Dr. Rodriguez is a pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. She has a special interest in childhood development and preventive healthcare.",
    profileImage: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    consultationFee: 90,
    phone: "14155552673"
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    experience: 10,
    rating: 4.7,
    reviewCount: 87,
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9:00 AM - 5:00 PM"
    },
    education: [
      "MD, Yale School of Medicine",
      "Dermatology Residency, NYU Langone"
    ],
    languages: ["English"],
    about: "Dr. Wilson is a board-certified dermatologist specializing in general, surgical, and cosmetic dermatology. He treats various skin conditions and is experienced in teledermatology.",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80",
    consultationFee: 100,
    phone: "14155552674"
  },
  {
    id: "5",
    name: "Dr. Emily Patel",
    specialty: "Mental Health",
    experience: 9,
    rating: 4.9,
    reviewCount: 112,
    availability: {
      days: ["Tuesday", "Thursday", "Saturday"],
      hours: "10:00 AM - 7:00 PM"
    },
    education: [
      "MD, Columbia University",
      "Psychiatry Residency, Massachusetts General Hospital"
    ],
    languages: ["English", "Hindi"],
    about: "Dr. Patel is a psychiatrist who provides compassionate care for a wide range of mental health conditions. She specializes in anxiety, depression, and stress management.",
    profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    consultationFee: 110,
    phone: "14155552675"
  },
  {
    id: "6",
    name: "Dr. Robert Lee",
    specialty: "General Medicine",
    experience: 14,
    rating: 4.8,
    reviewCount: 143,
    availability: {
      days: ["Monday", "Tuesday", "Thursday", "Friday"],
      hours: "8:00 AM - 4:00 PM"
    },
    education: [
      "MD, University of California, San Francisco",
      "Internal Medicine Residency, UCSF Medical Center"
    ],
    languages: ["English", "Korean"],
    about: "Dr. Lee is an experienced physician who provides comprehensive primary care. He focuses on building long-term relationships with his patients and preventive healthcare.",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    consultationFee: 75,
    phone: "14155552676"
  }
];

export const specialties = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Mental Health",
  "Orthopedics",
  "Neurology",
  "Ophthalmology",
  "ENT",
  "Gynecology"
];
