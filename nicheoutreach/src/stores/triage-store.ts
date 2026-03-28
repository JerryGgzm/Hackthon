import { create } from "zustand";

interface TriageState {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

export const useTriageStore = create<TriageState>((set) => ({
  selectedIndex: 0,
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  reset: () => set({ selectedIndex: 0 }),
}));
