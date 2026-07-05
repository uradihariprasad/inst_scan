"use client";

import { useState } from "react";
import type { StockAnalysis } from "@/lib/analysis-engine";

interface Props {
  stocks: StockAnalysis[];
  title: string;
  onSelectStock: (stock: StockAnalysis) => void;
}

type SortKey = "overallScore" | "changePct" | "volume" | "rsi" | "adx" | "relativeVolume" | "institutionalScore";

export default function StockTable({ stocks, title, onSelectStock }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = stocks.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sector.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else { setSortKey(key); setSortDesc(true); }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className={`text-left text-[10px] uppercase tracking-wider font-medium flex items-center gap-0.5 ${
        sortKey === field ? "text-accent-blue" : "text-text-muted"
      }`}
    >
      {label}
      {sortKey === field && (
        <span className="text-[8px]">{sortDesc ? "▼" : "▲"}</span>
      )}
    </button>
  );

  const getOIBadge = (oi: StockAnalysis["oiInterpretation"]) => {
    const map: Record<string, { label: string; color: string }> = {
      LONG_BUILDUP: { label: "Long Build-up", color: "bg-accent-green/20 text-accent-green" },
      SHORT_BUILDUP: { label: "Short Build-up", color: "bg-accent-red/20 text-accent-red" },
      LONG_UNWINDING: { label: "Long Unwinding", color: "bg-accent-yellow/20 text-accent-yellow" },
      SHORT_COVERING: { label: "Short Covering", color: "bg-accent-cyan/20 text-accent-cyan" },
      NEUTRAL: { label: "Neutral", color: "bg-bg-secondary text-text-muted" },
    };
    const badge = map[oi] || map.NEUTRAL;
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>;
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{sorted.length} stocks</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-blue w-40"
          />
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/50">
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium">Stock</th>
                <th className="px-3 py-2.5"><SortHeader label="Score" field="overallScore" /></th>
                <th className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider text-text-muted font-medium">LTP</th>
                <th className="px-3 py-2.5"><SortHeader label="Change" field="changePct" /></th>
                <th className="px-3 py-2.5"><SortHeader label="Inst. Score" field="institutionalScore" /></th>
                <th className="px-3 py-2.5"><SortHeader label="Vol (x)" field="relativeVolume" /></th>
                <th className="px-3 py-2.5"><SortHeader label="RSI" field="rsi" /></th>
                <th className="px-3 py-2.5"><SortHeader label="ADX" field="adx" /></th>
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium">OI Analysis</th>
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium">VWAP</th>
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((stock) => (
                <tr
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className="hover:bg-bg-hover cursor-pointer transition"
                >
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="text-sm font-semibold text-text-primary">{stock.symbol}</span>
                      <p className="text-[10px] text-text-muted">{stock.sector}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${stock.overallScore > 60 ? "#10b98120" : stock.overallScore < 40 ? "#ef444420" : "#f59e0b20"}, transparent)`,
                          color: stock.overallScore > 60 ? "#10b981" : stock.overallScore < 40 ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {stock.overallScore}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm font-medium text-text-primary">₹{stock.ltp.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-medium ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${stock.institutionalScore}%`,
                            background: stock.institutionalScore > 60 ? "#10b981" : stock.institutionalScore < 40 ? "#ef4444" : "#f59e0b",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{stock.institutionalScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-text-secondary">{stock.relativeVolume.toFixed(1)}x</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs ${stock.rsi > 60 ? "text-accent-green" : stock.rsi < 40 ? "text-accent-red" : "text-text-secondary"}`}>
                      {stock.rsi.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs ${stock.adx > 25 ? "text-accent-green" : "text-text-muted"}`}>
                      {stock.adx.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{getOIBadge(stock.oiInterpretation)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs ${stock.priceVsVwap > 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {stock.priceVsVwap > 0 ? "Above" : "Below"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      stock.signal === "STRONG_BUY" ? "bg-accent-green/20 text-accent-green" :
                      stock.signal === "BUY" ? "bg-accent-green/10 text-accent-green" :
                      stock.signal === "STRONG_SELL" ? "bg-accent-red/20 text-accent-red" :
                      stock.signal === "SELL" ? "bg-accent-red/10 text-accent-red" :
                      "bg-bg-secondary text-text-muted"
                    }`}>
                      {stock.signal.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
