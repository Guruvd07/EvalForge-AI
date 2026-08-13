import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { getRecentActivity } from "../api/activity";

const Activity = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: () => getRecentActivity(10),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading activity...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-400">
        Failed to load activity.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Recent Activity"
        description="Track recent evaluation runs and their execution status."
        />
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left">Run ID</th>
                <th className="px-6 py-4 text-left">Experiment</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Started</th>
                <th className="px-6 py-4 text-left">Completed</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.run_id}
                  className="border-t border-slate-800"
                >
                  <td className="px-6 py-4 font-mono text-sm">
                    {item.run_id.slice(0, 8)}...
                  </td>

                  <td className="px-6 py-4">
                    {item.experiment_id.slice(0, 8)}...
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(item.started_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-400">
                    {item.completed_at
                      ? new Date(item.completed_at).toLocaleString()
                      : "-"}
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

export default Activity;