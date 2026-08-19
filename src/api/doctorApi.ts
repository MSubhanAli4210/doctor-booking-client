import api from './axios';
import type { DoctorProfile } from '../types';

export const getAllDoctors = async (specialty?: string): Promise<DoctorProfile[]> => {
  const res = await api.get<{ doctors: DoctorProfile[] }>('/doctors', {
    params: specialty ? { specialty } : {},
  });
  return res.data.doctors;
};

export const getDoctorById = async (id: string): Promise<DoctorProfile> => {
  const res = await api.get<{ doctor: DoctorProfile }>(`/doctors/${id}`);
  return res.data.doctor;
};