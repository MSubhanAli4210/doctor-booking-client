import api from "./axios";

/* =========================
   TYPES
========================= */

export interface CreateDoctorData {
  name: string;
  email: string;
  password: string;
  specialty: string;
  degree: string;
  experience: number;
  fees: number;
  address: string;
}

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export interface AdminPatient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  profilePicture?: string;
  createdAt?: string;
}

export interface AdminAppointment {
  _id: string;

  patient?: {
    _id?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  };

  doctor?: {
    _id?: string;
    specialty?: string;

    user?: {
      _id?: string;
      name?: string;
      email?: string;
      profilePicture?: string;
    };
  };

  date?: string;
  appointmentDate?: string;
  time?: string;

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | string;

  fees?: number;
  fee?: number;
  paymentStatus?: string;
  createdAt?: string;
}

/* =========================
   DASHBOARD
========================= */

export const getAdminStats =
  async (): Promise<AdminStats> => {
    const response = await api.get(
      "/admin/stats",
    );

    return response.data.stats;
  };

export const getRecentAppointments =
  async (): Promise<
    AdminAppointment[]
  > => {
    const response = await api.get(
      "/admin/appointments/recent",
    );

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(data?.appointments)
    ) {
      return data.appointments;
    }

    return [];
  };

/* =========================
   DOCTORS
========================= */

export const getAdminDoctors = async () => {
  const response = await api.get(
    "/doctors",
  );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.doctors)) {
    return data.doctors;
  }

  return [];
};

export const createDoctor = async (
  data: CreateDoctorData,
) => {
  const response = await api.post(
    "/doctors",
    data,
  );

  return response.data;
};

export const deactivateDoctor = async (
  id: string,
) => {
  const response = await api.patch(
    `/doctors/${id}/deactivate`,
  );

  return response.data;
};

/* =========================
   PATIENTS
========================= */

export const getAdminPatients =
  async (): Promise<AdminPatient[]> => {
    const response = await api.get(
      "/admin/patients",
    );

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.patients)) {
      return data.patients;
    }

    return [];
  };

/* =========================
   APPOINTMENTS
========================= */

export const getAdminAppointments =
  async (): Promise<
    AdminAppointment[]
  > => {
    const response = await api.get(
      "/admin/appointments",
    );

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(data?.appointments)
    ) {
      return data.appointments;
    }

    return [];
  };