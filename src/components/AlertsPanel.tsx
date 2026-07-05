"use client";

import type { StockAnalysis } from "@/lib/analysis-engine";

interface Alert {
  symbol: string;
  type: string;
  message: string;
  score: number;
  direction: string;
}

interface Props {
  alerts: Alert[];
  stocks: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
}

export default function AlertsPanel({ alerts, stocks, onSelectStock }: Props) {
  const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
    INSTITUTIONAL_BUYING: { icon: "🏦", color: "text-accent-green", bg: "bg-accent-green/10 border-accent-green/30" },
    INSTITUTIONAL_SELLING: { icon: "🏦", color: "text-accent-red", bg: "bg-accent-red/10 border-accent-red/30" },
    LONG_BUILDUP: { icon: "🟢", color: "text-accent-green", bg: "bg-accent-green/10 border-accent-green/30" },
    SHORT_BUILDUP: { icon: "🔴", color: "text-accent-red", bg: "bg-accent-red/10 border-accent-red/30" },
    MOMENTUM: { icon: "⚡", color: "text-accent-yellow", bg: "bg-accent-yellow/10 border-accent-yellow/30" },
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-lg font-bold text-text-primary">🔔 AI Alerts</h2>

      {alerts.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">No alerts at this time.</p>
          <p className="text-text-muted text-xs mt-1">Alerts trigger when institutional activity is detected.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const config = typeConfig[alert.type] || typeConfig.MOMENTUM;
            const stock = stocks.find(s => s.symbol === alert.symbol);

            return (
              <button
                key={i}
                onClick={() => stock && onSelectStock(stock)}
                className={`w-full ${config.bg} border rounded-xl p-4 text-left hover:opacity-80 transition`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${config.color}`}>{alert.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted">
                        {alert.type.replace(/_/g, " ")}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        alert.direction === "BULLISH" ? "bg-accent-green/20 text-accent-green" :
                        alert.direction === "BEARISH" ? "bg-accent-red/20 text-accent-red" :
                        "bg-bg-secondary text-text-muted"
                      }`}>
                        {alert.direction}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{alert.message}</p>
                    {stock && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        <span>₹{stock.ltp.toFixed(2)}</span>
                        <span className={stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}>
                          {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                        </span>
                        <span>Vol: {stock.relativeVolume.toFixed(1)}x</span>
                        <span>RSI: {stock.rsi.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-lg font-bold ${config.color}`}>{alert.score}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
