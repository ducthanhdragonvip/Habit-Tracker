import { Check } from "lucide-react";

export const HABIT_COLORS = [
  "#db2777",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#0891b2",
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color">
      {HABIT_COLORS.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c)}
            className={`h-11 w-11 rounded-btn border-2 transition-transform active:translate-y-0.5 flex items-center justify-center ${
              selected ? "border-ink shadow-bold-sm" : "border-border"
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          >
            {selected && <Check className="h-5 w-5 text-white" strokeWidth={3.5} />}
          </button>
        );
      })}
    </div>
  );
}
