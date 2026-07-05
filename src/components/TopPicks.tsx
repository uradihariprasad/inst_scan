"use client";

import type { StockAnalysis } from "@/lib/analysis-engine";

interface Props {
  buying: StockAnalysis[];
  selling: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-muted w-16 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-text-secondary w-6 text-right">{value}</span>
    </div>
  );
}

function TradeCard({ stock, type, onSelect }: { stock: StockAnalysis; type: "BUY" | "SELL"; onSelect: () => void }) {
  const isBuy = type === "BUY";
  const borderColor = isBuy ? "border-accent-green/30" : "border-accent-red/30";
  const headerBg = isBuy ? "from-accent-green/10 to-transparent" : "from-accent-red/10 to-transparent";
  const accent = isBuy ? "text-accent-green" : "text-accent-red";
  const badgeBg = isBuy ? "bg-accent-green/20" : "bg-accent-red/20";

  return (
    <div
      onClick={onSelect}
      className={`bg-bg-card border ${borderColor} rounded-xl overflow-hidden cursor-pointer hover:border-opacity-60 transition`}
    >
      <div className={`bg-gradient-to-r ${headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${accent}`}>{stock.symbol}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeBg} ${accent} font-medium`}>
            {type === "BUY" ? "CALL" : "PUT"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xl font-bold ${accent}`}>{stock.overallScore}</div>
          <span className="text-[10px] text-text-muted">/ 100</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Price & Change */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">LTP</p>
            <p className="text-lg font-bold text-text-primary">₹{stock.ltp.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Change</p>
            <p className={`text-sm font-bold ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
              {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">VWAP</p>
            <p className={`text-sm font-medium ${stock.priceVsVwap > 0 ? "text-accent-green" : "text-accent-red"}`}>
              {stock.priceVsVwap > 0 ? "Above" : "Below"}
            </p>
          </div>
        </div>

        {/* Trade Levels */}
        <div className="grid grid-cols-4 gap-2 p-2 bg-bg-secondary rounded-lg">
          <div>
            <p className="text-[10px] text-text-muted">Entry</p>
            <p className="text-xs font-semibold text-text-primary">₹{stock.entry.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted">SL</p>
            <p className="text-xs font-semibold text-accent-red">₹{stock.stopLoss.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted">T1</p>
            <p className="text-xs font-semibold text-accent-green">₹{stock.target1.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted">T2</p>
            <p className="text-xs font-semibold text-accent-green">₹{stock.target2.toFixed(1)}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="space-y-1.5">
          <ScoreBar label="Institutional" value={stock.institutionalScore} color={isBuy ? "#10b981" : "#ef4444"} />
          <ScoreBar label="Momentum" value={stock.momentumScore} color={isBuy ? "#10b981" : "#ef4444"} />
          <ScoreBar label="Trend" value={stock.trendScore} color={isBuy ? "#10b981" : "#ef4444"} />
          <ScoreBar label="Volume" value={stock.volumeScore} color="#3b82f6" />
          <ScoreBar label="OI" value={stock.oiScore} color="#8b5cf6" />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border">
          <span>R:R {stock.riskReward}:1</span>
          <span>Hold: {stock.holdingTime}</span>
          <span>{stock.sector}</span>
        </div>

        {/* Reasons */}
        <div className="space-y-1">
          {stock.reasons.slice(0, 4).map((reason, i) => (
            <p key={i} className="text-[10px] text-text-secondary">{reason}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopPicks({ buying, selling, onSelectStock }: Props) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎯</span>
          <h2 className="text-lg font-bold text-text-primary">AI Trade Recommendations</h2>
          <span className="text-xs text-text-muted">• Top 5 highest probability trades</span>
        </div>

        {buying.length === 0 && selling.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted text-sm">No high-conviction trades detected at this moment.</p>
            <p className="text-text-muted text-xs mt-1">AI requires multiple confirmations before recommending.</p>
          </div>
        ) : null}
      </div>

      {buying.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-green mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            CALL Recommendations (Bullish)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {buying.map((stock) => (
              <TradeCard
                key={stock.symbol}
                stock={stock}
                type="BUY"
                onSelect={() => onSelectStock(stock)}
              />
            ))}
          </div>
        </div>
      )}

      {selling.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-red mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
            PUT Recommendations (Bearish)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {selling.map((stock) => (
              <TradeCard
                key={stock.symbol}
                stock={stock}
                type="SELL"
                onSelect={() => onSelectStock(stock)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
