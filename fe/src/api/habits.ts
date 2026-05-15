import { authApi, TOKEN_KEYS } from "./auth";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface HabitToday extends Habit {
  completed_today: boolean;
  current_streak: number;
}

export interface HabitInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
}

export interface CheckResponse {
  id: string;
  date: string;
  completed_today: boolean;
  current_streak: number;
}

export interface LogDayResponse {
  date: string;
  completed: boolean;
  current_streak: number;
}

export interface HabitLog {
  id: string;
  habit: string;
  date: string;
  completed_at: string;
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

async function doFetch(path: string, init: RequestInit | undefined, token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { ...init, headers });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let token = localStorage.getItem(TOKEN_KEYS.access);
  let res = await doFetch(path, init, token);

  if (res.status === 401) {
    const refresh = localStorage.getItem(TOKEN_KEYS.refresh);
    if (refresh) {
      try {
        const { access } = await authApi.refresh(refresh);
        localStorage.setItem(TOKEN_KEYS.access, access);
        token = access;
        res = await doFetch(path, init, token);
      } catch {
        if (onUnauthorized) onUnauthorized();
        throw new Error("Session expired. Please log in again.");
      }
    }
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error("Unauthorized");
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const habitsApi = {
  today: () => request<HabitToday[]>("/api/habits/today/"),
  list: () => request<Habit[]>("/api/habits/"),
  get: (id: string) => request<Habit>(`/api/habits/${id}/`),
  streak: (id: string) => request<Streak>(`/api/habits/${id}/streak/`),
  logs: (id: string, since?: string) =>
    request<HabitLog[]>(
      `/api/habits/${id}/logs/${since ? `?since=${since}` : ""}`
    ),
  create: (data: HabitInput) =>
    request<Habit>("/api/habits/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<HabitInput>) =>
    request<Habit>(`/api/habits/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/api/habits/${id}/`, { method: "DELETE" }),
  check: (id: string) =>
    request<CheckResponse>(`/api/habits/${id}/check/`, { method: "POST" }),
  logDay: (id: string, date: string) =>
    request<LogDayResponse>(`/api/habits/${id}/log/`, {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
};

export interface DashboardHabitSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  current_streak: number;
  completed_today: boolean;
}

export interface DashboardResponse {
  total_habits: number;
  completed_today: number;
  completion_rate_today: number;
  best_current_streak: number;
  habits_summary: DashboardHabitSummary[];
}

export const dashboardApi = {
  get: () => request<DashboardResponse>("/api/dashboard/"),
};
