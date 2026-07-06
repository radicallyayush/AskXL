"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartProps = {
  programCounts: Record<string, number>;
  cgpaDistribution: Record<string, number>;
  courseAnalytics: Array<{
    course_name: string;
    students: number;
    average_attendance: number;
    average_marks_100: number;
  }>;
};

const palette = ["#2563eb", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#0f766e"];

export function DashboardCharts({ programCounts, cgpaDistribution, courseAnalytics }: ChartProps) {
  const programData = Object.entries(programCounts).map(([name, value]) => ({ name, value }));
  const cgpaData = Object.entries(cgpaDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.06)] xl:col-span-1">
        <CardHeader className="bg-gradient-to-br from-sky-50 via-white to-cyan-50">
          <CardTitle className="text-slate-900">Programs</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={programData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={80} paddingAngle={3}>
                {programData.map((entry, index) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-violet-100 bg-white shadow-[0_10px_30px_rgba(139,92,246,0.06)] xl:col-span-1">
        <CardHeader className="bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
          <CardTitle className="text-slate-900">CGPA distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cgpaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-emerald-100 bg-white shadow-[0_10px_30px_rgba(20,184,166,0.06)] xl:col-span-1">
        <CardHeader className="bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <CardTitle className="text-slate-900">Course averages</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseAnalytics.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course_name" angle={-20} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average_attendance" fill="#14b8a6" radius={[10, 10, 0, 0]} />
              <Bar dataKey="average_marks_100" fill="#f59e0b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
