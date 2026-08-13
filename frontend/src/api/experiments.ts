import apiClient from "./client";
import type { Experiment } from "../types/api";

export interface CreateExperimentPayload {
  title: string;
  description?: string;
}

export interface ExperimentDetails {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  prompt_count: number;
  run_count: number;
  result_count: number;
}

export interface Prompt {
  id: string;
  experiment_id: string;
  title: string;
  prompt_text: string;
  created_at: string;
}

export interface CreatePromptPayload {
  experiment_id: string;
  title: string;
  prompt_text: string;
}

export const getExperiments = async (): Promise<Experiment[]> => {
  const response = await apiClient.get<Experiment[]>("/experiments");

  return response.data;
};

export const createExperiment = async (
  payload: CreateExperimentPayload,
): Promise<Experiment> => {
  const response = await apiClient.post<Experiment>(
    "/experiments",
    payload,
  );

  return response.data;
};

export const getExperimentDetails = async (
  experimentId: string,
): Promise<ExperimentDetails> => {
  const response = await apiClient.get<ExperimentDetails>(
    `/experiment-details/${experimentId}`,
  );

  return response.data;
};

export const getPromptsByExperiment = async (
  experimentId: string,
): Promise<Prompt[]> => {
  const response = await apiClient.get<Prompt[]>(
    `/prompts/${experimentId}`,
  );

  return response.data;
};

export const createPrompt = async (
  payload: CreatePromptPayload,
): Promise<Prompt> => {
  const response = await apiClient.post<Prompt>(
    "/prompts",
    payload,
  );

  return response.data;
};