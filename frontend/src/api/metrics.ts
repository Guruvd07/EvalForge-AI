import apiClient from "./client";
import type { ModelMetrics } from "../types/api";

export const getModelMetrics = async (): Promise<ModelMetrics[]> => {
  const response = await apiClient.get<ModelMetrics[]>("/metrics");

  return response.data;
};