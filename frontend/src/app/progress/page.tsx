"use client";

import { useEffect, useState } from "react";
import { fetchProgressStats, type ProgressStats } from "@/lib/api";
import { BookOpen, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);

  useEffect(() => {
    fetchProgressStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return <div className="max-w-4xl mx-auto py-8" style={{ color: "var(--text-muted)" }}>加载中...</div>;
  }

  const percentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        学习进度
      </h1>

      {/* 总体进度 */}
      <div className="p-6 rounded-xl mb-8" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ color: "var(--text-secondary)" }}>总体掌握度</span>
          <span className="text-2xl font-bold" style={{ color: "var(--accent-green)", fontFamily: "JetBrains Mono" }}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: "var(--accent-green)" }} />
        </div>
        <div className="flex justify-between mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          <span>总计 {stats.total} 个知识点</span>
          <span>已掌握 {stats.mastered}</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "未开始", value: stats.not_started, icon: BookOpen, color: "var(--text-muted)" },
          { label: "学习中", value: stats.learning, icon: Clock, color: "var(--accent-blue)" },
          { label: "已掌握", value: stats.mastered, icon: CheckCircle, color: "var(--accent-green)" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-5 rounded-xl text-center"
                 style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
              <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: item.color }} />
              <div className="text-2xl font-bold" style={{ fontFamily: "JetBrains Mono", color: item.color }}>
                {item.value}
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* 分类进度 */}
      <h2 className="text-lg font-semibold mb-4">分类进度</h2>
      <div className="space-y-3">
        {Object.entries(stats.categories).map(([cat, data]) => {
          const pct = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
          return (
            <div key={cat} className="p-4 rounded-xl"
                 style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{cat}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {data.mastered}/{data.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-color)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "var(--accent-green)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
