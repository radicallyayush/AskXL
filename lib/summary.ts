import type { StudentRecord } from "./types";

export function summarizeStudent(student: StudentRecord) {
  const flags = [];
  if (student.attendance.overall_pct < 80) {
    flags.push(`attendance below 80% (${student.attendance.overall_pct.toFixed(1)}%)`);
  }
  if (student.cgpa >= 8) {
    flags.push("high academic performance");
  }
  if (student.projects.length) {
    flags.push(`${student.projects.length} project${student.projects.length === 1 ? "" : "s"}`);
  }

  const skills = student.skills.slice(0, 4).join(", ");
  const topCourse = student.courses[0]?.course_name ?? "no course data";

  return [
    `${student.name} is a ${student.program || "student"} with a CGPA of ${student.cgpa.toFixed(2)}.`,
    `Current focus areas include ${skills || "unmapped skills"} and ${student.projects.length ? "project work" : "limited project data"}.`,
    `Top visible course context: ${topCourse}.`,
    flags.length ? `Notable signals: ${flags.join(", ")}.` : "No strong risk flags from the available data."
  ].join(" ");
}
