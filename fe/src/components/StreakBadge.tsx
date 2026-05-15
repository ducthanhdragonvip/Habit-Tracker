import { Flame } from "lucide-react";

interface Props {
  count: number;
  size?: "sm" | "md" | "lg";
}

export default function StreakBadge({ count, size = "md" }: Props) {
  const dims =
    size === "lg"
      ? "px-4 py-2 text-lg"
      : size === "sm"
        ? "px-2 py-0.5 text-xs"
        : "px-3 py-1 text-sm";
  const iconSize = size === "lg" ? 22 : size === "sm" ? 14 : 16;
  const active = count > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-btn font-bold ${dims} ${
        active
          ? "bg-primary text-white shadow-bold-sm"
          : "bg-surface-2 text-muted border-2 border-border"
      }`}
      aria-label={`${count} day streak`}
    >
      <Flame size={iconSize} strokeWidth={2.5} />
      {count}
    </span>
  );
}
