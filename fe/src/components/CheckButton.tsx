import { Check } from "lucide-react";

interface Props {
  checked: boolean;
  loading?: boolean;
  onClick: () => void;
}

export default function CheckButton({ checked, loading, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={checked}
      aria-label={checked ? "Mark as not done" : "Mark as done"}
      className={`relative h-12 w-12 rounded-btn border-2 transition-all flex items-center justify-center ${
        checked
          ? "bg-success border-success shadow-[2px_2px_0px_#16a34a]"
          : "bg-surface-2 border-border hover:border-primary"
      } ${loading ? "opacity-60 cursor-wait" : "active:translate-y-0.5"}`}
    >
      {checked && <Check className="h-7 w-7 text-white animate-pop" strokeWidth={3.5} />}
    </button>
  );
}
