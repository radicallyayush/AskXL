"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentRecord } from "@/lib/types";

const chartTickStyle = { fill: "#cbd5e1", fontSize: 12 };
const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f172a",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "16px",
    color: "#e2e8f0"
  },
  labelStyle: { color: "#f8fafc", fontWeight: 600 },
  itemStyle: { color: "#cbd5e1" }
};

export function StudentCharts({ student }: { student: StudentRecord }) {
  const attendanceData = student.attendance.by_course.map((entry) => ({
    name: entry.course_name || entry.course_id,
    value: entry.attendance_pct
  }));
  const gradeData = student.grades.map((grade) => ({
    name: grade.course_name || grade.course_id,
    value: grade.total_marks_100
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Attendance by course</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} interval={0} tick={chartTickStyle} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} {...chartTooltipStyle} />
              <Bar dataKey="value" fill="#60a5fa" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Marks by course</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} interval={0} tick={chartTickStyle} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={false} />
              <YAxis tick={chartTickStyle} axisLine={{ stroke: "rgba(148, 163, 184, 0.35)" }} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} {...chartTooltipStyle} />
              <Bar dataKey="value" fill="#818cf8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
