import { NextResponse } from "next/server";

import { getEmbeddings, getMetadata, getStudents } from "@/lib/data";
import type { StudentRecord } from "@/lib/types";

type RequestBody = {
  question?: string;
  geminiApiKey?: string;
};

type GeminiMode = "browser" | "env" | "demo" | "error";

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2);
}

function rankStudents(question: string, embeddings: Array<{ student_id: string; text: string }>) {
  const queryTokens = tokenize(question);
  return embeddings
    .map((doc) => {
      const text = doc.text.toLowerCase();
      const score = queryTokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0);
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function buildPrompt(question: string, students: StudentRecord[], metadata: ReturnType<typeof getMetadata>) {
  return `You are AskXL, an XLRI student intelligence assistant.

Write in plain natural language only.
Do not use Markdown headings, bullet lists, tables, code blocks, or bold text.
Answer in short paragraphs that sound conversational and direct.
Use only the provided student records and metadata.
If the data is insufficient, say so clearly.

Question:
${question}

Metadata:
${JSON.stringify(metadata, null, 2)}

Relevant students:
${JSON.stringify(students, null, 2)}
`;
}

function fallbackNaturalLanguage(question: string, students: StudentRecord[]) {
  const names = students.slice(0, 5).map((student) => `${student.name} (${student.student_id})`).join(", ");
  if (!students.length) {
    return `I could not find a strong match for "${question}" in the local student index.`;
  }
  return `I found these relevant students for "${question}": ${names}.`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const question = (body.question ?? "").trim();
  const browserGeminiKey = (body.geminiApiKey ?? "").trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const embeddings = getEmbeddings();
  const studentsMap = new Map(getStudents().map((student) => [student.student_id, student]));
  const ranked = rankStudents(question, embeddings);
  const relevantStudents = ranked.map((doc) => studentsMap.get(doc.student_id)).filter(Boolean) as StudentRecord[];

  const apiKey = browserGeminiKey || process.env.GEMINI_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json({
      answer: fallbackNaturalLanguage(question, relevantStudents),
      mode: "demo" satisfies GeminiMode
    });
  }

  const metadata = getMetadata();
  const prompt = buildPrompt(question, relevantStudents, metadata);
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      {
        answer: fallbackNaturalLanguage(question, relevantStudents),
        error: `Gemini request failed: ${errorText}`,
        mode: "error" satisfies GeminiMode
      },
      { status: 200 }
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") || fallbackNaturalLanguage(question, relevantStudents);
  return NextResponse.json({
    answer,
    mode: browserGeminiKey ? "browser" : "env"
  });
}
