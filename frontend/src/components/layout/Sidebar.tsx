"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, TrendingUp, BarChart3, PieChart,
  Zap, FlaskConical, Shield, Database, Brain, Map,
  ChevronDown, ChevronRight, Search, X
} from "lucide-react";

// 知识分类定义
const categories = [
  {
    name: "基础概念",
    icon: BookOpen,
    items: [
      { slug: "stock", title: "股票" },
      { slug: "stock-market", title: "股票市场与交易所" },
      { slug: "a-share-rules", title: "A股交易规则" },
      { slug: "etf", title: "ETF基金" },
      { slug: "bond", title: "债券" },
      { slug: "fund", title: "基金" },
      { slug: "futures", title: "期货" },
      { slug: "convertible-bond", title: "可转债" },
      { slug: "k-line", title: "K线图" },
      { slug: "volume", title: "成交量" },
      { slug: "turnover", title: "换手率" },
    ]
  },
  {
    name: "收益与风险",
    icon: TrendingUp,
    items: [
      { slug: "return-rate", title: "收益率" },
      { slug: "annualized-return", title: "年化收益率" },
      { slug: "volatility", title: "波动率" },
      { slug: "max-drawdown", title: "最大回撤" },
      { slug: "sharpe-ratio", title: "夏普比率" },
      { slug: "calmar-ratio", title: "卡玛比率" },
      { slug: "win-rate", title: "胜率" },
      { slug: "profit-loss-ratio", title: "盈亏比" },
    ]
  },
  {
    name: "技术分析",
    icon: BarChart3,
    items: [
      { slug: "ma", title: "均线" },
      { slug: "sma", title: "SMA" },
      { slug: "ema", title: "EMA" },
      { slug: "golden-cross", title: "金叉" },
      { slug: "death-cross", title: "死叉" },
      { slug: "macd", title: "MACD" },
      { slug: "rsi", title: "RSI" },
      { slug: "boll", title: "布林带" },
      { slug: "kdj", title: "KDJ" },
      { slug: "trendline", title: "趋势线" },
      { slug: "candlestick-patterns", title: "K线形态" },
    ]
  },
  {
    name: "基本面分析",
    icon: PieChart,
    items: [
      { slug: "pe", title: "市盈率 PE" },
      { slug: "pb", title: "市净率 PB" },
      { slug: "roe", title: "ROE" },
      { slug: "eps", title: "EPS" },
      { slug: "balance-sheet", title: "资产负债表" },
      { slug: "income-statement", title: "利润表" },
      { slug: "cash-flow", title: "现金流量表" },
      { slug: "dividend-yield", title: "股息率" },
    ]
  },
  {
    name: "量化策略",
    icon: Zap,
    items: [
      { slug: "quant-overview", title: "量化交易概述" },
      { slug: "trend-following", title: "趋势跟踪" },
      { slug: "mean-reversion", title: "均值回归" },
      { slug: "momentum-rotation", title: "动量轮动" },
      { slug: "multi-factor", title: "多因子选股" },
      { slug: "etf-rotation", title: "ETF轮动" },
    ]
  },
  {
    name: "回测",
    icon: FlaskConical,
    items: [
      { slug: "backtest-overview", title: "回测概述" },
      { slug: "future-function", title: "未来函数" },
      { slug: "survivorship-bias", title: "幸存者偏差" },
      { slug: "overfitting", title: "过拟合" },
      { slug: "walk-forward", title: "Walk-forward" },
      { slug: "backtest-framework", title: "Python回测框架" },
    ]
  },
  {
    name: "风控与仓位",
    icon: Shield,
    items: [
      { slug: "position-sizing", title: "仓位管理" },
      { slug: "stop-loss", title: "止损" },
      { slug: "take-profit", title: "止盈" },
      { slug: "drawdown-control", title: "回撤控制" },
      { slug: "trading-costs", title: "交易成本" },
    ]
  },
  {
    name: "数据与工具",
    icon: Database,
    items: [
      { slug: "data-sources", title: "数据来源" },
      { slug: "akshare", title: "AKShare" },
      { slug: "python-stack", title: "Python技术栈" },
      { slug: "quant-system", title: "量化系统架构" },
    ]
  },
  {
    name: "机器学习",
    icon: Brain,
    items: [
      { slug: "ml-in-quant", title: "ML在量化中的位置" },
      { slug: "feature-engineering", title: "特征工程" },
      { slug: "tree-models", title: "树模型" },
    ]
  },
  {
    name: "入门路线",
    icon: Map,
    items: [
      { slug: "learning-roadmap", title: "学习路线" },
      { slug: "first-backtest", title: "第一个回测" },
      { slug: "first-rotation", title: "ETF轮动实战" },
      { slug: "quant-principles", title: "量化十大原则" },
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "基础概念": true,  // 默认展开第一个
  });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // 搜索过滤
  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : categories;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4"
           style={{ borderBottom: '1px solid var(--border-color)', height: 'var(--topbar-height)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
               style={{ backgroundColor: 'var(--accent-green)', color: 'var(--bg-primary)' }}>
            Q
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: '16px' }}>
            QuantLearn
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-lg lg:hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 搜索框 */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="搜索知识点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* 分类导航 */}
      <nav className="px-3 pb-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expanded[category.name];

          return (
            <div key={category.name} className="mb-1">
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{category.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {category.items.length}
                </span>
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronRight className="w-3.5 h-3.5" />
                }
              </button>

              {isExpanded && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {category.items.map((item) => {
                    const isActive = pathname === `/k/${item.slug}`;
                    return (
                      <Link
                        key={item.slug}
                        href={`/k/${item.slug}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
                        style={{
                          color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
                          backgroundColor: isActive ? 'var(--accent-green-dim)' : 'transparent',
                          fontSize: '13px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: isActive ? 'var(--accent-green)' : 'var(--border-hover)' }} />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
