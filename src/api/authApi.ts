import api from "./axios";
import type { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterPatientData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
}

const saveAuthData = (data: AuthResponse) => {
  // Remove any previous session first
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Store the new logged-in user
  localStorage.setItem("token", data.token);

  localStorage.setItem(
    "user",
    JSON.stringify(data.user),
  );
};

export const registerPatient = async (
  data: RegisterPatientData,
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>(
    "/auth/register",
    data,
  );

  saveAuthData(res.data);

  return res.data;
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>(
    "/auth/login",
    {
      email,
      password,
    },
  );

  console.log(
    "LOGIN RESPONSE:",
    res.data,
  );

  saveAuthData(res.data);

  return res.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};