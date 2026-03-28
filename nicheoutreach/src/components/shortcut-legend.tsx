import { ArrowUp, ArrowDown, CornerDownLeft, Delete } from "lucide-react";

export function ShortcutLegend() {
  return (
    <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-t border-border bg-accent/50 text-xs text-muted-foreground shrink-0">
      <Shortcut icon={<ArrowUp className="h-3 w-3" />} keys={["\u2191"]} label="Previous" />
      <Shortcut icon={<ArrowDown className="h-3 w-3" />} keys={["\u2193"]} label="Next" />
      <Shortcut
        icon={<CornerDownLeft className="h-3 w-3" />}
        keys={["Enter", "\u2192"]}
        label="Approve"
      />
      <Shortcut
        icon={<Delete className="h-3 w-3" />}
        keys={["Backspace", "\u2190"]}
        label="Reject"
      />
    </div>
  );
}

function Shortcut({
  keys,
  label,
}: {
  icon?: React.ReactNode;
  keys: string[];
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded border border-border bg-white text-[10px] font-mono font-medium"
        >
          {key}
        </kbd>
      ))}
      <span>{label}</span>
    </div>
  );
}
