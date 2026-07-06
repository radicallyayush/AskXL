import type { StudentRecord } from "./types";

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2);
}

export function searchStudents(students: StudentRecord[], query: string) {
  const queryTokens = tokens(query);
  if (!queryTokens.length) {
    return students;
  }

  return students
    .map((student) => {
      const haystack = [
        student.name,
        student.program,
        student.skills.join(" "),
        student.projects.map((project) => project.title).join(" "),
        student.courses.map((course) => course.course_name).join(" "),
        student.grades.map((grade) => grade.letter_grade).join(" ")
      ]
        .join(" ")
        .toLowerCase();
      const score = queryTokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
      return { student, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.student);
}

export function filterByProgram(students: StudentRecord[], program: string) {
  return program ? students.filter((student) => student.program === program) : students;
}

export function filterByAttendance(students: StudentRecord[], minAttendance: number) {
  return students.filter((student) => student.attendance.overall_pct >= minAttendance);
}
