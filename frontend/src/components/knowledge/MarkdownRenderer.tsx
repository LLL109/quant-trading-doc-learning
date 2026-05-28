"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Link from "next/link";
import { Children, isValidElement, type ReactNode, useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Code2 } from "lucide-react";

const PYTHON_LANGS = [
  "language-python",
  "language-py",
  "language-python3",
];

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
}

function getTextContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<CodeElementProps>(child)) {
        return getTextContent(child.props.children);
      }
      return "";
    })
    .join("");
}

function getCodeClassName(children: ReactNode): string {
  const firstChild = Children.toArray(children)[0];
  return isValidElement<CodeElementProps>(firstChild)
    ? firstChild.props.className ?? ""
    : "";
}

// Code block: copy button + Python folding
function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const code = getTextContent(children);
  const langClass = getCodeClassName(children);
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
const components: Components = {
  // Wiki links: detect /k/ prefixed links
  a: ({ href, children, ...props }) => {
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
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,

  // Table wrapper for responsive scrolling
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table {...props}>{children}</table>
    </div>
  ),

  // Headings with anchor IDs for TOC
  h1: ({ children, ...props }) => (
    <h1 id={generateId(children)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 id={generateId(children)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={generateId(children)} {...props}>
      {children}
    </h3>
  ),
};

function generateId(children: ReactNode): string {
  return getTextContent(children)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w一-鿿-]/g, "");
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
