const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = JSON.parse(text);
      if (typeof j === "object" && j) {
        const parts: string[] = [];
        for (const k of Object.keys(j)) {
          const v = (j as Record<string, unknown>)[k];
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
          else parts.push(`${k}: ${String(v)}`);
        }
        if (parts.length) msg = parts.join(" | ");
      }
    } catch {
      if (text) msg = `${msg}: ${text}`;
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  register: (username: string, password: string, email?: string) =>
    authRequest<AuthResponse>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, password, email: email || "" }),
    }),
  login: (username: string, password: string) =>
    authRequest<AuthResponse>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  refresh: (refreshToken: string) =>
    authRequest<{ access: string }>("/api/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    }),
  me: (token: string) =>
    authRequest<AuthUser>("/api/auth/me/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
};

export const TOKEN_KEYS = {
  access: "habit_access",
  refresh: "habit_refresh",
  user: "habit_user",
} as const;
