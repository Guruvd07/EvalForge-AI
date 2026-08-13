import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Trophy,
  LineChart,
  Gauge,
  Activity,
  FlaskConical,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { getDashboardStats } from "../api/dashboard";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-9 w-64 rounded bg-slate-800" />
          <div className="mb-10 h-4 w-96 rounded bg-slate-800" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-slate-800 bg-slate-900"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Failed to load dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Something went wrong while fetching the latest stats.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </main>
    );
  }

  const quickLinks = [
    {
      to: "/experiments",
      title: "Experiments",
      desc: "Create and manage evaluation experiments.",
      icon: FlaskConical,
    },
    {
      to: "/leaderboard",
      title: "Leaderboard",
      desc: "Compare model performance.",
      icon: Trophy,
    },
    {
      to: "/analytics",
      title: "Analytics",
      desc: "Analyze latency and token usage.",
      icon: LineChart,
    },
    {
      to: "/metrics",
      title: "Model Metrics",
      desc: "View detailed model metrics.",
      icon: Gauge,
    },
    {
      to: "/activity",
      title: "Activity",
      desc: "View recent evaluation runs.",
      icon: Activity,
    },
  ];

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50">
              Evaluation Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Monitor experiments, model performance, and evaluation activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <Trophy className="h-4 w-4" />
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Experiments" value={data.total_experiments} />
          <StatCard label="Prompts" value={data.total_prompts} />
          <StatCard label="Evaluation Runs" value={data.total_runs} />
          <StatCard label="Results" value={data.total_results} />
          <StatCard
            label="Models Executed"
            value={data.total_models_executed}
          />
          <StatCard
            label="Avg Latency"
            value={`${data.avg_latency_ms} ms`}
            description="Per evaluation run"
          />
          <StatCard
            label="Avg Tokens"
            value={data.avg_tokens}
            description="Per evaluation run"
          />
          <StatCard
            label="Avg Cost"
            value={`$${data.avg_cost}`}
            description="Per evaluation run"
          />
        </div>

        {/* Quick links */}
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Explore
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ to, title, desc, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600 hover:bg-slate-900/80"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition group-hover:bg-slate-700">
                  <Icon className="h-4.5 w-4.5 text-slate-300" />
                </div>
                <h3 className="mt-3 font-semibold text-slate-100">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;