import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import ColorPicker, { HABIT_COLORS } from "../components/ColorPicker";
import { habitsApi, type HabitInput } from "../api/habits";

const ICONS = ["✨", "💧", "📚", "🏃", "🧘", "🥗", "💤", "🎯", "🔥", "💪", "🎨", "🎵"];

export default function NewEditHabit() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<HabitInput>({
    name: "",
    description: "",
    color: HABIT_COLORS[0],
    icon: "✨",
  });

  const { data: existing } = useQuery({
    queryKey: ["habits", id],
    queryFn: () => habitsApi.get(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description || "",
        color: existing.color,
        icon: existing.icon || "✨",
      });
    }
  }, [existing]);

  const save = useMutation({
    mutationFn: (data: HabitInput) =>
      isEdit ? habitsApi.update(id!, data) : habitsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      navigate("/");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    save.mutate({ ...form, name: form.name.trim() });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-xl sm:text-2xl font-extrabold">
        {isEdit ? "Edit habit" : "New habit"}<span className="text-primary">.</span>
      </h1>

      <form onSubmit={onSubmit} className="card p-6 space-y-5">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            className="input"
            placeholder="Drink 2L of water"
            maxLength={200}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input min-h-[88px] resize-y"
            placeholder="Optional — why does this matter to you?"
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <span className="label">Color</span>
          <ColorPicker value={form.color} onChange={(c) => setForm({ ...form, color: c })} />
        </div>

        <div>
          <span className="label">Icon</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon">
            {ICONS.map((ic) => {
              const selected = form.icon === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`h-11 w-11 rounded-btn border-2 text-xl flex items-center justify-center transition-transform active:translate-y-0.5 ${
                    selected
                      ? "border-primary bg-surface-2 shadow-bold-sm"
                      : "border-border bg-surface-2 hover:border-primary"
                  }`}
                >
                  {ic}
                </button>
              );
            })}
          </div>
        </div>

        {save.isError && (
          <p className="text-danger text-sm">{(save.error as Error).message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={save.isPending || !form.name.trim()}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {save.isPending ? "Saving..." : isEdit ? "Save changes" : "Create habit"}
          </button>
          <Link to="/" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
