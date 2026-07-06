import "server-only";

import fs from "node:fs";
import path from "node:path";

import type { EmbeddingDoc, Metadata, StudentRecord } from "./types";

const dataDir = path.join(process.cwd(), "data");

function readJsonFile<T>(fileName: string, fallback: T): T {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getStudents(): StudentRecord[] {
  return readJsonFile<{ students: StudentRecord[] }>("students.json", { students: [] }).students;
}

export function getMetadata(): Metadata {
  return readJsonFile<Metadata>("metadata.json", {
    total_students: 0,
    average_cgpa: 0,
    median_cgpa: 0,
    cgpa_distribution: {},
    attendance_statistics: { average: 0, median: 0, min: 0, max: 0 },
    placement_statistics: { project_linked_students: 0, unknown_students: 0, placement_data_available: false },
    program_counts: {},
    grade_distribution: {},
    course_analytics: [],
    project_analytics: [],
    top_courses: [],
    project_topic_counts: []
  });
}

export function getEmbeddings(): EmbeddingDoc[] {
  return readJsonFile<{ embeddings: EmbeddingDoc[] }>("embeddings.json", { embeddings: [] }).embeddings;
}

export function getStudentById(studentId: string): StudentRecord | undefined {
  return getStudents().find((student) => student.student_id === studentId);
}

export function getStudentsIndex() {
  const students = getStudents();
  return new Map(students.map((student) => [student.student_id, student]));
}
