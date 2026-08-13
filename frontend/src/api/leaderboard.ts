import apiClient from "./client";
import type { LeaderboardItem } from "../types/api";

export const getLeaderboard = async (): Promise<LeaderboardItem[]> => {
  const response = await apiClient.get<LeaderboardItem[]>("/leaderboard");

  return response.data;
};