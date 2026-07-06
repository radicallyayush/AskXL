"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { StudentSwitcher } from "@/components/student-switcher";
import { cn } from "@/components/ui/utils";

type StudentOption = {
  student_id: string;
  name: string;
};

type ShellFrameProps = {
  students: StudentOption[];
  children: ReactNode;
};

const navItems: Array<{ href: string; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/chat", label: "AskXL Chat" }
];

export function ShellFrame({ students, children }: ShellFrameProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const sampleProfileHref = students[0] ? `/students/${students[0].student_id}` : "/";
  const navAccent = useMemo(() => (collapsed ? "xl:grid-cols-[5.75rem_minmax(0,1fr)]" : "xl:grid-cols-[20rem_minmax(0,1fr)]"), [collapsed]);
  const showStudentSwitcher = pathname.startsWith("/students/");

  return (
    <div className={cn("min-h-screen xl:grid", navAccent)}>
      <CollapsibleSidebar profileHref={sampleProfileHref} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div className="flex min-h-screen flex-col">
        <header className="border-b border-white/70 bg-white/75 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Welcome back</p>
              <h1 className="text-lg font-semibold text-slate-800 sm:text-2xl">AskXL student intelligence</h1>
            </div>

            {showStudentSwitcher ? <StudentSwitcher students={students} /> : <div className="flex-1" />}

            <div className="flex items-center gap-3 self-start xl:self-auto">
              <span className="rounded-full border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                Student
              </span>
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-sky-100 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] text-sm font-semibold text-sky-700 shadow-sm">
                AY
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-white/70 px-4 py-3 sm:px-6 lg:px-8 xl:hidden">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as any}
                className="whitespace-nowrap rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
            <Link href={sampleProfileHref as any} className="whitespace-nowrap rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              My Profile
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="whitespace-nowrap rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
