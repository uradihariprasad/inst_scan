"use client";

import type { StockAnalysis, MarketSentiment } from "@/lib/analysis-engine";

interface ScanResult {
  sentiment: MarketSentiment;
  topBuying: StockAnalysis[];
  topSelling: StockAnalysis[];
  allStocks: StockAnalysis[];
  sectorAnalysis: Array<{ sector: string; strength: number; stockCount: number }>;
  alerts: Array<{ symbol: string; type: string; message: string; score: number; direction: string }>;
}

interface Props {
  data: ScanResult;
  onSelectStock: (stock: StockAnalysis) => void;
}

export default function MarketOverview({ data, onSelectStock }: Props) {
  const { sentiment, topBuying, topSelling, allStocks, sectorAnalysis, alerts } = data;

  const bullish = allStocks.filter(s => s.direction === "BULLISH").length;
  const bearish = allStocks.filter(s => s.direction === "BEARISH").length;
  const neutral = allStocks.filter(s => s.direction === "NEUTRAL").length;

  const sentimentColor = sentiment.overall.includes("BULLISH")
    ? "text-accent-green"
    : sentiment.overall.includes("BEARISH")
    ? "text-accent-red"
    : "text-accent-yellow";

  const sentimentBg = sentiment.overall.includes("BULLISH")
    ? "from-accent-green/10 to-accent-green/5"
    : sentiment.overall.includes("BEARISH")
    ? "from-accent-red/10 to-accent-red/5"
    : "from-accent-yellow/10 to-accent-yellow/5";

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Sentiment Banner */}
      <div className={`bg-gradient-to-r ${sentimentBg} border border-border rounded-xl p-5`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Market Sentiment</p>
            <h2 className={`text-2xl font-bold ${sentimentColor}`}>
              {sentiment.overall.replace(/_/g, " ")}
            </h2>
            <p className="text-text-secondary text-sm mt-1">{sentiment.description}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-green">{sentiment.advanceDecline.advances}</p>
              <p className="text-xs text-text-muted">Advancing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-red">{sentiment.advanceDecline.declines}</p>
              <p className="text-xs text-text-muted">Declining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-blue">{sentiment.marketScore}</p>
              <p className="text-xs text-text-muted">Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bullish Stocks", value: bullish, color: "text-accent-green", bg: "bg-accent-green/10" },
          { label: "Bearish Stocks", value: bearish, color: "text-accent-red", bg: "bg-accent-red/10" },
          { label: "Neutral", value: neutral, color: "text-accent-yellow", bg: "bg-accent-yellow/10" },
          { label: "A/D Ratio", value: sentiment.advanceDecline.ratio.toFixed(2), color: sentiment.advanceDecline.ratio > 1 ? "text-accent-green" : "text-accent-red", bg: "bg-accent-blue/10" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-border rounded-xl p-4`}>
            <p className="text-text-muted text-xs mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Buying */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-glow" />
            <h3 className="text-sm font-semibold text-text-primary">🟢 Top Institutional Buying</h3>
          </div>
          <div className="divide-y divide-border">
            {topBuying.length === 0 ? (
              <div className="p-4 text-text-muted text-sm text-center">No strong buying signals detected</div>
            ) : topBuying.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{stock.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green font-medium">
                      Score: {stock.overallScore}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{stock.reasons[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">₹{stock.ltp.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Selling */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse-glow" />
            <h3 className="text-sm font-semibold text-text-primary">🔴 Top Institutional Selling</h3>
          </div>
          <div className="divide-y divide-border">
            {topSelling.length === 0 ? (
              <div className="p-4 text-text-muted text-sm text-center">No strong selling signals detected</div>
            ) : topSelling.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{stock.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-red/20 text-accent-red font-medium">
                      Score: {stock.overallScore}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{stock.reasons[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">₹{stock.ltp.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Heatmap + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector Heatmap */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">🏭 Sector Heatmap</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sectorAnalysis.map((sector) => {
              const bg = sector.strength > 1 ? "bg-accent-green/20 border-accent-green/30" :
                sector.strength > 0 ? "bg-accent-green/10 border-accent-green/20" :
                sector.strength < -1 ? "bg-accent-red/20 border-accent-red/30" :
                sector.strength < 0 ? "bg-accent-red/10 border-accent-red/20" :
                "bg-bg-secondary border-border";
              const textColor = sector.strength > 0 ? "text-accent-green" : sector.strength < 0 ? "text-accent-red" : "text-text-muted";
              return (
                <div key={sector.sector} className={`${bg} border rounded-lg p-2.5`}>
                  <p className="text-xs font-medium text-text-primary truncate">{sector.sector}</p>
                  <p className={`text-sm font-bold ${textColor}`}>
                    {sector.strength >= 0 ? "+" : ""}{sector.strength.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-text-muted">{sector.stockCount} stocks</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">🔔 Active Alerts</h3>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-text-muted text-sm text-center">No active alerts</div>
            ) : alerts.map((alert, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.direction === "BULLISH" ? "bg-accent-green" : alert.direction === "BEARISH" ? "bg-accent-red" : "bg-accent-yellow"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">{alert.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-secondary text-text-muted">
                      {alert.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{alert.message}</p>
                </div>
                <span className={`text-xs font-bold ${alert.score > 60 ? "text-accent-green" : alert.score < 40 ? "text-accent-red" : "text-accent-yellow"}`}>
                  {alert.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
