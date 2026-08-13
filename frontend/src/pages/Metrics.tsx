import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { getModelMetrics } from "../api/metrics";

const Metrics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["model-metrics"],
    queryFn: getModelMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading metrics...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-400">
        Failed to load metrics.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Model Metrics"
        description="Detailed latency and token metrics for evaluated models."
        />

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left">Model</th>
                <th className="px-6 py-4 text-left">Evaluations</th>
                <th className="px-6 py-4 text-left">Min Latency</th>
                <th className="px-6 py-4 text-left">Max Latency</th>
                <th className="px-6 py-4 text-left">Avg Latency</th>
                <th className="px-6 py-4 text-left">Total Tokens</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.model}
                  className="border-t border-slate-800"
                >
                  <td className="px-6 py-4 font-medium">
                    {item.model}
                  </td>
                  <td className="px-6 py-4">
                    {item.evaluations}
                  </td>
                  <td className="px-6 py-4">
                    {item.min_latency} ms
                  </td>
                  <td className="px-6 py-4">
                    {item.max_latency} ms
                  </td>
                  <td className="px-6 py-4">
                    {item.avg_latency} ms
                  </td>
                  <td className="px-6 py-4">
                    {item.total_tokens}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Metrics;