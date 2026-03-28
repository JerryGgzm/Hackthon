"use client";

import { useLeads } from "@/hooks/use-leads";
import { useTriageStore } from "@/stores/triage-store";
import { useTriageKeyboard } from "@/hooks/use-triage-keyboard";
import { LeadList } from "@/components/lead-list";
import { LeadDetail } from "@/components/lead-detail";
import { ShortcutLegend } from "@/components/shortcut-legend";

export default function TriagePage() {
  const { data: leads = [], isLoading } = useLeads("pending");
  const { selectedIndex, setSelectedIndex } = useTriageStore();

  useTriageKeyboard({
    leads,
    selectedIndex,
    setSelectedIndex,
    enabled: !isLoading,
  });

  const selectedLead = leads[selectedIndex] ?? null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Lead list */}
        <div className="w-[340px] shrink-0 border-r border-border flex flex-col overflow-hidden">
          <LeadList
            leads={leads}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            isLoading={isLoading}
          />
        </div>

        {/* Right panel - Lead detail */}
        <div className="flex-1 overflow-hidden">
          <LeadDetail lead={selectedLead} />
        </div>
      </div>

      <ShortcutLegend />
    </div>
  );
}
