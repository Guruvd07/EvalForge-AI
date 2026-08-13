import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  createExperiment,
  getExperiments,
} from "../api/experiments";
import PageHeader from "../components/PageHeader";

const Experiments = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["experiments"],
    queryFn: getExperiments,
  });

  const createMutation = useMutation({
    mutationFn: createExperiment,
    onSuccess: () => {
      setTitle("");
      setDescription("");

      queryClient.invalidateQueries({
        queryKey: ["experiments"],
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Experiments"
          description="Create and manage your AI evaluation experiments."
        />

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-lg font-semibold">
              Create Experiment
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="LLM Benchmark"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Compare multiple LLMs..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={
                  !title.trim() || createMutation.isPending
                }
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending
                  ? "Creating..."
                  : "Create Experiment"}
              </button>

              {createMutation.isError && (
                <p className="text-sm text-red-400">
                  Failed to create experiment.
                </p>
              )}
            </div>
          </form>

          <section>
            {isLoading && (
              <p className="text-slate-400">
                Loading experiments...
              </p>
            )}

            {isError && (
              <p className="text-red-400">
                Failed to load experiments.
              </p>
            )}

            {!isLoading && !isError && data?.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
                <p className="text-slate-400">
                  No experiments yet.
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {data?.map((experiment) => (
                <Link
                  key={experiment.id}
                  to={`/experiment-details/${experiment.id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {experiment.title}
                      </h3>

                      {experiment.description && (
                        <p className="mt-2 text-sm text-slate-400">
                          {experiment.description}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {experiment.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Experiments;