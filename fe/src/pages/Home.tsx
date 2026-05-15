import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import HabitCard from "../components/HabitCard";
import { habitsApi } from "../api/habits";

export default function Home() {
  const qc = useQueryClient();
  const { data: habits, isLoading, isError, error } = useQuery({
    queryKey: ["habits", "today"],
    queryFn: habitsApi.today,
  });

  const toggle = useMutation({
    mutationFn: (id: string) => habitsApi.check(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Today<span className="text-primary">.</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {isLoading && <SkeletonGrid />}
      {isError && (
        <div className="card p-6 border-danger">
          <p className="text-danger font-semibold">Could not load habits</p>
          <p className="text-muted text-sm mt-1">{(error as Error).message}</p>
        </div>
      )}

      {habits && habits.length === 0 && <EmptyState />}

      {habits && habits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              toggling={toggle.isPending && toggle.variables === h.id}
              onToggle={() => toggle.mutate(h.id)}
            />
          ))}
        </div>
      )}

      <Link
        to="/habits/new"
        aria-label="New habit"
        className="fixed bottom-6 right-6 sm:hidden h-14 w-14 rounded-card bg-primary text-white shadow-bold-lg flex items-center justify-center active:translate-y-0.5"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card p-5 h-36 animate-pulse opacity-50" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-card bg-primary shadow-bold-sm mb-4">
        <Sparkles className="h-8 w-8 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-lg font-extrabold">No habits yet</h2>
      <p className="text-muted text-sm mt-1 mb-5">
        Start building one habit at a time. Small steps, big change.
      </p>
      <Link to="/habits/new" className="btn-primary">
        + Create your first habit
      </Link>
    </div>
  );
}
