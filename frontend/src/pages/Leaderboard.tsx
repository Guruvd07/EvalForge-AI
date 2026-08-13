import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { getLeaderboard } from "../api/leaderboard";

const Leaderboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading leaderboard...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-400">
        Failed to load leaderboard.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
            <PageHeader
        title="Model Leaderboard"
        description="Compare model performance across your evaluations."
        />

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Model</th>
                <th className="px-6 py-4 text-left">Provider</th>
                <th className="px-6 py-4 text-left">Evaluations</th>
                <th className="px-6 py-4 text-left">Latency</th>
                <th className="px-6 py-4 text-left">Tokens</th>
                <th className="px-6 py-4 text-left">Cost</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={`${item.model}-${item.provider}`}
                  className="border-t border-slate-800"
                >
                  <td className="px-6 py-4 font-semibold">
                    #{item.rank}
                  </td>
                  <td className="px-6 py-4">{item.model}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {item.provider}
                  </td>
                  <td className="px-6 py-4">{item.evaluations}</td>
                  <td className="px-6 py-4">
                    {item.avg_latency_ms} ms
                  </td>
                  <td className="px-6 py-4">
                    {item.avg_tokens}
                  </td>
                  <td className="px-6 py-4">
                    ${item.avg_cost}
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

export default Leaderboard;