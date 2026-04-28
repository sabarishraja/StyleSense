import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface OnboardingState {
  seen: boolean;
  checking: boolean;
  checkSeen: (userId: string) => Promise<void>;
  markSeen: (userId: string) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  seen: false,
  checking: true,

  checkSeen: async (userId: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      const meta = data?.user?.user_metadata || {};
      set({ seen: meta.onboarding_seen === true, checking: false });
    } catch {
      set({ seen: false, checking: false });
    }
  },

  markSeen: async (_userId: string) => {
    set({ seen: true });
    try {
      await supabase.auth.updateUser({
        data: { onboarding_seen: true },
      });
    } catch {
      // non-critical — worst case they see onboarding again next session
    }
  },
}));
