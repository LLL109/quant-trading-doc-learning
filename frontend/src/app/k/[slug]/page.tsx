"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Circle,
  List,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { fetchKnowledgeDetail, fetchQuizzes, type KnowledgePoint, type QuizItem } from "@/lib/api";
import MarkdownRenderer from "@/components/knowledge/MarkdownRenderer";
import QuizCard from "@/components/quiz/QuizCard";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(content: string): TocItem[] {
  const lines = content.split("\n");
  const toc: TocItem[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w一-鿿-]/g, "");
      toc.push({ id, text, level });
    }
  }
  return toc;
}

const statusLabels = {
  not_started: "未学",
  learning: "学习中",
  mastered: "已掌握",
} as const;

const statusIcons = {
  not_started: Circle,
  learning: Clock,
  mastered: CheckCircle,
} as const;

function QuizSection({ knowledgePointId }: { knowledgePointId: number }) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && quizzes.length === 0) {
      setLoading(true);
      fetchQuizzes(knowledgePointId)
        .then(setQuizzes)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [expanded, knowledgePointId, quizzes.length]);

  return (
    <div className="mt-12">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full p-4 rounded-xl transition-colors"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <HelpCircle className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
        <span className="font-medium">练习题</span>
        {expanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>加载中...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>暂无练习题</div>
          ) : (
            quizzes.map((quiz, idx) => (
              <QuizCard key={quiz.id} quiz={quiz} index={idx} total={quizzes.length} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<KnowledgePoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "not_started" | "learning" | "mastered"
  >("not_started");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchKnowledgeDetail(slug)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const toc = useMemo(() => {
    if (!data?.content) return [];
    return extractToc(data.content);
  }, [data?.content]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div
            className="h-4 w-48 rounded"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div
            className="h-8 w-full max-w-96 rounded"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div
            className="h-64 rounded"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div
            className="h-32 rounded"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">知识点未找到</h1>
        <p style={{ color: "var(--text-muted)" }}>slug: {slug}</p>
        <Link
          href="/"
          className="mt-4 inline-block"
          style={{ color: "var(--accent-green)" }}
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 flex gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 text-sm mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          <Link href="/" className="hover:underline">
            首页
          </Link>
          <span>/</span>
          <Link
            href={`/knowledge?category=${data.category}`}
            className="hover:underline"
          >
            {data.category}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{data.title}</span>
        </nav>

        {/* Title area */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {data.title}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className="text-sm px-2 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--accent-blue-dim)",
                  color: "var(--accent-blue)",
                }}
              >
                {data.category}
              </span>
              <span className="text-sm" style={{ color: "var(--accent-gold)" }}>
                {"★".repeat(data.difficulty)}
                {"☆".repeat(5 - data.difficulty)}
              </span>
            </div>
          </div>

          {/* Study status toggle */}
          <div className="flex gap-2 shrink-0">
            {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(
              (s) => {
                const Icon = statusIcons[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor:
                        status === s
                          ? "var(--accent-green-dim)"
                          : "var(--bg-tertiary)",
                      border: `1px solid ${
                        status === s
                          ? "var(--accent-green)"
                          : "var(--border-color)"
                      }`,
                      color:
                        status === s
                          ? "var(--accent-green)"
                          : "var(--text-muted)",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {statusLabels[s]}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Markdown content */}
        <article className="prose-custom">
          <MarkdownRenderer content={data.content} />
        </article>

        {/* Related section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prerequisites */}
          {data.prerequisites && data.prerequisites.length > 0 && (
            <div
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--accent-blue)" }}
              >
                学习本概念前建议先看
              </h3>
              <div className="space-y-2">
                {data.prerequisites.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/k/${p.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-blue)";
                      e.currentTarget.style.outline =
                        "1px solid var(--accent-blue)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  >
                    <BookOpen
                      className="w-4 h-4"
                      style={{ color: "var(--accent-blue)" }}
                    />
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related concepts */}
          {data.related && data.related.length > 0 && (
            <div
              className="p-5 rounded-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--accent-green)" }}
              >
                相关概念
              </h3>
              <div className="space-y-2">
                {data.related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/k/${r.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--accent-green)";
                      e.currentTarget.style.outline =
                        "1px solid var(--accent-green)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  >
                    <BookOpen
                      className="w-4 h-4"
                      style={{ color: "var(--accent-green)" }}
                    />
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 练习区 */}
        <QuizSection knowledgePointId={data.id} />
      </div>

      {/* Right-side floating TOC */}
      {toc.length > 0 && (
        <aside className="hidden lg:block w-56 shrink-0">
          <div
            className="sticky top-20 p-4 rounded-xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              className="flex items-center gap-2 mb-3 text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              <List className="w-4 h-4" />
              目录
            </div>
            <nav className="space-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm py-1 transition-colors hover:underline"
                  style={{
                    paddingLeft: `${(item.level - 1) * 12}px`,
                    color:
                      item.level === 1
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
