"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LayoutDashboard, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Context Input", icon: Search },
  { href: "/triage", label: "Triage", icon: LayoutDashboard },
  { href: "/shortlist", label: "Shortlist", icon: Mail },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-8">
          <span className="text-lg font-semibold text-foreground tracking-tight">
            NicheOutreach
          </span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
