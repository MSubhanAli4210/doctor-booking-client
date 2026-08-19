import api from "./axios";
import type { DoctorProfile } from "../types";

export const getDoctorById = async (
  doctorId: string,
): Promise<DoctorProfile> => {
  const response = await api.get(
    `/doctors/${doctorId}`,
  );

  return response.data.doctor;
};