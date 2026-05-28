"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Link from "next/link";
import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Code2 } from "lucide-react";

const PYTHON_LANGS = [
  "language-python",
  "language-py",
  "language-python3",
];

// Code block: copy button + Python folding
function CodeBlock({ children }: { children: any }) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const code =
    typeof children?.props?.children === "string"
      ? children.props.children
      : "";

  const langClass: string = children?.props?.className || "";
  const isPython = PYTHON_LANGS.some((l) => langClass.includes(l));
  const langLabel = langClass.replace("language-", "") || "code";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isPython) {
    return (
      <div className="relative group">
        <pre>{children}</pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded"
          style={{
            backgroundColor: "var(--bg-hover)",
            color: "var(--text-muted)",
          }}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="code-fold-wrapper" style={{ margin: "16px 0" }}>
      <div
        className="code-fold-header"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          background: "var(--bg-tertiary)",
          borderRadius: collapsed ? "8px" : "8px 8px 0 0",
          borderLeft: "3px solid var(--accent-gold)",
          cursor: "pointer",
          userSelect: "none",
          color: "var(--text-secondary)",
          fontSize: "13px",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" />
        )}
        <Code2 className="w-4 h-4 shrink-0" />
        <span style={{ fontWeight: 500 }}>{langLabel}</span>
        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          {code.split("\n").length} lines
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
          style={{
            backgroundColor: "var(--bg-hover)",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      {!collapsed && (
        <div style={{ position: "relative" }}>
          <pre
            style={{
              marginTop: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            {children}
          </pre>
        </div>
      )}
    </div>
  );
}

// Custom component mapping
const components = {
  // Wiki links: detect /k/ prefixed links
  a: ({ href, children, ...props }: any) => {
    if (href && href.startsWith("/k/")) {
      return (
        <Link href={href} className="wiki-link">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  // Code blocks: copy + Python folding
  pre: ({ children }: any) => <CodeBlock>{children}</CodeBlock>,

  // Table wrapper for responsive scrolling
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table {...props}>{children}</table>
    </div>
  ),

  // Headings with anchor IDs for TOC
  h1: ({ children, ...props }: any) => (
    <h1 id={generateId(children)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 id={generateId(children)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 id={generateId(children)} {...props}>
      {children}
    </h3>
  ),
};

function generateId(children: any): string {
  if (typeof children === "string") {
    return children
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w一-鿿-]/g, "");
  }
  return "";
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const cleanContent = stripFrontmatter(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
    >
      {cleanContent}
    </ReactMarkdown>
  );
}
