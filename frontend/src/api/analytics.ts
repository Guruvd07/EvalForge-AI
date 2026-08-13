import apiClient from "./client";
import type { ModelAnalytics } from "../types/api";

export const getAnalytics = async (): Promise<ModelAnalytics[]> => {
  const response = await apiClient.get<ModelAnalytics[]>("/analytics");

  return response.data;
};