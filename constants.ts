
import { Student, Teacher, FeeStatus } from './types.ts';

export const SCHOOL_NAME = "Skyline Heights International";
export const SCHOOL_SLOGAN = "Pioneering Future Leaders";

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'];

const generateEmptyResults = () => [
  {
    termName: 'Term 1',
    scores: DEFAULT_SUBJECTS.map(s => ({ 
      subject: s, 
      marks: Math.floor(Math.random() * 40) + 40, 
      oralMarks: Math.floor(Math.random() * 10) + 10,
      maxMarks: 100 
    }))
  },
  {
    termName: 'Term 2',
    scores: DEFAULT_SUBJECTS.map(s => ({ 
      subject: s, 
      marks: Math.floor(Math.random() * 40) + 40, 
      oralMarks: Math.floor(Math.random() * 10) + 10,
      maxMarks: 100 
    }))
  },
  {
    termName: 'Final Term',
    scores: DEFAULT_SUBJECTS.map(s => ({ 
      subject: s, 
      marks: Math.floor(Math.random() * 40) + 40, 
      oralMarks: Math.floor(Math.random() * 10) + 10,
      maxMarks: 100 
    }))
  }
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'STU001',
    name: 'Aravind Sharma',
    photo: 'https://picsum.photos/seed/stu1/200/200',
    className: '10-A',
    fatherName: 'Rajesh Sharma',
    guardianName: 'Sunita Sharma',
    aadhaar: '1234-5678-9012',
    phone: '9876543210',
    address: '123 Green Valley, New Delhi',
    admissionFees: 5000,
    monthlyFees: 2000,
    admissionDate: '2023-01-15',
    payments: [
      { month: 'January', amount: 2000, date: '2024-01-05', status: FeeStatus.PAID },
      { month: 'February', amount: 2000, date: '2024-02-10', status: FeeStatus.PAID }
    ],
    examResults: generateEmptyResults()
  },
  {
    id: 'STU002',
    name: 'Priya Patel',
    photo: 'https://picsum.photos/seed/stu2/200/200',
    className: '12-B',
    fatherName: 'Vikram Patel',
    guardianName: 'Anjali Patel',
    aadhaar: '9876-5432-1098',
    phone: '8765432109',
    address: '45 Blue Heavens, Mumbai',
    admissionFees: 6000,
    monthlyFees: 2500,
    admissionDate: '2023-01-20',
    payments: [
      { month: 'January', amount: 2500, date: '2024-01-16', status: FeeStatus.PAID }
    ],
    examResults: generateEmptyResults()
  }
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'TCH001',
    name: 'Dr. Sameer Khan',
    photo: 'https://picsum.photos/seed/tch1/200/200',
    phone: '9988776655',
    subject: 'Mathematics',
    salary: 45000,
    payments: [{ month: 'January', date: '2024-01-31', amount: 45000 }]
  },
  {
    id: 'TCH002',
    name: 'Ms. Emily White',
    photo: 'https://picsum.photos/seed/tch2/200/200',
    phone: '7766554433',
    subject: 'English',
    salary: 40000,
    payments: [{ month: 'January', date: '2024-01-31', amount: 40000 }]
  }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];
