"use client";

import { useEffect, useState } from "react";
import { Search, BarChart2 } from "lucide-react";
import KLineChart from "@/components/charts/KLineChart";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8040";

interface KlineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SearchResult {
  code: string;
  name: string;
  price: number;
}

export default function MarketPage() {
  const [code, setCode] = useState("000001");
  const [stockName, setStockName] = useState("平安银行");
  const [klineData, setKlineData] = useState<KlineData[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("daily");

  // 获取K线数据
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/market/kline?code=${code}&period=${period}`)
      .then((res) => res.json())
      .then(setKlineData)
      .catch(() => setKlineData([]))
      .finally(() => setLoading(false));
  }, [code, period]);

  // 搜索
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/api/market/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectStock = (stock: SearchResult) => {
    setCode(stock.code);
    setStockName(stock.name);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          行情看板
        </h1>

        {/* 搜索框 */}
        <div className="relative w-full max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="搜索股票代码或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-20"
                 style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              {searchResults.map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => selectStock(stock)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>{stock.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{stock.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 股票信息 + 周期切换 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
          <span className="font-medium">{stockName}</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{code}</span>
        </div>

        <div className="flex gap-1 ml-auto">
          {[
            { key: "daily", label: "日K" },
            { key: "weekly", label: "周K" },
            { key: "monthly", label: "月K" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: period === p.key ? 'var(--accent-green-dim)' : 'var(--bg-tertiary)',
                color: period === p.key ? 'var(--accent-green)' : 'var(--text-muted)',
                border: `1px solid ${period === p.key ? 'var(--accent-green)' : 'var(--border-color)'}`,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* K线图 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-96" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
            加载中...
          </div>
        ) : klineData.length === 0 ? (
          <div className="flex items-center justify-center h-96" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
            无数据
          </div>
        ) : (
          <KLineChart data={klineData} height={450} showVolume={true} />
        )}
      </div>

      {/* 最近数据 */}
      {klineData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "最新收盘", value: klineData[klineData.length - 1].close.toFixed(2), color: "var(--text-primary)" },
            { label: "今日开盘", value: klineData[klineData.length - 1].open.toFixed(2), color: "var(--text-primary)" },
            { label: "最高价", value: klineData[klineData.length - 1].high.toFixed(2), color: "var(--accent-green)" },
            { label: "最低价", value: klineData[klineData.length - 1].low.toFixed(2), color: "var(--accent-red)" },
            { label: "成交量", value: (klineData[klineData.length - 1].volume / 10000).toFixed(0) + "万", color: "var(--accent-blue)" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg text-center"
                 style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              <div className="font-bold" style={{ color: item.color, fontFamily: 'JetBrains Mono' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
