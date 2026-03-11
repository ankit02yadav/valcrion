import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthContextType } from "../types";
import { AuthDB, clearToken } from "../db";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on page load
    const stored = localStorage.getItem("vl_session");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("vl_session"); }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await AuthDB.login(email, password);
      setUser(user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
