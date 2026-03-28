import { create } from "zustand";

interface FlyItem {
  id: string;
  channelName: string;
  sourceRect: DOMRect;
  score: number;
}

interface AnimationState {
  flyQueue: FlyItem[];
  shortlistIconRect: DOMRect | null;
  wobbleTrigger: number;
  enqueueFly: (item: FlyItem) => void;
  dequeueFly: (id: string) => void;
  setShortlistIconRect: (rect: DOMRect | null) => void;
  triggerWobble: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  flyQueue: [],
  shortlistIconRect: null,
  wobbleTrigger: 0,
  enqueueFly: (item) =>
    set((state) => ({ flyQueue: [...state.flyQueue, item] })),
  dequeueFly: (id) =>
    set((state) => ({ flyQueue: state.flyQueue.filter((f) => f.id !== id) })),
  setShortlistIconRect: (rect) => set({ shortlistIconRect: rect }),
  triggerWobble: () =>
    set((state) => ({ wobbleTrigger: state.wobbleTrigger + 1 })),
}));
