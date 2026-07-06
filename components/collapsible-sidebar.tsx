"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/components/ui/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  tone: string;
};

type SidebarProps = {
  profileHref: string;
  collapsed: boolean;
  onToggle: () => void;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "◫", tone: "from-sky-500 to-cyan-400" },
  { href: "/chat", label: "AskXL Chat", icon: "◈", tone: "from-violet-500 to-fuchsia-400" },
  { href: "/students/S001", label: "My Profile", icon: "◌", tone: "from-emerald-500 to-teal-400" }
];

export function CollapsibleSidebar({ profileHref, collapsed, onToggle }: SidebarProps) {
  const items = navItems.map((item) => ({
    ...item,
    href: item.label === "My Profile" ? profileHref : item.href
  }));

  return (
    <aside
      className={cn(
        "hidden flex-col overflow-hidden border-r border-white/40 bg-gradient-to-b from-[#f8fbff] via-[#f7f9ff] to-[#eef3ff] shadow-[8px_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl transition-[width] duration-300 xl:sticky xl:top-0 xl:flex xl:h-screen",
        collapsed ? "w-[5.75rem]" : "w-[20rem]"
      )}
    >
      <div className="flex h-24 items-center justify-between border-b border-white/70 px-4">
        <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed && "justify-center gap-0")}>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#2450b8] via-[#325fd1] to-[#6b7dff] text-xl font-bold text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)]">
            XL
          </div>
          <div className={cn("leading-tight transition-all duration-300", collapsed && "w-0 overflow-hidden opacity-0")}>
            <p className="text-3xl font-semibold tracking-tight text-[#214a9b]">ERP</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AskXL</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="grid h-11 w-11 place-items-center rounded-full border border-sky-100 bg-white text-sky-700 shadow-sm transition-all hover:scale-105 hover:bg-sky-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href as any}
              className={cn(
                "group flex items-center rounded-2xl border border-transparent px-4 py-4 font-medium text-slate-700 transition-all duration-200 hover:border-white/80 hover:bg-white/75 hover:shadow-[0_8px_20px_rgba(59,130,246,0.08)]",
                collapsed ? "justify-center gap-0 text-sm" : "gap-3 text-lg"
              )}
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white shadow-sm", item.tone)}>
                {item.icon}
              </span>
              <span className={cn("transition-all duration-300", collapsed && "w-0 overflow-hidden opacity-0")}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/70 bg-white/45 p-4">
        <p className={cn("text-xs uppercase tracking-[0.24em] text-slate-400 transition-all duration-300", collapsed && "w-0 overflow-hidden opacity-0")}>File-based data</p>
        <p className={cn("mt-2 text-sm text-slate-600 transition-all duration-300", collapsed && "w-0 overflow-hidden opacity-0")}>
          Generated JSON only. CSV sources stay in input/.
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
