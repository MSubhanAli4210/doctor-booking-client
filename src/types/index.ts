export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DoctorProfile {
  _id: string;
  user: User;
  specialty: string;
  degree: string;
  experienceYears: number;
  fees: number;
  address: string;
  about?: string;
  availability: AvailabilitySlot[];
  isActive: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';

export interface Payment {
  status: PaymentStatus;
  cardLast4?: string;
  paidAt?: string;
  failureReason?: string | null;
}

export interface Appointment {
  _id: string;
  patient: User;
  doctor: DoctorProfile;
  date: string;
  time: string;
  status: AppointmentStatus;
  fees: number;
  payment: Payment;
  createdAt: string;
}

export interface Review {
  _id: string;
  patient: User;
  doctor: string;
  appointment: string;
  rating: number;
  comment?: string;
  createdAt: string;
}