"use client";

import { useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { ShortlistSidebar } from "@/components/shortlist-sidebar";
import { EmailDraftViewer } from "@/components/email-draft-viewer";

export default function ShortlistPage() {
  const { data: leads = [], isLoading } = useLeads("approved");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first lead if none selected
  const effectiveSelectedId = selectedId ?? leads[0]?.id ?? null;
  const selectedLead = leads.find((l) => l.id === effectiveSelectedId) ?? null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel - Approved leads */}
      <div className="w-[300px] shrink-0 border-r border-border flex flex-col overflow-hidden">
        <ShortlistSidebar
          leads={leads}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          isLoading={isLoading}
        />
      </div>

      {/* Right panel - Email draft */}
      <div className="flex-1 overflow-hidden">
        <EmailDraftViewer lead={selectedLead} />
      </div>
    </div>
  );
}
