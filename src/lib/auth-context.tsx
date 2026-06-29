"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface StoredUser extends User {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("skyvoyage_session");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("skyvoyage_session");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const users: StoredUser[] = JSON.parse(localStorage.getItem("skyvoyage_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return false;
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("skyvoyage_session", JSON.stringify(userData));
    return true;
  }, []);

  const register = useCallback(async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const users: StoredUser[] = JSON.parse(localStorage.getItem("skyvoyage_users") || "[]");
    if (users.some((u) => u.email === email)) return false;
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      password,
    };
    users.push(newUser);
    localStorage.setItem("skyvoyage_users", JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem("skyvoyage_session", JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("skyvoyage_session");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
