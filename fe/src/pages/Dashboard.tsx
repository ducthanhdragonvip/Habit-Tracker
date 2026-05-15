import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Flame, Layers, Trophy } from "lucide-react";
import { dashboardApi } from "../api/habits";

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card p-6 h-24 animate-pulse opacity-50" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5 h-28 animate-pulse opacity-50" />
          ))}
        </div>
        <div className="card p-6 h-64 animate-pulse opacity-50" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6 border-danger">
        <p className="text-danger font-semibold">Could not load dashboard</p>
        <p className="text-muted text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Dashboard<span className="text-primary">.</span>
        </h1>
        <p className="text-muted text-sm mt-1">A bird's-eye view of your habits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          label="Total habits"
          value={data.total_habits}
          icon={<Layers className="h-7 w-7 text-white" strokeWidth={2.5} />}
          color="#2563eb"
        />
        <StatCard
          label="Completed today"
          value={`${data.completed_today} / ${data.total_habits}`}
          icon={<CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2.5} />}
          color="#16a34a"
          primary
        />
        <StatCard
          label="Best streak"
          value={`${data.best_current_streak} days`}
          icon={<Trophy className="h-7 w-7 text-white" strokeWidth={2.5} />}
          color="#db2777"
        />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-extrabold text-base">Today's completion</h2>
          <span className="text-xs text-muted uppercase tracking-wide">
            {Math.round(data.completion_rate_today * 100)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-surface-2 border-2 border-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.round(data.completion_rate_today * 100)}%` }}
          />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-base">Habits</h2>
          <span className="text-xs text-muted uppercase tracking-wide">
            {data.habits_summary.length} total
          </span>
        </div>
        {data.habits_summary.length === 0 ? (
          <p className="text-muted text-sm">
            No habits yet.{" "}
            <Link to="/habits/new" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wide">
                  <th className="text-left font-semibold pb-3 pr-3">Habit</th>
                  <th className="text-left font-semibold pb-3 px-3">Streak</th>
                  <th className="text-left font-semibold pb-3 pl-3">Today</th>
                </tr>
              </thead>
              <tbody>
                {data.habits_summary.map((h) => (
                  <tr key={h.id} className="border-t-2 border-border">
                    <td className="py-3 pr-3">
                      <Link
                        to={`/habits/${h.id}`}
                        className="flex items-center gap-3 min-w-0 hover:text-primary"
                      >
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-btn border-2 border-border text-lg shrink-0"
                          style={{ backgroundColor: h.color + "33" }}
                        >
                          {h.icon || "✨"}
                        </span>
                        <span
                          className="h-3 w-3 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: h.color }}
                          aria-hidden
                        />
                        <span className="font-semibold truncate">{h.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        <Flame className="h-4 w-4 text-primary" strokeWidth={2.5} />
                        {h.current_streak}
                      </span>
                    </td>
                    <td className="py-3 pl-3">
                      {h.completed_today ? (
                        <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                          <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> Done
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  primary,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  primary?: boolean;
}) {
  return (
    <div className="card p-5" style={{ boxShadow: `4px 4px 0px ${color}` }}>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-btn"
          style={{ backgroundColor: color }}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
          <p className={`text-2xl font-extrabold ${primary ? "text-primary" : ""}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

