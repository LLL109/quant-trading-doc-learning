"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="flex-1 transition-[margin] duration-300"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-14 px-4 md:px-8 py-6 min-h-screen">
          {children}
        </main>
      </div>
    </>
  );
}
