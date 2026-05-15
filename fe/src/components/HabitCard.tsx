import { Link } from "react-router-dom";
import StreakBadge from "./StreakBadge";
import CheckButton from "./CheckButton";
import type { HabitToday } from "../api/habits";

interface Props {
  habit: HabitToday;
  onToggle: () => void;
  toggling?: boolean;
}

export default function HabitCard({ habit, onToggle, toggling }: Props) {
  const checked = habit.completed_today;
  return (
    <div
      className={`card relative overflow-hidden p-5 flex flex-col gap-4 transition-opacity ${
        checked ? "opacity-80" : ""
      }`}
      style={{ boxShadow: `4px 4px 0px ${habit.color}` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: habit.color }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <Link to={`/habits/${habit.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-btn text-2xl border-2 border-border shrink-0"
            style={{ backgroundColor: habit.color + "22" }}
          >
            {habit.icon || "✨"}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-base truncate">{habit.name}</h3>
            {habit.description && (
              <p className="text-xs text-muted line-clamp-2 mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
        </Link>
        <CheckButton checked={checked} loading={toggling} onClick={onToggle} />
      </div>
      <div className="flex items-center justify-between pl-2">
        <StreakBadge count={habit.current_streak} />
        <Link
          to={`/habits/${habit.id}`}
          className="text-xs text-muted uppercase tracking-wide hover:text-ink"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
