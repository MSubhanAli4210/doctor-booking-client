import api from "./axios";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface PatientAppointment {
  _id: string;

  doctor: {
    _id?: string;

    user: {
      name: string;
      email?: string;
      profilePicture?: string;
    };

    specialty?: string;
    specialization?: string;
  };

  date: string;
  timeSlot: string;
  time?: string;
  status: AppointmentStatus;
  fees?: number;

  payment?: {
    status: "unpaid" | "paid" | "failed" | "refunded";
    cardLast4?: string;
    paidAt?: string;
    failureReason?: string | null;
  };
}

export interface DoctorAppointment {
  _id: string;

  patient: {
    _id?: string;
    name: string;
    email: string;
    profilePicture?: string;
  };

  date?: string;
  timeSlot: string;
  time?: string;
  status: AppointmentStatus;
  fees?: number;

  payment?: {
    status: "unpaid" | "paid" | "failed" | "refunded";
    cardLast4?: string;
    paidAt?: string;
    refundedAt?: string;
    failureReason?: string | null;
  };
}

interface PatientAppointmentsResponse {
  appointments: PatientAppointment[];
}

interface DoctorAppointmentsResponse {
  appointments: DoctorAppointment[];
}

interface BookAppointmentPayload {
  doctorId: string;
  date: string;
  time: string;
}

export interface PaymentPayload {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface PaymentResponse {
  message: string;
  appointment: PatientAppointment;
}

export const getMyAppointments =
  async (): Promise<PatientAppointmentsResponse> => {
    const response =
      await api.get<PatientAppointmentsResponse>("/appointments/my");

    return response.data;
  };

export const bookAppointment = async (data: BookAppointmentPayload) => {
  const response = await api.post("/appointments", data);

  return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
  const response = await api.patch(`/appointments/${appointmentId}/cancel`);

  return response.data;
};

export const processAppointmentPayment = async (
  appointmentId: string,
  data: PaymentPayload,
): Promise<PaymentResponse> => {
  const response = await api.post<PaymentResponse>(
    `/appointments/${appointmentId}/payment`,
    data,
  );

  return response.data;
};

export const getDoctorAppointments =
  async (): Promise<DoctorAppointmentsResponse> => {
    const response = await api.get<DoctorAppointmentsResponse>(
      "/appointments/doctor",
    );

    return response.data;
  };

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
) => {
  const response = await api.patch(`/appointments/${appointmentId}/status`, {
    status,
  });

  return response.data;
};
