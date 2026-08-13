import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  token?: string;
}

export const login = async (
  payload: LoginPayload,
): Promise<string> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  const token =
    response.data.access_token ??
    response.data.token;

  if (!token) {
    throw new Error("Login response did not contain an access token.");
  }

  return token;
};