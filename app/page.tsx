import { DashboardCharts } from "@/components/dashboard-charts";
import { StudentTable } from "@/components/student-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMetadata, getStudents } from "@/lib/data";

export default function HomePage() {
  const students = getStudents();
  const metadata = getMetadata();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-sky-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
          <CardHeader className="space-y-4 border-b border-sky-50 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">XLRI Student Intelligence</p>
            <CardTitle className="max-w-3xl text-4xl leading-tight text-slate-900 sm:text-5xl">Good afternoon, your academic snapshot is ready.</CardTitle>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              AskXL turns the CSV sources into clean JSON so you can explore students, projects, attendance, and performance in one place.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 p-8 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total students", value: `${metadata.total_students}`, detail: "Loaded from generated JSON" },
              { label: "Average CGPA", value: `${metadata.average_cgpa.toFixed(2)}`, detail: "Computed from student records" },
              { label: "Attendance avg", value: `${metadata.attendance_statistics.average.toFixed(1)}%`, detail: "Roll-up across attendance rows" },
              { label: "Projects", value: `${metadata.project_analytics.length}`, detail: "Sample project groups discovered" }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-4 shadow-[0_8px_24px_rgba(59,130,246,0.05)]"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(135deg, rgba(219,234,254,0.9), rgba(255,255,255,0.95))"
                      : index === 1
                        ? "linear-gradient(135deg, rgba(237,233,254,0.9), rgba(255,255,255,0.95))"
                        : index === 2
                          ? "linear-gradient(135deg, rgba(204,251,241,0.9), rgba(255,255,255,0.95))"
                          : "linear-gradient(135deg, rgba(254,243,199,0.9), rgba(255,255,255,0.95))",
                  borderColor:
                    index === 0 ? "rgba(191,219,254,0.9)" : index === 1 ? "rgba(221,214,254,0.9)" : index === 2 ? "rgba(153,246,228,0.9)" : "rgba(253,224,71,0.75)"
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{stat.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-violet-100 bg-white shadow-[0_10px_30px_rgba(139,92,246,0.08)]">
          <CardHeader className="border-b border-violet-50 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6">
            <CardTitle className="text-2xl text-slate-900">Quick facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-500">Program mix</p>
              <div className="mt-3 space-y-2">
                {Object.entries(metadata.program_counts)
                  .slice(0, 4)
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{name}</span>
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Median CGPA</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metadata.median_cgpa.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">Students</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metadata.total_students}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <DashboardCharts
        programCounts={metadata.program_counts}
        cgpaDistribution={metadata.cgpa_distribution}
        courseAnalytics={metadata.course_analytics}
      />

      <StudentTable students={students} metadata={metadata} />
    </div>
  );
}
