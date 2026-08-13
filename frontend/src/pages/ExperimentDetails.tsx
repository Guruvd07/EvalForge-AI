import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Play,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import PageHeader 
from "../components/PageHeader";
import {
  createPrompt,
  getExperimentDetails,
  getPromptsByExperiment,
} 

from "../api/experiments";
import {
  createEvaluationRun,
  getEvaluationResults,
  getEvaluationRuns,
} 

from "../api/evaluation";
import { EVALUATION_MODELS } from "../constants/models";
import type { EvaluationResult } from "../types/api";

const ExperimentDetails = () => {
  const { experimentId } = useParams<{ experimentId: string }>();

  const queryClient = useQueryClient();

  const [showPromptForm, setShowPromptForm] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  const [promptTitle, setPromptTitle] = useState("");
  const [promptText, setPromptText] = useState("");

  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Stores the latest evaluation run
  const [latestRunId, setLatestRunId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Experiment
  // ---------------------------------------------------------------------------

  const {
    data: experiment,
    isLoading: experimentLoading,
    isError: experimentError,
  } = useQuery({
    queryKey: ["experiment-details", experimentId],
    queryFn: () => getExperimentDetails(experimentId!),
    enabled: Boolean(experimentId),
  });

  // ---------------------------------------------------------------------------
  // Prompts
  // ---------------------------------------------------------------------------

  const {
    data: prompts = [],
    isLoading: promptsLoading,
  } = useQuery({
    queryKey: ["prompts", experimentId],
    queryFn: () => getPromptsByExperiment(experimentId!),
    enabled: Boolean(experimentId),
  });

// ---------------------------------------------------------------------------
// Evaluation Runs
// ---------------------------------------------------------------------------

const {
    data: evaluationRuns = [],
    isLoading: evaluationRunsLoading,
  } = useQuery({
    queryKey: ["evaluation-runs", experimentId],
    queryFn: () => getEvaluationRuns(experimentId!),
    enabled: Boolean(experimentId),
  });

  useEffect(() => {
    if (latestRunId || evaluationRuns.length === 0) {
      return;
    }
  
    const completedRuns = evaluationRuns.filter(
      (run) => run.status === "completed",
    );
  
    if (completedRuns.length === 0) {
      return;
    }
  
    const latestRun = [...completedRuns].sort(
      (a, b) =>
        new Date(b.started_at).getTime() -
        new Date(a.started_at).getTime(),
    )[0];
  
    setLatestRunId(latestRun.id);
  }, [evaluationRuns, latestRunId]);

  // ---------------------------------------------------------------------------
  // Evaluation Results
  // ---------------------------------------------------------------------------

  const {
    data: evaluationResults = [],
    isLoading: resultsLoading,
    isFetching: resultsFetching,
    isError: resultsError,
  } = useQuery<EvaluationResult[]>({
    queryKey: ["evaluation-results", latestRunId],
    queryFn: () => getEvaluationResults(latestRunId!),
    enabled: Boolean(latestRunId),
    refetchInterval: (query) => {
      const results = query.state.data;

      // Keep checking while the evaluation is being processed.
      // Once results arrive, stop polling.
      if (!results || results.length === 0) {
        return 2000;
      }

      return false;
    },
  });

  // ---------------------------------------------------------------------------
  // Create Prompt
  // ---------------------------------------------------------------------------

  const createPromptMutation = useMutation({
    mutationFn: createPrompt,

    onSuccess: async () => {
      setPromptTitle("");
      setPromptText("");
      setShowPromptForm(false);

      await queryClient.invalidateQueries({
        queryKey: ["prompts", experimentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["experiment-details", experimentId],
      });
    },
  });

  // ---------------------------------------------------------------------------
  // Create Evaluation Run
  // ---------------------------------------------------------------------------

  const createEvaluationMutation = useMutation({
    mutationFn: createEvaluationRun,

    onSuccess: async (data) => {
        setLatestRunId(data.id);
      
        setSelectedModels([]);
        setShowEvaluationModal(false);
      
        await queryClient.invalidateQueries({
          queryKey: ["experiment-details", experimentId],
        });
      
        await queryClient.invalidateQueries({
          queryKey: ["evaluation-runs", experimentId],
        });
      },
  });

  // ---------------------------------------------------------------------------
  // Prompt Handlers
  // ---------------------------------------------------------------------------

  const handleCreatePrompt = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!experimentId) {
      return;
    }

    if (!promptTitle.trim() || !promptText.trim()) {
      return;
    }

    createPromptMutation.mutate({
      experiment_id: experimentId,
      title: promptTitle.trim(),
      prompt_text: promptText.trim(),
    });
  };

  // ---------------------------------------------------------------------------
  // Model Selection
  // ---------------------------------------------------------------------------

  const handleModelToggle = (modelKey: string) => {
    setSelectedModels((current) => {
      if (current.includes(modelKey)) {
        return current.filter((key) => key !== modelKey);
      }

      return [...current, modelKey];
    });
  };

  // ---------------------------------------------------------------------------
  // Start Evaluation
  // ---------------------------------------------------------------------------

  const handleStartEvaluation = () => {
    if (!experimentId || selectedModels.length === 0) {
      return;
    }

    createEvaluationMutation.mutate({
      experiment_id: experimentId,
      selected_models: selectedModels,
    });
  };

  // ---------------------------------------------------------------------------
  // Close Evaluation Modal
  // ---------------------------------------------------------------------------

  const closeEvaluationModal = () => {
    if (createEvaluationMutation.isPending) {
      return;
    }

    setShowEvaluationModal(false);
    setSelectedModels([]);
    createEvaluationMutation.reset();
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (experimentLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-400">
            Loading experiment...
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (experimentError || !experiment) {
    return (
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/experiments"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experiments
          </Link>

          <div className="rounded-xl border border-red-900/50 bg-slate-900 p-6">
            <p className="text-red-400">
              Failed to load experiment details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(
    experiment.created_at,
  ).toLocaleString();

  // ---------------------------------------------------------------------------
// Model Comparison
// ---------------------------------------------------------------------------

const modelComparison = Object.values(
    evaluationResults.reduce(
      (acc, result) => {
        const model = result.model_name;
  
        if (!acc[model]) {
          acc[model] = {
            model_name: model,
            provider: result.provider,
            count: 0,
            relevance: 0,
            correctness: 0,
            coherence: 0,
            instruction_following: 0,
            overall: 0,
            latency: 0,
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
            cost: 0,
          };
        }
  
        acc[model].count += 1;
        acc[model].relevance += result.relevance_score ?? 0;
        acc[model].correctness += result.correctness_score ?? 0;
        acc[model].coherence += result.coherence_score ?? 0;
        acc[model].instruction_following +=
          result.instruction_following_score ?? 0;
        acc[model].overall += result.overall_score ?? 0;
        acc[model].latency += result.latency_ms ?? 0;
        acc[model].input_tokens += result.input_tokens ?? 0;
        acc[model].output_tokens += result.output_tokens ?? 0;
        acc[model].total_tokens += result.total_tokens ?? 0;
        acc[model].cost += result.cost ?? 0;
  
        return acc;
      },
      {} as Record<
        string,
        {
          model_name: string;
          provider: string;
          count: number;
          relevance: number;
          correctness: number;
          coherence: number;
          instruction_following: number;
          overall: number;
          latency: number;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
        }
      >,
    ),
  ).map((model) => ({
    ...model,
    avgRelevance: model.relevance / model.count,
    avgCorrectness: model.correctness / model.count,
    avgCoherence: model.coherence / model.count,
    avgInstructionFollowing:
      model.instruction_following / model.count,
    avgOverall: model.overall / model.count,
    avgLatency: model.latency / model.count,
    avgInputTokens: model.input_tokens / model.count,
    avgOutputTokens: model.output_tokens / model.count,
    avgTotalTokens: model.total_tokens / model.count,
    avgCost: model.cost / model.count,
  }));
  
  const bestModel =
    modelComparison.length > 0
      ? [...modelComparison].sort(
          (a, b) => b.avgOverall - a.avgOverall,
        )[0]
      : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-7xl">

          {/* Back */}
          <Link
            to="/experiments"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experiments
          </Link>

          {/* Page Header */}
          <PageHeader
            title={experiment.title}
            description={
              experiment.description ||
              "Manage prompts, evaluation runs, and results for this experiment."
            }
          />

          {/* ---------------------------------------------------------------- */}
          {/* Experiment Header */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    Experiment Overview
                  </h2>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                    {experiment.status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Created {formattedDate}
                </p>

                <p className="mt-2 break-all text-xs text-slate-600">
                  ID: {experiment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEvaluationModal(true)}
                disabled={prompts.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Run Evaluation
              </button>
            </div>

            {prompts.length === 0 && (
              <p className="mt-4 text-xs text-slate-500">
                Add at least one prompt before running an evaluation.
              </p>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Statistics */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Prompts"
              value={prompts.length}
            />

            <StatCard
              icon={<Play className="h-5 w-5" />}
              label="Evaluation Runs"
              value={experiment.run_count}
            />

            <StatCard
              icon={<Trophy className="h-5 w-5" />}
              label="Results"
              value={experiment.result_count}
            />

            <StatCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Status"
              value={experiment.status}
              capitalize
            />

          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Prompts */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Prompts
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create and manage evaluation prompts for this experiment.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPromptForm((value) => !value)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 sm:w-auto"
              >
                <Plus className="h-4 w-4" />

                {showPromptForm
                  ? "Close Form"
                  : "Create Prompt"}
              </button>

            </div>

            {/* Create Prompt Form */}

            {showPromptForm && (
              <form
                onSubmit={handleCreatePrompt}
                className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold text-white">
                  Create Prompt
                </h3>

                <div className="mt-5 space-y-5">

                  <div>
                    <label
                      htmlFor="prompt-title"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Title
                    </label>

                    <input
                      id="prompt-title"
                      type="text"
                      value={promptTitle}
                      onChange={(event) =>
                        setPromptTitle(event.target.value)
                      }
                      placeholder="e.g. Summarization Test"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prompt-text"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Prompt Text
                    </label>

                    <textarea
                      id="prompt-text"
                      value={promptText}
                      onChange={(event) =>
                        setPromptText(event.target.value)
                      }
                      placeholder="Enter the prompt that will be evaluated..."
                      rows={6}
                      className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
                      required
                    />
                  </div>

                  {createPromptMutation.isError && (
                    <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                      Failed to create prompt. Please try again.
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={() => {
                        setShowPromptForm(false);
                        setPromptTitle("");
                        setPromptText("");
                      }}
                      className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        createPromptMutation.isPending ||
                        !promptTitle.trim() ||
                        !promptText.trim()
                      }
                      className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {createPromptMutation.isPending
                        ? "Creating..."
                        : "Add Prompt"}
                    </button>

                  </div>

                </div>
              </form>
            )}

            {/* Prompt List */}

            <div className="mt-5">

              {promptsLoading ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">
                    Loading prompts...
                  </p>
                </div>
              ) : prompts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">

                  <FileText className="mx-auto h-8 w-8 text-slate-600" />

                  <h3 className="mt-3 font-medium text-white">
                    No prompts yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your first evaluation prompt to get started.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {prompts.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="text-xs font-semibold tracking-wider text-slate-600">
                              #{index + 1}
                            </span>

                            <h3 className="break-words font-semibold text-white">
                              {prompt.title}
                            </h3>

                          </div>

                          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">

                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                              {prompt.prompt_text}
                            </p>

                          </div>

                          <p className="mt-3 text-xs text-slate-600">
                            Created{" "}
                            {new Date(
                              prompt.created_at,
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Evaluation Workflow */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-8">

            <h2 className="text-lg font-semibold text-white">
              Evaluation Workflow
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Build your experiment step by step.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">

              <WorkflowCard
                number="01"
                title="Create Prompts"
                description="Add evaluation prompts and test cases to this experiment."
                icon={<FileText className="h-5 w-5" />}
                active
                onClick={() => setShowPromptForm(true)}
              />

              <WorkflowCard
                number="02"
                title="Run Evaluation"
                description="Execute your prompts against selected AI models."
                icon={<Play className="h-5 w-5" />}
                disabled={prompts.length === 0}
                active={prompts.length > 0}
                onClick={() => setShowEvaluationModal(true)}
              />

              <WorkflowCard
                number="03"
                title="Analyze Results"
                description={
                  evaluationResults.length > 0
                    ? "Evaluation results are available below."
                    : "Run an evaluation to analyze model quality, latency, tokens, and cost."
                }
                icon={<Trophy className="h-5 w-5" />}
                disabled={!latestRunId}
                active={evaluationResults.length > 0}
              />

            </div>

          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Evaluation Results */}
          {/* ---------------------------------------------------------------- */}

          {latestRunId && (
            <section className="mt-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Evaluation Results
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Compare model quality, latency, token usage, and cost.
                  </p>
                </div>

                {resultsFetching && (
                  <span className="text-xs text-slate-500">
                    Updating results...
                  </span>
                )}

              </div>

              {/* Model Comparison */}

                {!resultsLoading &&
                !resultsError &&
                modelComparison.length > 0 && (
                    <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                        <h3 className="text-lg font-semibold text-white">
                            Model Comparison
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Compare average quality and performance across evaluated models.
                        </p>
                        </div>

                        {bestModel && (
                        <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3">
                            <p className="text-xs text-slate-500">
                            Best Overall Model
                            </p>

                            <p className="mt-1 font-semibold text-white">
                            {bestModel.model_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                            {bestModel.avgOverall.toFixed(1)}/10
                            </p>
                        </div>
                        )}
                    </div>

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs text-slate-500">
                            <th className="px-3 py-3 font-medium">Model</th>
                            <th className="px-3 py-3 font-medium">Relevance</th>
                            <th className="px-3 py-3 font-medium">Correctness</th>
                            <th className="px-3 py-3 font-medium">Coherence</th>
                            <th className="px-3 py-3 font-medium">Instruction</th>
                            <th className="px-3 py-3 font-medium">Overall</th>
                            <th className="px-3 py-3 font-medium">Latency</th>
                            <th className="px-3 py-3 font-medium">Tokens</th>
                            <th className="px-3 py-3 font-medium">Cost</th>
                            </tr>
                        </thead>

                        <tbody>
                            {modelComparison.map((model) => (
                            <tr
                                key={model.model_name}
                                className="border-b border-slate-800/70 last:border-0"
                            >
                                <td className="px-3 py-4">
                                <p className="font-medium text-white">
                                    {model.model_name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {model.provider}
                                </p>
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {model.avgRelevance.toFixed(1)}/10
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {model.avgCorrectness.toFixed(1)}/10
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {model.avgCoherence.toFixed(1)}/10
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {model.avgInstructionFollowing.toFixed(1)}/10
                                </td>

                                <td className="px-3 py-4">
                                <span className="font-semibold text-white">
                                    {model.avgOverall.toFixed(1)}/10
                                </span>
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {Math.round(model.avgLatency)} ms
                                </td>

                                <td className="px-3 py-4 text-sm text-slate-300">
                                {Math.round(model.avgTotalTokens)}
                                </td>
                                <td className="px-3 py-4 text-sm text-slate-300">
                                ${model.avgCost.toFixed(6)}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>
                )}

              {/* Loading */}

              {resultsLoading && (
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-400">
                    Running evaluation and calculating quality scores...
                  </p>
                </div>
              )}

              {/* Error */}

              {resultsError && (
                <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 p-6">
                  <p className="text-sm text-red-400">
                    Failed to load evaluation results.
                  </p>
                </div>
              )}

              {/* Results */}

              {!resultsLoading &&
                !resultsError &&
                evaluationResults.length > 0 && (
                  <div className="mt-5 space-y-5">

                    {evaluationResults.map((result) => (
                      <EvaluationResultCard
                        key={result.id}
                        result={result}
                      />
                    ))}

                  </div>
                )}

              {/* No Results Yet */}

              {!resultsLoading &&
                !resultsError &&
                evaluationResults.length === 0 && (
                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <p className="text-sm text-slate-400">
                      Evaluation is still processing. Results will appear automatically.
                    </p>
                  </div>
                )}

            </section>
          )}

        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* Evaluation Modal */}
      {/* -------------------------------------------------------------------- */}

      {showEvaluationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Run Evaluation
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Select the models you want to evaluate.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEvaluationModal}
                disabled={createEvaluationMutation.isPending}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Close evaluation modal"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="p-5 sm:p-6">

              {/* Prompt count */}

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-400">
                    Prompts to evaluate
                  </span>

                  <span className="font-semibold text-white">
                    {prompts.length}
                  </span>

                </div>

              </div>

              {/* Models */}

              <div className="mt-5">

                <div className="flex items-center justify-between">

                  <h3 className="text-sm font-semibold text-white">
                    Available Models
                  </h3>

                  <span className="text-xs text-slate-500">
                    {selectedModels.length} selected
                  </span>

                </div>

                <div className="mt-3 space-y-2">

                  {EVALUATION_MODELS.map((model) => {

                    const selected =
                      selectedModels.includes(model.key);

                    return (
                      <button
                        key={model.key}
                        type="button"
                        onClick={() =>
                          handleModelToggle(model.key)
                        }
                        disabled={
                          createEvaluationMutation.isPending
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
                          selected
                            ? "border-slate-500 bg-slate-800"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected
                              ? "border-white bg-white text-slate-950"
                              : "border-slate-600"
                          }`}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="font-medium text-white">
                            {model.displayName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {model.provider}
                          </p>

                        </div>

                      </button>
                    );
                  })}

                </div>

              </div>

              {/* Error */}

              {createEvaluationMutation.isError && (
                <div className="mt-5 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  Failed to start evaluation. Please try again.
                </div>
              )}

              {/* Buttons */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeEvaluationModal}
                  disabled={
                    createEvaluationMutation.isPending
                  }
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStartEvaluation}
                  disabled={
                    selectedModels.length === 0 ||
                    createEvaluationMutation.isPending
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />

                  {createEvaluationMutation.isPending
                    ? "Starting..."
                    : "Start Evaluation"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

// ============================================================================
// Evaluation Result Card
// ============================================================================

interface EvaluationResultCardProps {
  result: EvaluationResult;
}

const EvaluationResultCard = ({
  result,
}: EvaluationResultCardProps) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h3 className="text-lg font-semibold text-white">
            {result.model_name}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Provider: {result.provider}
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-center">
          <p className="text-xs text-slate-500">
            Overall Score
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {result.overall_score}/10
          </p>
        </div>

      </div>

      {/* Quality Scores */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        <ScoreCard
          label="Relevance"
          score={result.relevance_score}
        />

        <ScoreCard
          label="Correctness"
          score={result.correctness_score}
        />

        <ScoreCard
          label="Coherence"
          score={result.coherence_score}
        />

        <ScoreCard
          label="Instruction Following"
          score={result.instruction_following_score}
        />

        <ScoreCard
          label="Overall"
          score={result.overall_score}
        />

      </div>

      {/* Performance */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        <MetricCard
          label="Latency"
          value={`${result.latency_ms} ms`}
        />

        <MetricCard
          label="Input Tokens"
          value={result.input_tokens}
        />

        <MetricCard
          label="Output Tokens"
          value={result.output_tokens}
        />

        <MetricCard
          label="Total Tokens"
          value={result.total_tokens}
        />
        <MetricCard
        label="Cost"
        value={`$${result.cost.toFixed(6)}`}
        />

      </div>

      {/* Response */}

      <div className="mt-5">

        <p className="mb-2 text-sm font-medium text-slate-300">
          Model Response
        </p>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {result.response_text}
          </p>

        </div>

      </div>

    </div>
  );
};

// ============================================================================
// Score Card
// ============================================================================

interface ScoreCardProps {
  label: string;
  score: number;
}

const ScoreCard = ({
  label,
  score,
}: ScoreCardProps) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {score}/10
      </p>

    </div>
  );
};

// ============================================================================
// Metric Card
// ============================================================================

interface MetricCardProps {
  label: string;
  value: number | string;
}

const MetricCard = ({
  label,
  value,
}: MetricCardProps) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
};

// ============================================================================
// Stat Card
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  capitalize?: boolean;
}

const StatCard = ({
  icon,
  label,
  value,
  capitalize = false,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-800 p-2 text-slate-300">
          {icon}
        </div>

        <span className="text-sm text-slate-400">
          {label}
        </span>

      </div>

      <p
        className={`mt-4 text-2xl font-semibold text-white ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
};

// ============================================================================
// Workflow Card
// ============================================================================

interface WorkflowCardProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const WorkflowCard = ({
  number,
  title,
  description,
  icon,
  disabled = false,
  active = false,
  onClick,
}: WorkflowCardProps) => {

  const content = (
    <>
      <div className="flex items-start justify-between">

        <span className="text-xs font-semibold tracking-wider text-slate-600">
          {number}
        </span>

        <div className="rounded-lg bg-slate-800 p-2 text-slate-300">
          {icon}
        </div>

      </div>

      <h3 className="mt-5 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </>
  );

  if (disabled) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 opacity-75">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-slate-900 p-5 text-left transition hover:border-slate-600 hover:bg-slate-800/80 ${
        active
          ? "border-slate-700"
          : "border-slate-800"
      }`}
    >
      {content}
    </button>
  );
};

export default ExperimentDetails;