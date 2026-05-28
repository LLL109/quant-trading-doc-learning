const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8040";

export interface KnowledgePoint {
  id: number;
  slug: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  difficulty: number;
  prerequisites: { slug: string; title: string }[];
  related: { slug: string; title: string }[];
}

export interface KnowledgeListItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  difficulty: number;
}

export async function fetchKnowledgeList(category?: string): Promise<KnowledgeListItem[]> {
  const url = category
    ? `${API_BASE}/api/knowledge?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/knowledge`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export async function fetchKnowledgeDetail(slug: string): Promise<KnowledgePoint> {
  const res = await fetch(`${API_BASE}/api/knowledge/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function searchKnowledge(query: string): Promise<KnowledgeListItem[]> {
  const res = await fetch(`${API_BASE}/api/knowledge/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

// 练习题
export interface QuizItem {
  id: number;
  knowledge_point_id: number;
  question: string;
  question_type: "choice" | "true_false" | "fill";
  options?: string[];
  explanation?: string;
}

export interface QuizResult {
  correct: boolean;
  correct_answer: string;
  explanation?: string;
}

export async function fetchQuizzes(knowledgePointId: number): Promise<QuizItem[]> {
  const res = await fetch(`${API_BASE}/api/quiz/${knowledgePointId}`);
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
}

export async function submitAnswer(quizId: number, answer: string): Promise<QuizResult> {
  const res = await fetch(`${API_BASE}/api/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quiz_id: quizId, answer }),
  });
  if (!res.ok) throw new Error("Submit failed");
  return res.json();
}

// 进度
export interface ProgressStats {
  total: number;
  not_started: number;
  learning: number;
  mastered: number;
  categories: Record<string, { total: number; mastered: number }>;
}

export async function fetchProgressStats(): Promise<ProgressStats> {
  const res = await fetch(`${API_BASE}/api/progress/stats`);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function updateProgress(slug: string, status: string): Promise<void> {
  await fetch(`${API_BASE}/api/progress/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
