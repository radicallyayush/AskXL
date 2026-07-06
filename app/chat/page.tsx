import { ChatInterface } from "@/components/chat-interface";

type ChatPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ChatPage({ searchParams }: ChatPageProps) {
  const rawQuery = searchParams?.q;
  const initialQuestion = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || "Summarize Rahul.";

  return (
    <div className="space-y-6">
      <ChatInterface initialQuestion={initialQuestion} />
    </div>
  );
}
