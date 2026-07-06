from __future__ import annotations

from pathlib import Path
from typing import Any

from utils import DATA_DIR, clean_text, read_json, write_json


def join_nonempty(values: list[str]) -> str:
    return " ".join(value for value in values if value)


def student_to_document(student: dict[str, Any]) -> str:
    courses = [course.get("course_name", "") for course in student.get("courses", [])]
    grades = [grade.get("letter_grade", "") for grade in student.get("grades", [])]
    projects = [project.get("title", "") for project in student.get("projects", [])]
    topics = student.get("analytics", {}).get("project_topics", [])
    attendance = student.get("attendance", {}).get("overall_pct", 0)
    return join_nonempty([
        clean_text(student.get("name")),
        clean_text(student.get("program")),
        f"Term {student.get('term', 0)}" if student.get("term") else "",
        f"CGPA {student.get('cgpa', 0)}",
        f"Attendance {attendance}",
        " ".join(student.get("skills", [])),
        " ".join(courses),
        " ".join(grades),
        " ".join(projects),
        " ".join(topics),
        clean_text(student.get("placement_status")),
    ])


def main() -> None:
    students_payload = read_json(DATA_DIR / "students.json", default={"students": []})
    students = students_payload.get("students", [])
    embeddings = [
        {
            "student_id": student.get("student_id", ""),
            "text": student_to_document(student),
        }
        for student in students
    ]
    write_json(DATA_DIR / "embeddings.json", {"embeddings": embeddings})


if __name__ == "__main__":
    main()
