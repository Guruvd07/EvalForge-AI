import apiClient from "./client";
import type { EvaluationResult } from "../types/api";

export interface CreateEvaluationRunPayload {
  experiment_id: string;
  selected_models: string[];
}

export interface EvaluationRun {
  id: string;
  experiment_id: string;
  status: string;
  started_at: string;
  completed_at?: string | null;
  selected_models?: string[];
  result_count?: number;
}

export interface EvaluationRunsResponse {
  items: EvaluationRun[];
  total: number;
  page: number;
  page_size: number;
}

export const createEvaluationRun = async (
  payload: CreateEvaluationRunPayload,
): Promise<EvaluationRun> => {
  const response = await apiClient.post<EvaluationRun>(
    "/evaluation-runs",
    payload,
  );

  return response.data;
};

/**
 * Get evaluation runs for an experiment.
 *
 * The backend returns the evaluation runs list and supports
 * filtering by experiment_id.
 */
export const getEvaluationRuns = async (
  experimentId: string,
): Promise<EvaluationRun[]> => {
  const response = await apiClient.get<EvaluationRunsResponse>(
    "/evaluation-runs",
    {
      params: {
        experiment_id: experimentId,
        page: 1,
        page_size: 100,
      },
    },
  );

  return response.data.items;
};

export const getEvaluationResults = async (
  runId: string,
): Promise<EvaluationResult[]> => {
  const response = await apiClient.get<EvaluationResult[]>(
    `/evaluation-runs/${runId}/results`,
  );

  return response.data;
};