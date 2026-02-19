import { create } from "zustand";

export type UserRole = "CITIZEN" | "POLICE" | "SUPERIOR" | "JUDICIARY";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  policeId?: string;
  stationName?: string;
  rank?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Rehydrate from localStorage
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  login: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
