"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import {
  fetchKnowledgeList,
  searchKnowledge,
  type KnowledgeListItem,
} from "@/lib/api";

const categoryNames = [
  "基础概念",
  "收益与风险",
  "技术分析",
  "基本面分析",
  "量化策略",
  "回测",
  "风控与仓位",
  "数据与工具",
  "机器学习",
  "入门路线",
];

function KnowledgeContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetcher = searchQuery
      ? searchKnowledge(searchQuery)
      : fetchKnowledgeList(activeCategory || undefined);

    fetcher
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "JetBrains Mono, monospace" }}
      >
        知识库
      </h1>

      {/* Category filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => {
            setLoading(true);
            setActiveCategory("");
            setSearchQuery("");
          }}
          className="px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{
            backgroundColor: !activeCategory
              ? "var(--accent-green-dim)"
              : "var(--bg-tertiary)",
            color: !activeCategory
              ? "var(--accent-green)"
              : "var(--text-muted)",
            border: `1px solid ${
              !activeCategory ? "var(--accent-green)" : "var(--border-color)"
            }`,
          }}
        >
          全部
        </button>
        {categoryNames.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setLoading(true);
              setActiveCategory(cat);
              setSearchQuery("");
            }}
            className="px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{
              backgroundColor:
                activeCategory === cat
                  ? "var(--accent-green-dim)"
                  : "var(--bg-tertiary)",
              color:
                activeCategory === cat
                  ? "var(--accent-green)"
                  : "var(--text-muted)",
              border: `1px solid ${
                activeCategory === cat
                  ? "var(--accent-green)"
                  : "var(--border-color)"
              }`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Knowledge list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse p-5 rounded-xl h-24"
              style={{ backgroundColor: "var(--bg-card)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/k/${item.slug}`}
              className="group p-5 rounded-xl transition-all"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-green)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium mb-1 group-hover:text-[var(--accent-green)] transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Star
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--accent-gold)" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {item.difficulty}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <BookOpen
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>暂无知识点</p>
        </div>
      )}
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-8">
          <h1
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            知识库
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse p-5 rounded-xl h-24"
                style={{ backgroundColor: "var(--bg-card)" }}
              />
            ))}
          </div>
        </div>
      }
    >
      <KnowledgeContent />
    </Suspense>
  );
}
