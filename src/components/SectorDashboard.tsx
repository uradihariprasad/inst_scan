"use client";

import { useState } from "react";
import type { StockAnalysis } from "@/lib/analysis-engine";

interface Props {
  sectors: Array<{ sector: string; strength: number; stockCount: number }>;
  stocks: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
}

export default function SectorDashboard({ sectors, stocks, onSelectStock }: Props) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const sectorStocks = selectedSector
    ? stocks.filter(s => s.sector === selectedSector).sort((a, b) => b.overallScore - a.overallScore)
    : [];

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">🏭 Sector Rotation Dashboard</h2>
        {selectedSector && (
          <button
            onClick={() => setSelectedSector(null)}
            className="text-xs text-accent-blue hover:underline"
          >
            ← Back to all sectors
          </button>
        )}
      </div>

      {!selectedSector ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sectors.map((sector) => {
            const sStocks = stocks.filter(s => s.sector === sector.sector);
            const bullish = sStocks.filter(s => s.direction === "BULLISH").length;
            const bearish = sStocks.filter(s => s.direction === "BEARISH").length;
            const avgScore = sStocks.reduce((sum, s) => sum + s.overallScore, 0) / Math.max(1, sStocks.length);
            const leader = sStocks.sort((a, b) => b.overallScore - a.overallScore)[0];

            return (
              <button
                key={sector.sector}
                onClick={() => setSelectedSector(sector.sector)}
                className="bg-bg-card border border-border rounded-xl p-4 text-left hover:bg-bg-hover transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition">
                    {sector.sector}
                  </h3>
                  <span className={`text-sm font-bold ${sector.strength > 0 ? "text-accent-green" : sector.strength < 0 ? "text-accent-red" : "text-text-muted"}`}>
                    {sector.strength >= 0 ? "+" : ""}{sector.strength.toFixed(2)}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{sector.stockCount} stocks</span>
                    <span>Avg Score: {avgScore.toFixed(0)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-accent-green"
                        style={{ width: `${(bullish / Math.max(1, sector.stockCount)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-accent-red"
                        style={{ width: `${(bearish / Math.max(1, sector.stockCount)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {bullish}↑ {bearish}↓
                    </span>
                  </div>

                  {leader && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] text-text-muted">Sector Leader</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-primary">{leader.symbol}</span>
                        <span className={`text-[10px] font-medium ${leader.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                          {leader.changePct >= 0 ? "+" : ""}{leader.changePct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-bg-secondary/50">
            <h3 className="text-sm font-semibold text-text-primary">{selectedSector} Stocks</h3>
          </div>
          <div className="divide-y divide-border">
            {sectorStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: stock.overallScore > 60 ? "#10b98115" : stock.overallScore < 40 ? "#ef444415" : "#f59e0b15",
                      color: stock.overallScore > 60 ? "#10b981" : stock.overallScore < 40 ? "#ef4444" : "#f59e0b",
                    }}
                  >
                    {stock.overallScore}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{stock.symbol}</p>
                    <p className="text-[10px] text-text-muted">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">₹{stock.ltp.toFixed(2)}</p>
                    <p className={`text-xs ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    stock.signal === "STRONG_BUY" ? "bg-accent-green/20 text-accent-green" :
                    stock.signal === "BUY" ? "bg-accent-green/10 text-accent-green" :
                    stock.signal === "STRONG_SELL" ? "bg-accent-red/20 text-accent-red" :
                    stock.signal === "SELL" ? "bg-accent-red/10 text-accent-red" :
                    "bg-bg-secondary text-text-muted"
                  }`}>
                    {stock.signal.replace(/_/g, " ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
