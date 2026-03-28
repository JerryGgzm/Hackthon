import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { YoutubeLead, LeadStatus } from "@/types";

export function useLeads(status: LeadStatus) {
  return useQuery<YoutubeLead[]>({
    queryKey: ["leads", status],
    queryFn: async () => {
      const res = await fetch(`/api/leads?status=${status}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      const json = await res.json();
      return json.data ?? [];
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update lead");
      }
      return res.json();
    },
    // Optimistic update: remove from pending list immediately
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads", "pending"] });
      await queryClient.cancelQueries({ queryKey: ["leads", status] });

      const previousPending = queryClient.getQueryData<YoutubeLead[]>([
        "leads",
        "pending",
      ]);

      // Remove from pending
      queryClient.setQueryData<YoutubeLead[]>(["leads", "pending"], (old) =>
        old ? old.filter((lead) => lead.id !== id) : []
      );

      // Add to target list if approved
      if (status === "approved" && previousPending) {
        const movedLead = previousPending.find((l) => l.id === id);
        if (movedLead) {
          queryClient.setQueryData<YoutubeLead[]>(
            ["leads", "approved"],
            (old) => {
              const updated = { ...movedLead, status: "approved" as const };
              return old ? [updated, ...old] : [updated];
            }
          );
        }
      }

      return { previousPending };
    },
    onError: (_err, _vars, rollbackCtx) => {
      if (rollbackCtx?.previousPending) {
        queryClient.setQueryData(
          ["leads", "pending"],
          rollbackCtx.previousPending
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
