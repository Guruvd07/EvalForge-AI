import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getAnalytics } from "../api/analytics";
import PageHeader from "../components/PageHeader";


const Analytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading analytics...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-400">
        Failed to load analytics.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Model Analytics"
        description="Analyze latency and token usage across evaluated models."
        />

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold">
            Average Latency
          </h2>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="avg_latency_ms"
                  name="Latency (ms)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Analytics;