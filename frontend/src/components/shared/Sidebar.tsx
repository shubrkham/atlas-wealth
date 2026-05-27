"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
  { label: "Risk", href: "/risk", icon: ShieldAlert },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-surface">
      <div className="flex h-[60px] items-center border-b border-white/5 px-6">
        <span className="text-xl font-bold tracking-tight text-[#D4AF37]">
          Kadam Capital
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-card text-[#F4F6F9]"
                  : "text-[#A3ADC2] hover:bg-card/60 hover:text-[#F4F6F9]",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-[#D4AF37]" : "text-[#A3ADC2]",
                )}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}