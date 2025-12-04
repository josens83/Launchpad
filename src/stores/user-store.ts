import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, PlanType } from "@/types";

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updatePlan: (plan: PlanType) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      updatePlan: (plan) =>
        set((state) => ({
          user: state.user ? { ...state.user, plan } : null,
        })),
      completeOnboarding: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, onboarding_completed: true }
            : null,
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
