
export enum FeeStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface User {
  email?: string;
  phone?: string;
  name: string;
  authMethod: 'email' | 'phone' | 'apple';
}

export interface PaymentRecord {
  month: string;
  amount: number;
  date: string;
  status: FeeStatus;
}

export interface ExamScore {
  subject: string;
  marks: number;
  oralMarks: number;
  maxMarks: number;
}

export interface TermResult {
  termName: string;
  scores: ExamScore[];
}

export interface Student {
  id: string;
  name: string;
  photo: string;
  className: string;
  fatherName: string;
  guardianName: string;
  aadhaar: string;
  phone: string;
  address: string;
  admissionFees: number;
  monthlyFees: number;
  payments: PaymentRecord[];
  examResults: TermResult[];
  admissionDate: string;
}

export interface TeacherPayment {
  month: string;
  date: string;
  amount: number;
}

export interface Teacher {
  id: string;
  name: string;
  photo: string;
  phone: string;
  subject: string;
  salary: number;
  payments: TeacherPayment[];
}

export type ViewType = 'dashboard' | 'students' | 'teachers' | 'fees' | 'exams' | 'comms' | 'settings';
