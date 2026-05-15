import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Flame, Pencil, Trash2, Trophy } from "lucide-react";
import { habitsApi } from "../api/habits";

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: habit, isLoading, isError, error } = useQuery({
    queryKey: ["habits", id],
    queryFn: () => habitsApi.get(id!),
    enabled: !!id,
  });

  const { data: streak } = useQuery({
    queryKey: ["habits", id, "streak"],
    queryFn: () => habitsApi.streak(id!),
    enabled: !!id,
  });

  const since = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 89);
    return d.toISOString().slice(0, 10);
  })();
  const { data: logs } = useQuery({
    queryKey: ["habits", id, "logs", since],
    queryFn: () => habitsApi.logs(id!, since),
    enabled: !!id,
    retry: false,
  });

  const remove = useMutation({
    mutationFn: () => habitsApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      navigate("/");
    },
  });

  const toggleDay = useMutation({
    mutationFn: async (date: string) => {
      if (date === todayKey()) {
        await habitsApi.check(id!);
      } else {
        await habitsApi.logDay(id!, date);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits", id, "logs"] });
      qc.invalidateQueries({ queryKey: ["habits", id, "streak"] });
      qc.invalidateQueries({ queryKey: ["habits", "today"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading) return <div className="card p-6 h-64 animate-pulse opacity-50" />;
  if (isError)
    return (
      <div className="card p-6 border-danger">
        <p className="text-danger font-semibold">Could not load habit</p>
        <p className="text-muted text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  if (!habit) return null;

  const completedDates = new Set(logs?.map((l) => l.date) ?? []);

  const onDelete = () => {
    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      remove.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="inline-flex h-16 w-16 items-center justify-center rounded-card text-3xl border-2 border-border shrink-0"
            style={{ backgroundColor: habit.color + "33" }}
          >
            {habit.icon || "✨"}
          </span>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold truncate">{habit.name}</h1>
            {habit.description && (
              <p className="text-muted text-sm mt-1 max-w-md">{habit.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/habits/${habit.id}/edit`} className="btn-ghost text-sm">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={remove.isPending}
            className="btn-danger text-sm"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          label="Current streak"
          value={streak?.current_streak ?? 0}
          icon={<Flame className="h-7 w-7 text-white" strokeWidth={2.5} />}
          color={habit.color}
          primary
        />
        <StatCard
          label="Longest streak"
          value={streak?.longest_streak ?? 0}
          icon={<Trophy className="h-7 w-7 text-white" strokeWidth={2.5} />}
          color="#2563eb"
        />
      </div>

      <Heatmap
        completed={completedDates}
        color={habit.color}
        unavailable={!logs}
        onToggle={(date) => toggleDay.mutate(date)}
        pendingDate={toggleDay.isPending ? toggleDay.variables : undefined}
      />
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
  value: number;
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
            <span className="text-sm text-muted font-bold ml-1">days</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Heatmap({
  completed,
  color,
  unavailable,
  onToggle,
  pendingDate,
}: {
  completed: Set<string>;
  color: string;
  unavailable: boolean;
  onToggle: (date: string) => void;
  pendingDate?: string;
}) {
  const today = new Date();
  const todayStr = todayKey();
  const start = new Date(today);
  start.setDate(start.getDate() - 89);

  const days: { date: Date; key: string; done: boolean; future: boolean }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: d,
      key,
      done: completed.has(key),
      future: key > todayStr,
    });
  }

  const cols: typeof days[] = [];
  let current: typeof days = [];
  days.forEach((d, i) => {
    current.push(d);
    if (d.date.getDay() === 6 || i === days.length - 1) {
      cols.push(current);
      current = [];
    }
  });

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-base">Last 90 days</h2>
        <span className="text-xs text-muted uppercase tracking-wide">
          {unavailable ? "—" : `${completed.size} completed`}
        </span>
      </div>
      <div
        className="flex gap-1 overflow-x-auto pb-2"
        role="grid"
        aria-label={`90 day heatmap, ${completed.size} days completed`}
      >
        {cols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const interactive = !day.future && !unavailable;
              const pending = pendingDate === day.key;
              const baseStyle: React.CSSProperties = {
                backgroundColor: day.done ? color : "#252540",
                opacity: day.future ? 0.35 : pending ? 0.6 : 1,
              };
              if (interactive) {
                return (
                  <button
                    type="button"
                    key={day.key}
                    onClick={() => onToggle(day.key)}
                    disabled={pending}
                    title={`${day.key}${day.done ? " — done (click to toggle)" : " — click to mark done"}`}
                    aria-label={`${day.key} ${day.done ? "completed" : "not completed"}`}
                    aria-pressed={day.done}
                    className="h-4 w-4 rounded-sm border border-border cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-surface transition"
                    style={baseStyle}
                  />
                );
              }
              return (
                <div
                  key={day.key}
                  title={day.future ? `${day.key} — future` : day.key}
                  className="h-4 w-4 rounded-sm border border-border"
                  style={baseStyle}
                />
              );
            })}
          </div>
        ))}
      </div>
      {unavailable && (
        <p className="text-xs text-muted mt-3">
          Daily history will appear here once available.
        </p>
      )}
      {!unavailable && (
        <p className="text-xs text-muted mt-3">
          Tip: click any past day to toggle its completion.
        </p>
      )}
    </div>
  );
}
