"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentRecord } from "@/lib/types";

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
          <CardTitle>Attendance by course</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#334155" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Marks by course</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#64748b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
