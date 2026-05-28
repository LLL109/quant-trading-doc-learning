"use client";

import { BookOpen, BarChart2, TrendingUp, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/knowledge", label: "知识库", icon: BookOpen },
  { href: "/market", label: "行情", icon: BarChart2 },
  { href: "/progress", label: "进度", icon: TrendingUp },
];

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 right-0 left-0 flex items-center justify-between px-4 md:px-6 z-30 topbar-offset"
      style={{
        height: "var(--topbar-height)",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg lg:hidden"
          style={{ color: "var(--text-secondary)" }}
          aria-label="打开导航"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--accent-green)", color: "var(--bg-primary)" }}
          >
            Q
          </span>
          <span
            className="font-semibold text-sm"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            QuantLearn
          </span>
        </Link>
      </div>

      <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{
                color: isActive ? "var(--accent-green)" : "var(--text-secondary)",
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
