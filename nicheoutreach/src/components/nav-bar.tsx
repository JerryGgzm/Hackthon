"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LayoutDashboard, Mail } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animation-store";
import { springBouncy } from "@/lib/motion";

const navItems = [
  { href: "/", label: "Context Input", icon: Search },
  { href: "/triage", label: "Triage", icon: LayoutDashboard },
  { href: "/shortlist", label: "Shortlist", icon: Mail },
];

export function NavBar() {
  const pathname = usePathname();
  const shortlistIconRef = useRef<HTMLDivElement>(null);
  const wobbleControls = useAnimationControls();
  const wobbleTrigger = useAnimationStore((s) => s.wobbleTrigger);
  const setShortlistIconRect = useAnimationStore((s) => s.setShortlistIconRect);

  // Measure shortlist icon position
  const measureShortlistIcon = useCallback(() => {
    if (shortlistIconRef.current) {
      setShortlistIconRect(shortlistIconRef.current.getBoundingClientRect());
    }
  }, [setShortlistIconRect]);

  useEffect(() => {
    measureShortlistIcon();
    window.addEventListener("resize", measureShortlistIcon);
    return () => window.removeEventListener("resize", measureShortlistIcon);
  }, [measureShortlistIcon]);

  // Wobble animation on trigger
  useEffect(() => {
    if (wobbleTrigger > 0) {
      wobbleControls.start({
        scale: [1, 1.3, 0.85, 1.15, 0.95, 1],
        transition: { ...springBouncy, duration: 0.6 },
      });
    }
  }, [wobbleTrigger, wobbleControls]);

  return (
    <nav className="glass-nav sticky top-0 z-50 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-8">
          <span className="text-lg font-semibold text-foreground tracking-tight">
            NicheOutreach
          </span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isShortlist = item.href === "/shortlist";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {isShortlist ? (
                    <motion.div
                      ref={shortlistIconRef}
                      animate={wobbleControls}
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <item.icon className="h-4 w-4" />
                  )}
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 -bottom-[9px] h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
