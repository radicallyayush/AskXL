from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean
from typing import Any

from utils import (
    DATA_DIR,
    INPUT_DIR,
    clean_text,
    discover_csv_files,
    discover_markdown_files,
    distribution_buckets,
    normalize_name,
    read_csv,
    safe_mean,
    safe_median,
    top_n,
    to_float,
    to_int,
    write_json,
)


SECTION_SKILL_MAP = {
    "forecast": ["Forecasting", "Time Series", "Business Statistics"],
    "time series": ["Forecasting", "Time Series"],
    "churn": ["Customer Retention", "Predictive Analytics"],
    "capital structure": ["Finance", "Capital Markets"],
    "valuation": ["Valuation", "Financial Modeling"],
    "warehouse": ["Operations", "Supply Chain"],
    "vendor risk": ["Risk Management", "Supply Chain"],
    "team dysfunction": ["Organizational Behaviour", "Leadership"],
    "change management": ["Change Management", "Leadership"],
    "a/b test": ["Experimentation", "Statistics"],
    "attrition": ["HR Analytics", "People Analytics"],
    "marketing analytics": ["Marketing Analytics", "SQL", "Tableau"],
    "finance": ["Corporate Finance", "Modeling"],
    "strategy": ["Strategy", "Consulting"],
    "hr analytics": ["HR Analytics", "People Analytics"],
}


def identify_dataset(rows: list[dict[str, str]]) -> str:
    headers = {key.lower() for key in rows[0].keys()} if rows else set()
    if {"student_id", "name", "program"}.issubset(headers):
        return "students"
    if {"course_id", "course_name", "instructor"}.issubset(headers):
        return "courses"
    if {"student_id", "course_id", "classes_held", "classes_attended", "attendance_pct"}.issubset(headers):
        return "attendance"
    if {"student_id", "course_id", "total_marks_100", "letter_grade"}.issubset(headers):
        return "grades_final"
    if {"student_id", "course_id", "section", "max_marks", "marks_obtained"}.issubset(headers):
        return "grades_sectionwise"
    if {"student_id", "course_id"} == headers:
        return "enrollment"
    if {"file", "course_id", "course_name", "group", "title", "members"}.issubset(headers):
        return "project_groups"
    return "unknown"


def parse_members(member_text: str) -> list[str]:
    return [normalize_name(name) for name in member_text.split(",") if normalize_name(name)]


def parse_markdown_project(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    title = path.stem.replace("_", " ")
    heading = re.search(r"^#\s+(.+)$", text, re.M)
    if heading:
        title = heading.group(1).strip()
    course_match = re.search(r"\*\*Course:\*\*\s*(.+?)\s*\|\s*\*\*Instructor:", text)
    group_match = re.search(r"\*\*Group:\*\*\s*(\d+)\s+of\s+(\d+)", text)
    members = re.findall(r"^\-\s+(.+?)\s+\((S\d+)\)$", text, re.M)
    body = re.split(r"\n##\s+Background", text, maxsplit=1)
    summary = body[1].strip() if len(body) > 1 else text.strip()
    return {
        "file": path.name,
        "slug": path.stem,
        "title": title,
        "course": clean_text(course_match.group(1)) if course_match else "",
        "group": to_int(group_match.group(1)) if group_match else 0,
        "group_total": to_int(group_match.group(2)) if group_match else 0,
        "members": [{"name": normalize_name(name), "student_id": student_id} for name, student_id in members],
        "summary": re.sub(r"\s+", " ", summary[:600]).strip(),
    }


def skillify(text: str) -> list[str]:
    text_lower = text.lower()
    skills: list[str] = []
    for needle, values in SECTION_SKILL_MAP.items():
        if needle in text_lower:
            for value in values:
                if value not in skills:
                    skills.append(value)
    return skills


def main() -> None:
    csv_rows = {path.name: read_csv(path) for path in discover_csv_files()}
    datasets: dict[str, list[dict[str, str]]] = defaultdict(list)
    for rows in csv_rows.values():
        dataset_name = identify_dataset(rows)
        datasets[dataset_name].extend(rows)

    students_source = datasets["students"]
    courses_source = datasets["courses"]
    attendance_source = datasets["attendance"]
    grades_final_source = datasets["grades_final"]
    grades_sectionwise_source = datasets["grades_sectionwise"]
    enrollment_source = datasets["enrollment"]
    project_groups_source = datasets["project_groups"]

    courses_by_id = {
        row["course_id"]: {
            "course_id": clean_text(row["course_id"]),
            "course_name": clean_text(row.get("course_name")),
            "instructor": clean_text(row.get("instructor")),
            "credits": to_int(row.get("credits")),
        }
        for row in courses_source
    }

    attendance_by_student: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for row in attendance_source:
        student_id = clean_text(row.get("student_id"))
        course_id = clean_text(row.get("course_id"))
        attendance_by_student[student_id][course_id] = {
            "course_id": course_id,
            "course_name": courses_by_id.get(course_id, {}).get("course_name", ""),
            "classes_held": to_int(row.get("classes_held")),
            "classes_attended": to_int(row.get("classes_attended")),
            "attendance_pct": round(to_float(row.get("attendance_pct")), 2),
        }

    grades_final_by_student: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in grades_final_source:
        student_id = clean_text(row.get("student_id"))
        course_id = clean_text(row.get("course_id"))
        grades_final_by_student[student_id].append({
            "course_id": course_id,
            "course_name": courses_by_id.get(course_id, {}).get("course_name", ""),
            "total_marks_100": round(to_float(row.get("total_marks_100")), 2),
            "letter_grade": clean_text(row.get("letter_grade")),
        })

    sections_by_student: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in grades_sectionwise_source:
        key = (clean_text(row.get("student_id")), clean_text(row.get("course_id")))
        sections_by_student[key].append({
            "section": clean_text(row.get("section")),
            "max_marks": to_float(row.get("max_marks")),
            "marks_obtained": round(to_float(row.get("marks_obtained")), 2),
        })

    project_groups = [parse_markdown_project(path) for path in discover_markdown_files()]
    project_lookup = {
        row["file"].replace(".md", ""): row
        for row in project_groups_source
    }
    projects_by_student: dict[str, list[dict[str, Any]]] = defaultdict(list)
    project_memberships: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for project in project_groups:
        slug = project["slug"]
        source_row = project_lookup.get(slug)
        project_record = {
            "file": project["file"],
            "title": project["title"],
            "course_id": clean_text(source_row.get("course_id")) if source_row else "",
            "course_name": clean_text(source_row.get("course_name")) if source_row else project["course"],
            "group": to_int(source_row.get("group")) if source_row else project["group"],
            "group_total": project["group_total"],
            "summary": project["summary"],
            "members": project["members"],
        }
        for member in project["members"]:
            student_id = member["student_id"]
            projects_by_student[student_id].append(project_record)
            project_memberships[student_id].append({
                "title": project_record["title"],
                "course_name": project_record["course_name"],
                "group": project_record["group"],
            })

    students_by_id = {
        clean_text(row["student_id"]): {
            "student_id": clean_text(row["student_id"]),
            "name": normalize_name(row.get("name")),
            "program": clean_text(row.get("program")),
            "term": to_int(row.get("term")),
            "email": clean_text(row.get("email")),
        }
        for row in students_source
    }

    all_student_ids = sorted(set(students_by_id) | set(attendance_by_student) | set(grades_final_by_student) | set(projects_by_student))
    student_payloads: list[dict[str, Any]] = []
    cgpas: list[float] = []
    attendance_values: list[float] = []
    program_counter: Counter[str] = Counter()
    grade_counter: Counter[str] = Counter()
    course_counter: Counter[str] = Counter()
    project_counter: Counter[str] = Counter()
    project_topic_counter: Counter[str] = Counter()
    known_placement_count = 0

    for student_id in all_student_ids:
        base = students_by_id.get(student_id, {
            "student_id": student_id,
            "name": "",
            "program": "",
            "term": 0,
            "email": "",
        })
        program = base.get("program", "")
        if program:
            program_counter[program] += 1

        final_grades = grades_final_by_student.get(student_id, [])
        course_rows = []
        for enrollment in enrollment_source:
            if clean_text(enrollment.get("student_id")) != student_id:
                continue
            course_id = clean_text(enrollment.get("course_id"))
            course = courses_by_id.get(course_id, {})
            final_grade = next((grade for grade in final_grades if grade["course_id"] == course_id), None)
            attendance = attendance_by_student.get(student_id, {}).get(course_id, {})
            sections = sections_by_student.get((student_id, course_id), [])
            course_rows.append({
                "course_id": course_id,
                "course_name": course.get("course_name", ""),
                "instructor": course.get("instructor", ""),
                "credits": course.get("credits", 0),
                "attendance_pct": attendance.get("attendance_pct", 0.0),
                "grade": final_grade.get("letter_grade", "") if final_grade else "",
                "marks_100": final_grade.get("total_marks_100", 0.0) if final_grade else 0.0,
                "sections": sections,
            })
            if course.get("course_name"):
                course_counter[course["course_name"]] += 1
        if not course_rows:
            for attendance in attendance_by_student.get(student_id, {}).values():
                course_id = attendance["course_id"]
                course = courses_by_id.get(course_id, {})
                final_grade = next((grade for grade in final_grades if grade["course_id"] == course_id), None)
                sections = sections_by_student.get((student_id, course_id), [])
                course_rows.append({
                    "course_id": course_id,
                    "course_name": course.get("course_name", ""),
                    "instructor": course.get("instructor", ""),
                    "credits": course.get("credits", 0),
                    "attendance_pct": attendance.get("attendance_pct", 0.0),
                    "grade": final_grade.get("letter_grade", "") if final_grade else "",
                    "marks_100": final_grade.get("total_marks_100", 0.0) if final_grade else 0.0,
                    "sections": sections,
                })

        attendance_entries = list(attendance_by_student.get(student_id, {}).values())
        attendance_avg = safe_mean(entry["attendance_pct"] for entry in attendance_entries)
        attendance_values.extend(entry["attendance_pct"] for entry in attendance_entries if entry["attendance_pct"] > 0)

        marks = [grade["total_marks_100"] for grade in final_grades if grade["total_marks_100"] > 0]
        cgpa = round(safe_mean(marks) / 10.0, 2) if marks else 0.0
        cgpas.append(cgpa)

        project_rows = projects_by_student.get(student_id, [])
        if project_rows:
            known_placement_count += 1
        skills = []
        for source_text in [base.get("name", ""), program, " ".join(project.get("title", "") for project in project_rows), " ".join(course.get("course_name", "") for course in course_rows)]:
            for skill in skillify(source_text):
                if skill not in skills:
                    skills.append(skill)

        if cgpa >= 8.0:
            grade_counter["High Performer"] += 1
        elif cgpa >= 7.0:
            grade_counter["Strong Performer"] += 1
        elif cgpa > 0:
            grade_counter["Developing"] += 1
        else:
            grade_counter["Unknown"] += 1

        for project in project_rows:
            for token in skillify(project["title"] + " " + project["summary"]):
                project_topic_counter[token] += 1

        student_payloads.append({
            "student_id": student_id,
            "name": base.get("name", ""),
            "program": program,
            "term": base.get("term", 0),
            "email": base.get("email", ""),
            "cgpa": cgpa,
            "attendance": {
                "overall_pct": attendance_avg,
                "by_course": attendance_entries,
            },
            "courses": course_rows,
            "grades": final_grades,
            "projects": project_rows,
            "skills": skills,
            "analytics": {
                "course_count": len(course_rows),
                "attendance_count": len(attendance_entries),
                "project_count": len(project_rows),
                "average_marks_100": round(safe_mean(marks), 2),
                "attendance_flags": [entry["course_id"] for entry in attendance_entries if entry["attendance_pct"] < 80],
                "project_topics": list(dict.fromkeys(skills)),
            },
            "placement_status": "project-linked" if project_rows else "unknown"
        })

    program_counts = Counter(
        student["program"] for student in student_payloads if student["program"]
    )
    grade_distribution = Counter()
    for student in student_payloads:
        if student["cgpa"] >= 8:
            grade_distribution["8.0+"] += 1
        elif student["cgpa"] >= 7:
            grade_distribution["7.0-7.99"] += 1
        elif student["cgpa"] > 0:
            grade_distribution["<7.0"] += 1
        else:
            grade_distribution["No Data"] += 1

    course_analytics = []
    for course_id, course in courses_by_id.items():
        course_students = [student for student in student_payloads if any(course_row["course_id"] == course_id for course_row in student["courses"])]
        attendance_vals = [
            course_row["attendance_pct"]
            for student in course_students
            for course_row in student["courses"]
            if course_row["course_id"] == course_id and course_row["attendance_pct"] > 0
        ]
        marks_vals = [
            course_row["marks_100"]
            for student in course_students
            for course_row in student["courses"]
            if course_row["course_id"] == course_id and course_row["marks_100"] > 0
        ]
        course_analytics.append({
            "course_id": course_id,
            "course_name": course.get("course_name", ""),
            "students": len(course_students),
            "average_attendance": safe_mean(attendance_vals),
            "average_marks_100": safe_mean(marks_vals),
        })

    project_analytics = []
    for project in project_groups:
        project_analytics.append({
            "title": project["title"],
            "course": project["course"],
            "group": project["group"],
            "member_count": len(project["members"]),
        })

    metadata = {
        "total_students": len(student_payloads),
        "average_cgpa": safe_mean(cgpas),
        "median_cgpa": safe_median(cgpas),
        "cgpa_distribution": distribution_buckets(cgpas),
        "attendance_statistics": {
            "average": safe_mean(attendance_values),
            "median": safe_median(attendance_values),
            "min": round(min(attendance_values), 2) if attendance_values else 0.0,
            "max": round(max(attendance_values), 2) if attendance_values else 0.0,
        },
        "placement_statistics": {
            "project_linked_students": known_placement_count,
            "unknown_students": len(student_payloads) - known_placement_count,
            "placement_data_available": False,
        },
        "program_counts": dict(program_counts),
        "grade_distribution": dict(grade_distribution),
        "course_analytics": course_analytics,
        "project_analytics": project_analytics,
        "top_courses": top_n(course_counter, 8),
        "project_topic_counts": top_n(project_topic_counter, 12),
    }

    write_json(DATA_DIR / "students.json", {"students": student_payloads})
    write_json(DATA_DIR / "metadata.json", metadata)


if __name__ == "__main__":
    main()
