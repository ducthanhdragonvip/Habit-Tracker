import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await register(username.trim(), password, email.trim() || undefined);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-card bg-primary shadow-bold-sm mb-3">
            <Flame className="h-7 w-7 text-white" strokeWidth={2.5} />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
            START YOUR STREAK<span className="text-primary">.</span>
          </h1>
          <p className="text-muted text-sm mt-2 text-center">
            Small steps. Big change.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="card p-6 space-y-5"
          style={{ boxShadow: "6px 6px 0px #db2777" }}
        >
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email <span className="text-muted normal-case font-normal">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm text-muted text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
