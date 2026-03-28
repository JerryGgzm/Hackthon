import { create } from "zustand";

interface TriageState {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
  animatingOutIds: Set<string>;
  addAnimatingOut: (id: string) => void;
  removeAnimatingOut: (id: string) => void;
  cardRefs: Map<string, HTMLElement>;
  registerCardRef: (id: string, el: HTMLElement | null) => void;
}

export const useTriageStore = create<TriageState>((set, get) => ({
  selectedIndex: 0,
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  reset: () => set({ selectedIndex: 0 }),
  animatingOutIds: new Set(),
  addAnimatingOut: (id) =>
    set((state) => {
      const next = new Set(state.animatingOutIds);
      next.add(id);
      return { animatingOutIds: next };
    }),
  removeAnimatingOut: (id) =>
    set((state) => {
      const next = new Set(state.animatingOutIds);
      next.delete(id);
      return { animatingOutIds: next };
    }),
  cardRefs: new Map(),
  registerCardRef: (id, el) => {
    const refs = get().cardRefs;
    if (el) {
      refs.set(id, el);
    } else {
      refs.delete(id);
    }
  },
}));
