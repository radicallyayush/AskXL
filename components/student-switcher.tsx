"use client";

import type { ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Select } from "@/components/ui/select";

type StudentOption = {
  student_id: string;
  name: string;
};

type Props = {
  students: StudentOption[];
};

function currentStudentIdFromPath(pathname: string) {
  const match = pathname.match(/^\/students\/([^/]+)$/);
  return match?.[1] ?? "";
}

export function StudentSwitcher({ students }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const currentStudentId = currentStudentIdFromPath(pathname);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStudentId = event.target.value;
    if (!nextStudentId) {
      return;
    }
    router.push(`/students/${nextStudentId}`);
  }

  return (
    <div className="min-w-[320px] flex-1 max-w-3xl">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Select student
      </label>
      <Select
        value={currentStudentId}
        onChange={handleChange}
        className="h-12 rounded-2xl border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 text-slate-700 shadow-sm ring-0"
      >
        <option value="">Choose a student...</option>
        {students.map((student) => (
          <option key={student.student_id} value={student.student_id}>
            {student.name} ({student.student_id})
          </option>
        ))}
      </Select>
    </div>
  );
}
