"use client";

import Link from "next/link";
import {
  BookOpen, TrendingUp, BarChart3, PieChart,
  Zap, FlaskConical, Shield, Database, Brain, Map
} from "lucide-react";

const categories = [
  { name: "基础概念", icon: BookOpen, href: "/knowledge?category=基础概念", count: 15, color: "#00d4aa" },
  { name: "收益与风险", icon: TrendingUp, href: "/knowledge?category=收益与风险", count: 10, color: "#3b82f6" },
  { name: "技术分析", icon: BarChart3, href: "/knowledge?category=技术分析", count: 15, color: "#ffd93d" },
  { name: "基本面分析", icon: PieChart, href: "/knowledge?category=基本面分析", count: 10, color: "#ff6b6b" },
  { name: "量化策略", icon: Zap, href: "/knowledge?category=量化策略", count: 10, color: "#a78bfa" },
  { name: "回测", icon: FlaskConical, href: "/knowledge?category=回测", count: 10, color: "#f97316" },
  { name: "风控与仓位", icon: Shield, href: "/knowledge?category=风控与仓位", count: 8, color: "#06b6d4" },
  { name: "数据与工具", icon: Database, href: "/knowledge?category=数据与工具", count: 8, color: "#84cc16" },
  { name: "机器学习", icon: Brain, href: "/knowledge?category=机器学习", count: 8, color: "#ec4899" },
  { name: "入门路线", icon: Map, href: "/knowledge?category=入门路线", count: 5, color: "#f59e0b" },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* 欢迎区 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ color: 'var(--accent-green)' }}>$</span> QuantLearn
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          量化交易知识库 — 从零开始，系统学习量化交易的每一个核心概念
        </p>
      </div>

      {/* 推荐开始 */}
      <div className="mb-10 p-6 rounded-xl"
           style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
          推荐开始
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { slug: "stock", title: "股票是什么" },
            { slug: "k-line", title: "认识K线图" },
            { slug: "return-rate", title: "理解收益率" },
            { slug: "quant-overview", title: "量化交易概述" },
            { slug: "learning-roadmap", title: "学习路线" },
          ].map((item) => (
            <Link
              key={item.slug}
              href={`/k/${item.slug}`}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-green)';
                e.currentTarget.style.color = 'var(--accent-green)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      {/* 知识分类卡片 */}
      <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>
        知识分类
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="group p-5 rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cat.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: `${cat.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div>
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.count} 个知识点</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
