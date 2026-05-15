import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAuthed = !!token;
  const onAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b-2 border-border bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <Link to={isAuthed ? "/" : "/login"} className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-card bg-primary shadow-bold-sm">
            <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight truncate">
            HABIT<span className="text-primary">.</span>TRACKER
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthed ? (
            <>
              {pathname !== "/dashboard" && (
                <Link
                  to="/dashboard"
                  className="btn-ghost text-sm hidden sm:inline-flex"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              )}
              {pathname !== "/habits/new" && (
                <Link to="/habits/new" className="btn-primary text-sm hidden sm:inline-flex">
                  + New Habit
                </Link>
              )}
              {user && (
                <span
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-btn bg-surface-2 border-2 border-border text-xs font-bold uppercase tracking-wide"
                  title={user.username}
                >
                  {user.username}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost text-sm"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            !onAuthPage && (
              <Link to="/login" className="btn-primary text-sm">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
