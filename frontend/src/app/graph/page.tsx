"use client";

import { useEffect, useState, useRef } from "react";
import { Network } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8040";

interface GraphNode {
  id: number;
  label: string;
  category: string;
  slug: string;
}

interface GraphEdge {
  source: number;
  target: number;
  relation_type: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const categoryColors: Record<string, string> = {
  "基础概念": "#00d4aa",
  "收益与风险": "#3b82f6",
  "技术分析": "#ffd93d",
  "基本面分析": "#ff6b6b",
  "量化策略": "#a78bfa",
  "回测": "#f97316",
  "风控与仓位": "#06b6d4",
  "数据与工具": "#84cc16",
  "机器学习": "#ec4899",
  "入门路线": "#f59e0b",
};

export default function GraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/knowledge/graph`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96" style={{ color: 'var(--text-muted)' }}>
        <Network className="w-6 h-6 mr-2 animate-pulse" />
        加载知识图谱...
      </div>
    );
  }

  // 简单的力导向布局 (静态计算)
  const width = 900;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;

  // 按分类分组，圆形排列
  const categories = [...new Set(data.nodes.map((n) => n.category))];
  const nodesWithPos = data.nodes.map((node) => {
    const catIdx = categories.indexOf(node.category);
    const catNodes = data.nodes.filter((n) => n.category === node.category);
    const nodeIdx = catNodes.indexOf(node);
    const angleOffset = (catIdx / categories.length) * 2 * Math.PI;
    const nodeAngle = angleOffset + (nodeIdx / catNodes.length) * 0.8 - 0.4;
    const radius = 180 + catNodes.length * 8;
    return {
      ...node,
      x: centerX + Math.cos(nodeAngle) * radius,
      y: centerY + Math.sin(nodeAngle) * radius,
    };
  });

  const getNodeById = (id: number) => nodesWithPos.find((n) => n.id === id);

  const filteredEdges = selectedCategory
    ? data.edges.filter((e) => {
        const src = getNodeById(e.source);
        const tgt = getNodeById(e.target);
        return src?.category === selectedCategory || tgt?.category === selectedCategory;
      })
    : data.edges;

  const connectedNodeIds = new Set<number>();
  if (hoveredNode !== null) {
    filteredEdges.forEach((e) => {
      if (e.source === hoveredNode) connectedNodeIds.add(e.target);
      if (e.target === hoveredNode) connectedNodeIds.add(e.source);
    });
    connectedNodeIds.add(hoveredNode);
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          知识图谱
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>{data.nodes.length} 个知识点</span>
          <span>·</span>
          <span>{data.edges.length} 条关联</span>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className="px-3 py-1 rounded-lg text-xs"
          style={{
            backgroundColor: !selectedCategory ? 'var(--accent-green-dim)' : 'var(--bg-tertiary)',
            color: !selectedCategory ? 'var(--accent-green)' : 'var(--text-muted)',
            border: `1px solid ${!selectedCategory ? 'var(--accent-green)' : 'var(--border-color)'}`,
          }}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className="px-3 py-1 rounded-lg text-xs"
            style={{
              backgroundColor: selectedCategory === cat ? `${categoryColors[cat]}20` : 'var(--bg-tertiary)',
              color: selectedCategory === cat ? categoryColors[cat] : 'var(--text-muted)',
              border: `1px solid ${selectedCategory === cat ? categoryColors[cat] : 'var(--border-color)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 图谱 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`} style={{ minHeight: '500px' }}>
          {/* 边 */}
          {filteredEdges.map((edge, i) => {
            const src = getNodeById(edge.source);
            const tgt = getNodeById(edge.target);
            if (!src || !tgt) return null;

            const isHighlighted = hoveredNode !== null && (edge.source === hoveredNode || edge.target === hoveredNode);
            const opacity = hoveredNode === null ? 0.3 : isHighlighted ? 0.8 : 0.1;

            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={edge.relation_type === "prerequisite" ? "#3b82f6" : "#64748b"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={edge.relation_type === "related" ? "4 4" : "none"}
                opacity={opacity}
              />
            );
          })}

          {/* 节点 */}
          {nodesWithPos.map((node) => {
            const color = categoryColors[node.category] || "#64748b";
            const isHovered = hoveredNode === node.id;
            const isConnected = connectedNodeIds.has(node.id);
            const isFiltered = selectedCategory && node.category !== selectedCategory;
            const opacity = hoveredNode === null ? 1 : isConnected ? 1 : 0.2;
            const r = isHovered ? 8 : 5;

            return (
              <g key={node.id}
                 onMouseEnter={() => setHoveredNode(node.id)}
                 onMouseLeave={() => setHoveredNode(null)}
                 onClick={() => window.location.href = `/k/${node.slug}`}
                 style={{ cursor: 'pointer', opacity: isFiltered ? 0.15 : opacity }}>
                <circle cx={node.x} cy={node.y} r={r} fill={color} />
                {isHovered && (
                  <circle cx={node.x} cy={node.y} r={12} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
                )}
                <text
                  x={node.x}
                  y={node.y + r + 12}
                  textAnchor="middle"
                  fontSize={isHovered ? 11 : 9}
                  fill={isHovered ? "#e2e8f0" : "#94a3b8"}
                  fontFamily="Noto Sans SC, sans-serif"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 mt-4">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>前置知识</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5" style={{ backgroundColor: '#64748b', borderTop: '2px dashed #64748b' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>相关概念</span>
          </div>
        </div>
      </div>
    </div>
  );
}
