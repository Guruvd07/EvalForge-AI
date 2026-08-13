import apiClient from "./client";
import type { DashboardStats } from "../types/api";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>("/dashboard/stats");

  return response.data;
};