import Link from "next/link";
import { notFound } from "next/navigation";

import { StudentCharts } from "@/components/student-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentById, getStudents } from "@/lib/data";
import { summarizeStudent } from "@/lib/summary";

type PageProps = {
  params: { studentId: string };
};

export function generateStaticParams() {
  return getStudents().map((student) => ({ studentId: student.student_id }));
}

export default function StudentProfilePage({ params }: PageProps) {
  const { studentId } = params;
  const student = getStudentById(studentId);

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
          <CardHeader className="border-b border-sky-50 bg-gradient-to-br from-sky-50 via-white to-violet-50">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-500">Student Profile</p>
            <CardTitle className="text-4xl">{student.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-7 text-slate-600">{summarizeStudent(student)}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-sky-100 bg-sky-50 text-sky-700">{student.student_id}</Badge>
              <Badge className="border-violet-100 bg-violet-50 text-violet-700">{student.program}</Badge>
              <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">Term {student.term}</Badge>
              <Badge className="border-amber-100 bg-amber-50 text-amber-700">CGPA {student.cgpa.toFixed(2)}</Badge>
              <Badge className="border-rose-100 bg-rose-50 text-rose-700">Attendance {student.attendance.overall_pct.toFixed(1)}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-violet-100 bg-white shadow-[0_10px_30px_rgba(139,92,246,0.08)]">
          <CardHeader className="border-b border-violet-50 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-slate-600">{summarizeStudent(student)}</p>
            <Link href={`/chat?q=${encodeURIComponent(`Summarize ${student.name}.`)}`} className="inline-flex rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-medium text-white shadow-sm">
              Open in AskXL
            </Link>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white">
          <CardHeader><CardTitle>Courses</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold text-sky-700">{student.analytics.course_count}</p></CardContent>
        </Card>
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold text-violet-700">{student.analytics.project_count}</p></CardContent>
        </Card>
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader><CardTitle>Attendance</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold text-emerald-700">{student.attendance.overall_pct.toFixed(1)}%</p></CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader><CardTitle>Marks</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold text-amber-700">{student.analytics.average_marks_100.toFixed(1)}</p></CardContent>
        </Card>
      </div>

      <StudentCharts student={student} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.06)]">
          <CardHeader className="border-b border-sky-50 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
            <CardTitle>Academic history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Attendance</th>
                  <th className="py-3 pr-4 font-medium">Grade</th>
                  <th className="py-3 pr-4 font-medium">Marks</th>
                </tr>
              </thead>
              <tbody>
                {student.courses.map((course) => (
                  <tr key={course.course_id} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{course.course_name}</div>
                      <div className="text-xs text-muted-foreground">{course.instructor}</div>
                    </td>
                    <td className="py-3 pr-4">{course.attendance_pct.toFixed(1)}%</td>
                    <td className="py-3 pr-4">{course.grade || "N/A"}</td>
                    <td className="py-3 pr-4">{course.marks_100 ? course.marks_100.toFixed(1) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-100 bg-white shadow-[0_10px_30px_rgba(20,184,166,0.06)]">
          <CardHeader className="border-b border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {student.skills.length ? student.skills.map((skill) => <Badge key={skill} className="border-emerald-100 bg-emerald-50 text-emerald-700">{skill}</Badge>) : <p className="text-sm text-slate-500">No inferred skills yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-violet-100 bg-white shadow-[0_10px_30px_rgba(139,92,246,0.06)]">
          <CardHeader className="border-b border-violet-50 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.projects.length ? (
              student.projects.map((project) => (
                <div key={project.file} className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-4">
                  <p className="font-medium">{project.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{project.course_name}</p>
                  <p className="mt-3 text-xs text-slate-500">{project.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No sample project mapping found for this student.</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-amber-100 bg-white shadow-[0_10px_30px_rgba(245,158,11,0.06)]">
          <CardHeader className="border-b border-amber-50 bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <CardTitle>Grade details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.grades.map((grade) => (
              <div key={`${grade.course_id}-${grade.letter_grade}`} className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{grade.course_name}</p>
                  <Badge className="border-amber-100 bg-amber-50 text-amber-700">{grade.letter_grade}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{grade.total_marks_100.toFixed(1)} / 100</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
