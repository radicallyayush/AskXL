"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { searchStudents } from "@/lib/search";
import type { Metadata, StudentRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  students: StudentRecord[];
  metadata: Metadata;
};

function sortByName(students: StudentRecord[]) {
  return [...students].sort((left, right) => left.name.localeCompare(right.name));
}

export function StudentTable({ students, metadata }: Props) {
  const sortedStudents = useMemo(() => sortByName(students), [students]);
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("");
  const [attendance, setAttendance] = useState("0");
  const [studentId, setStudentId] = useState("");

  const filteredStudents = useMemo(() => {
    let result = query ? searchStudents(sortedStudents, query) : sortedStudents;
    result = result.filter((student) => (program ? student.program === program : true));
    result = result.filter((student) => student.attendance.overall_pct >= Number(attendance));
    result = result.filter((student) => (studentId ? student.student_id === studentId : true));
    return result;
  }, [sortedStudents, query, program, attendance, studentId]);

  const selectedStudent = filteredStudents[0];

  const recentProjects = useMemo(
    () =>
      sortByName(students)
        .flatMap((student) =>
          student.projects.map((project) => ({
            student_id: student.student_id,
            student_name: student.name,
            title: project.title,
            course_name: project.course_name,
            summary: project.summary
          }))
        )
        .slice(0, 5),
    [students]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <Card className="overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.06)]">
        <CardHeader className="space-y-5 border-b border-sky-50 bg-gradient-to-br from-sky-50 via-white to-violet-50">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Search students</p>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, skill, project, course..."
                className="h-12 rounded-2xl border-sky-100 bg-white/90"
              />
            </div>
            <div className="min-w-[200px]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">Student</p>
              <Select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="h-12 rounded-2xl border-violet-100 bg-white/90"
              >
                <option value="">All students</option>
                {sortedStudents.map((student) => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.name} ({student.student_id})
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[180px]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Program</p>
              <Select value={program} onChange={(event) => setProgram(event.target.value)} className="h-12 rounded-2xl border-emerald-100 bg-white/90">
                <option value="">All programs</option>
                {Object.keys(metadata.program_counts).map((programName) => (
                  <option key={programName} value={programName}>
                    {programName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[180px]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Attendance</p>
              <Select value={attendance} onChange={(event) => setAttendance(event.target.value)} className="h-12 rounded-2xl border-amber-100 bg-white/90">
                <option value="0">Any attendance</option>
                <option value="80">80%+</option>
                <option value="85">85%+</option>
                <option value="90">90%+</option>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl text-slate-900">{filteredStudents.length} students match the current filters</CardTitle>
            <p className="text-sm text-slate-500">Click a name to open the profile view</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gradient-to-r from-sky-50 to-violet-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">CGPA</th>
                  <th className="px-6 py-4 font-semibold">Attendance</th>
                  <th className="px-6 py-4 font-semibold">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 14).map((student) => {
                  const isSelected = selectedStudent?.student_id === student.student_id;
                  return (
                    <tr key={student.student_id} className={isSelected ? "bg-[#eef2ff]/70" : "bg-white"}>
                      <td className="px-6 py-4 align-top">
                        <Link href={`/students/${student.student_id}`} className="font-semibold text-slate-900 hover:text-[#4f46e5] hover:underline">
                          {student.name}
                        </Link>
                        <div className="mt-1 text-xs text-slate-500">{student.student_id}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-slate-700">{student.program}</td>
                      <td className="px-6 py-4 align-top text-slate-700">{student.cgpa.toFixed(2)}</td>
                      <td className="px-6 py-4 align-top text-slate-700">{student.attendance.overall_pct.toFixed(1)}%</td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {student.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} className="border-slate-200 bg-white text-slate-600">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Selected student</p>
            <CardTitle className="text-2xl text-slate-900">{selectedStudent?.name ?? "No student found"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {selectedStudent ? (
              <>
                <div className="grid grid-cols-[5.5rem_1fr] gap-4">
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-sky-100 via-violet-100 to-cyan-100 text-lg font-semibold text-slate-600">
                    {selectedStudent.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-semibold text-slate-900">{selectedStudent.name}</h3>
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Open</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{selectedStudent.student_id} · {selectedStudent.program}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge className="border-slate-200 bg-slate-50 text-slate-700">CGPA {selectedStudent.cgpa.toFixed(2)}</Badge>
                      <Badge className="border-slate-200 bg-slate-50 text-slate-700">Attendance {selectedStudent.attendance.overall_pct.toFixed(1)}%</Badge>
                      <Badge className="border-slate-200 bg-slate-50 text-slate-700">Projects {selectedStudent.projects.length}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">Courses</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-700">{selectedStudent.analytics.course_count}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Projects</p>
                    <p className="mt-2 text-2xl font-semibold text-violet-700">{selectedStudent.analytics.project_count}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedStudent.skills.length ? (
                      selectedStudent.skills.map((skill) => (
                        <Badge key={skill} className="border-slate-200 bg-white text-slate-600">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No inferred skills yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Recent project</p>
                  {selectedStudent.projects[0] ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{selectedStudent.projects[0].title}</p>
                      <p className="mt-1 text-sm text-slate-600">{selectedStudent.projects[0].course_name}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{selectedStudent.projects[0].summary}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No project mapping available for this student.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No student matches the current filters. Clear one filter to broaden the result set.</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
            <CardTitle className="text-xl text-slate-900">Recent projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {recentProjects.map((project) => (
              <div key={`${project.student_id}-${project.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{project.course_name}</p>
                  </div>
                  <Badge className="border-slate-200 bg-white text-slate-500">Project</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-500">{project.student_name}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
