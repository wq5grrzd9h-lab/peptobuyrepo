"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "peptobuy-user";
const SESSION_KEY = "peptobuy-user-session";

function loadStoredUser(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser, remember: boolean) {
  const json = JSON.stringify(user);
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, json);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, json);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* storage unavailable */ }
}

function removeUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadStoredUser());
    setHydrated(true);
  }, []);

  const login = useCallback(
    async (email: string, _password: string, remember: boolean) => {
      await new Promise((r) => setTimeout(r, 1300));
      // Derive a display name from the email prefix
      const prefix = email.split("@")[0].replace(/[._\-+]/g, " ");
      const parts = prefix.split(" ").filter(Boolean);
      const u: AuthUser = {
        id: `user_${Date.now()}`,
        firstName: parts[0]
          ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
          : "User",
        lastName: parts[1]
          ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
          : "",
        email,
        createdAt: new Date().toISOString(),
      };
      persistUser(u, remember);
      setUser(u);
    },
    []
  );

  const signup = useCallback(async (data: SignupData) => {
    await new Promise((r) => setTimeout(r, 1400));
    const u: AuthUser = {
      id: `user_${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    persistUser(u, true); // always remember on signup
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    removeUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hydrated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
