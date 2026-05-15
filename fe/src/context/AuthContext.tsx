import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, TOKEN_KEYS, type AuthUser } from "../api/auth";
import { setUnauthorizedHandler } from "../api/habits";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEYS.access)
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(TOKEN_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });
  const [initialized, setInitialized] = useState(false);

  const logout = useMemo(
    () => () => {
      localStorage.removeItem(TOKEN_KEYS.access);
      localStorage.removeItem(TOKEN_KEYS.refresh);
      localStorage.removeItem(TOKEN_KEYS.user);
      setToken(null);
      setUser(null);
    },
    []
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(TOKEN_KEYS.access);
    if (!stored) {
      setInitialized(true);
      return;
    }
    authApi
      .me(stored)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(u));
      })
      .catch(() => {
        // token may have expired — habits request handler will refresh; do nothing here
      })
      .finally(() => {
        if (!cancelled) setInitialized(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistAuth = (access: string, refresh: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEYS.access, access);
    localStorage.setItem(TOKEN_KEYS.refresh, refresh);
    localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(u));
    setToken(access);
    setUser(u);
  };

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    persistAuth(res.access, res.refresh, res.user);
  };

  const register = async (username: string, password: string, email?: string) => {
    const res = await authApi.register(username, password, email);
    persistAuth(res.access, res.refresh, res.user);
  };

  const value: AuthContextValue = {
    user,
    token,
    initialized,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
