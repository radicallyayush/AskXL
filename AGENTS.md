# AGENTS.md

## Working Rules

- Keep `input/` as the source-of-truth folder for raw CSV, reference HTML, and sample project markdown files.
- Never read CSV files from the frontend.
- Regenerate `data/students.json`, `data/metadata.json`, and `data/embeddings.json` whenever the source files change.
- Prefer readable, modular code over clever shortcuts.
- Keep path references aligned with the current repository layout.

## Data Pipeline

1. `scripts/generate_data.py` discovers every CSV in `input/`.
2. It joins student, attendance, course, grade, and project data by `student_id`.
3. It writes normalized JSON into `data/`.
4. `scripts/generate_embeddings.py` builds the chatbot search index from `data/students.json`.

## App Surface

- `app/page.tsx` renders the student 360 dashboard.
- `app/students/[studentId]/page.tsx` renders the profile view.
- `app/chat/page.tsx` and `app/api/chat/route.ts` power AskXL chat.

