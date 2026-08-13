import apiClient from "./client";
import type { ActivityItem } from "../types/api";

export const getRecentActivity = async (
  limit = 10,
): Promise<ActivityItem[]> => {
  const response = await apiClient.get<ActivityItem[]>("/activity", {
    params: { limit },
  });

  return response.data;
};