import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserContext, UserContextCreate } from "@/types";

export function useLatestContext() {
  return useQuery<UserContext | null>({
    queryKey: ["context", "latest"],
    queryFn: async () => {
      const res = await fetch("/api/context");
      if (!res.ok) throw new Error("Failed to fetch context");
      const json = await res.json();
      return json.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ctx: UserContextCreate) => {
      const res = await fetch("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ctx),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save context");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["context"] });
    },
  });
}
