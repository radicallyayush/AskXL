import type { ReactNode } from "react";
import { ShellFrame } from "@/components/shell-frame";
import { getStudents } from "@/lib/data";

export function AppShell({ children }: { children: ReactNode }) {
  const students = getStudents();

  return <ShellFrame students={students}>{children}</ShellFrame>;
}
