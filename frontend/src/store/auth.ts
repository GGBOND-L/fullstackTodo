import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  token: string;
  user: User | null;
  isLogin: boolean;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      user: null,
      isLogin: false,

      login: ({ token, user }) =>
        set({
          token,
          user,
          isLogin: true,
        }),

      logout: () =>
        set({
          token: "",
          user: null,
          isLogin: false,
        }),
    }),
    {
      name: "todo-auth",
    },
  ),
);
