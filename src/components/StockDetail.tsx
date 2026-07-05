"use client";

import { useState, useEffect } from "react";
import type { StockAnalysis } from "@/lib/analysis-engine";

interface OptionChainAnalysis {
  pcr: number;
  maxPain: number;
  totalCallOI: number;
  totalPutOI: number;
  callOIChange: number;
  putOIChange: number;
  strongPutWriting: boolean;
  strongCallWriting: boolean;
  callUnwinding: boolean;
  putUnwinding: boolean;
  supportLevels: number[];
  resistanceLevels: number[];
  bullishSignals: string[];
  bearishSignals: string[];
  score: number;
}

interface Props {
  stock: StockAnalysis;
  accessToken: string;
  onBack: () => void;
}

export default function StockDetail({ stock, accessToken, onBack }: Props) {
  const [ocAnalysis, setOcAnalysis] = useState<OptionChainAnalysis | null>(null);
  const [ocLoading, setOcLoading] = useState(false);

  useEffect(() => {
    const fetchOC = async () => {
      setOcLoading(true);
      try {
        const res = await fetch("/api/market/optionchain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            instrumentKey: stock.instrumentKey,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setOcAnalysis(data.analysis);
        }
      } catch {
        // Option chain might not be available for all stocks
      } finally {
        setOcLoading(false);
      }
    };
    fetchOC();
  }, [stock.instrumentKey, accessToken]);

  const isBullish = stock.direction === "BULLISH";
  const dirColor = isBullish ? "text-accent-green" : stock.direction === "BEARISH" ? "text-accent-red" : "text-accent-yellow";
  const dirBg = isBullish ? "bg-accent-green/10" : stock.direction === "BEARISH" ? "bg-accent-red/10" : "bg-accent-yellow/10";

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-bg-hover transition text-text-muted hover:text-text-primary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-text-primary">{stock.symbol}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dirBg} ${dirColor}`}>
                  {stock.direction}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  stock.signal.includes("BUY") ? "bg-accent-green/20 text-accent-green" :
                  stock.signal.includes("SELL") ? "bg-accent-red/20 text-accent-red" :
                  "bg-bg-secondary text-text-muted"
                }`}>
                  {stock.signal.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-text-muted">{stock.name} • {stock.sector}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-text-primary">₹{stock.ltp.toFixed(2)}</p>
              <p className={`text-sm font-medium ${stock.changePct >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                {stock.changePct >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 space-y-4">
        {/* Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            { label: "Overall", value: stock.overallScore, key: "overall" },
            { label: "Institutional", value: stock.institutionalScore, key: "inst" },
            { label: "Momentum", value: stock.momentumScore, key: "mom" },
            { label: "Trend", value: stock.trendScore, key: "trend" },
            { label: "Volume", value: stock.volumeScore, key: "vol" },
            { label: "OI", value: stock.oiScore, key: "oi" },
            { label: "Sector", value: stock.sectorScore, key: "sector" },
            { label: "Option Chain", value: ocAnalysis?.score || stock.optionChainScore, key: "oc" },
          ].map((score) => (
            <div key={score.key} className="bg-bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-[10px] text-text-muted mb-1">{score.label}</p>
              <div className="relative w-12 h-12 mx-auto mb-1">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    stroke={score.value > 60 ? "#10b981" : score.value < 40 ? "#ef4444" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray={`${score.value} ${100 - score.value}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
                  {score.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trade Recommendation */}
          <div className={`bg-bg-card border ${isBullish ? "border-accent-green/30" : "border-accent-red/30"} rounded-xl p-4`}>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              🎯 Trade Recommendation
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isBullish ? "bg-accent-green/20 text-accent-green" : "bg-accent-red/20 text-accent-red"}`}>
                {isBullish ? "CALL" : stock.direction === "BEARISH" ? "PUT" : "WAIT"}
              </span>
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-bg-secondary rounded-lg">
                  <p className="text-[10px] text-text-muted">Entry</p>
                  <p className="text-sm font-bold text-text-primary">₹{stock.entry.toFixed(2)}</p>
                </div>
                <div className="p-2.5 bg-accent-red/10 rounded-lg">
                  <p className="text-[10px] text-text-muted">Stop Loss</p>
                  <p className="text-sm font-bold text-accent-red">₹{stock.stopLoss.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-accent-green/10 rounded-lg">
                  <p className="text-[10px] text-text-muted">Target 1</p>
                  <p className="text-xs font-bold text-accent-green">₹{stock.target1.toFixed(2)}</p>
                </div>
                <div className="p-2.5 bg-accent-green/10 rounded-lg">
                  <p className="text-[10px] text-text-muted">Target 2</p>
                  <p className="text-xs font-bold text-accent-green">₹{stock.target2.toFixed(2)}</p>
                </div>
                <div className="p-2.5 bg-accent-green/10 rounded-lg">
                  <p className="text-[10px] text-text-muted">Target 3</p>
                  <p className="text-xs font-bold text-accent-green">₹{stock.target3.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
                <span>Risk:Reward {stock.riskReward}:1</span>
                <span>Hold: {stock.holdingTime}</span>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">📊 Technical Analysis</h3>
            <div className="space-y-2">
              {[
                { label: "VWAP", value: `₹${stock.vwap.toFixed(2)}`, status: stock.priceVsVwap > 0 ? "Above" : "Below", positive: stock.priceVsVwap > 0 },
                { label: "EMA 9", value: `₹${stock.ema9.toFixed(2)}`, status: stock.ltp > stock.ema9 ? "Above" : "Below", positive: stock.ltp > stock.ema9 },
                { label: "EMA 21", value: `₹${stock.ema21.toFixed(2)}`, status: stock.ltp > stock.ema21 ? "Above" : "Below", positive: stock.ltp > stock.ema21 },
                { label: "EMA 50", value: `₹${stock.ema50.toFixed(2)}`, status: stock.ltp > stock.ema50 ? "Above" : "Below", positive: stock.ltp > stock.ema50 },
                { label: "RSI (14)", value: stock.rsi.toFixed(1), status: stock.rsi > 60 ? "Bullish" : stock.rsi < 40 ? "Bearish" : "Neutral", positive: stock.rsi > 50 },
                { label: "ADX", value: stock.adx.toFixed(1), status: stock.adx > 25 ? "Strong Trend" : "Weak", positive: stock.adx > 25 },
                { label: "MACD Hist", value: stock.macdHistogram.toFixed(2), status: stock.macdHistogram > 0 ? "Positive" : "Negative", positive: stock.macdHistogram > 0 },
                { label: "ATR", value: stock.atr.toFixed(2), status: "", positive: true },
                { label: "BB Width", value: `${stock.bbWidth.toFixed(2)}%`, status: stock.bbWidth > 3 ? "Expanding" : "Contracting", positive: stock.bbWidth > 2 },
                { label: "Rel Volume", value: `${stock.relativeVolume.toFixed(1)}x`, status: stock.relativeVolume > 1.5 ? "High" : "Normal", positive: stock.relativeVolume > 1 },
              ].map((ind) => (
                <div key={ind.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{ind.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary font-medium">{ind.value}</span>
                    {ind.status && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${ind.positive ? "bg-accent-green/10 text-accent-green" : "bg-accent-red/10 text-accent-red"}`}>
                        {ind.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OI & Price Action */}
          <div className="space-y-4">
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">📈 OI Analysis</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">OI Interpretation</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stock.oiInterpretation === "LONG_BUILDUP" ? "bg-accent-green/20 text-accent-green" :
                    stock.oiInterpretation === "SHORT_BUILDUP" ? "bg-accent-red/20 text-accent-red" :
                    stock.oiInterpretation === "SHORT_COVERING" ? "bg-accent-cyan/20 text-accent-cyan" :
                    stock.oiInterpretation === "LONG_UNWINDING" ? "bg-accent-yellow/20 text-accent-yellow" :
                    "bg-bg-secondary text-text-muted"
                  }`}>
                    {stock.oiInterpretation.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Open Interest</span>
                  <span className="text-text-secondary">{stock.oi.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">OI Change</span>
                  <span className={stock.oiChange >= 0 ? "text-accent-green" : "text-accent-red"}>
                    {stock.oiChange >= 0 ? "+" : ""}{stock.oiChange.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">🕯 Price Action</h3>
              <div className="space-y-2">
                {[
                  { label: "Higher High", check: stock.higherHigh },
                  { label: "Higher Low", check: stock.higherLow },
                  { label: "Lower High", check: stock.lowerHigh },
                  { label: "Lower Low", check: stock.lowerLow },
                  { label: "EMA Aligned", check: stock.emaAligned },
                  { label: "Smooth Momentum", check: stock.smoothMomentum },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">{item.label}</span>
                    <span className={item.check ? "text-accent-green" : "text-text-muted"}>
                      {item.check ? "✅" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Option Chain Analysis */}
        {ocLoading ? (
          <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto mb-2" />
            <p className="text-text-muted text-sm">Loading option chain data...</p>
          </div>
        ) : ocAnalysis ? (
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">🔗 Option Chain Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-[10px] text-text-muted">PCR</p>
                <p className={`text-lg font-bold ${ocAnalysis.pcr > 1 ? "text-accent-green" : "text-accent-red"}`}>
                  {ocAnalysis.pcr.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-[10px] text-text-muted">Max Pain</p>
                <p className="text-lg font-bold text-accent-blue">₹{ocAnalysis.maxPain}</p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-[10px] text-text-muted">Total Call OI</p>
                <p className="text-sm font-bold text-accent-red">{(ocAnalysis.totalCallOI / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-[10px] text-text-muted">Total Put OI</p>
                <p className="text-sm font-bold text-accent-green">{(ocAnalysis.totalPutOI / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-accent-green mb-2">Bullish Signals</h4>
                {ocAnalysis.bullishSignals.length === 0 ? (
                  <p className="text-xs text-text-muted">None</p>
                ) : ocAnalysis.bullishSignals.map((s, i) => (
                  <p key={i} className="text-xs text-accent-green">✅ {s}</p>
                ))}
                <div className="mt-2">
                  <p className="text-[10px] text-text-muted">Support Levels</p>
                  <div className="flex gap-2 mt-1">
                    {ocAnalysis.supportLevels.map((l, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-accent-green/10 text-accent-green rounded">₹{l}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-accent-red mb-2">Bearish Signals</h4>
                {ocAnalysis.bearishSignals.length === 0 ? (
                  <p className="text-xs text-text-muted">None</p>
                ) : ocAnalysis.bearishSignals.map((s, i) => (
                  <p key={i} className="text-xs text-accent-red">❌ {s}</p>
                ))}
                <div className="mt-2">
                  <p className="text-[10px] text-text-muted">Resistance Levels</p>
                  <div className="flex gap-2 mt-1">
                    {ocAnalysis.resistanceLevels.map((l, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-accent-red/10 text-accent-red rounded">₹{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Trade Explanation */}
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">💡 AI Trade Explanation</h3>
          <div className="space-y-1.5">
            {stock.reasons.length === 0 ? (
              <p className="text-xs text-text-muted">No significant signals detected for this stock.</p>
            ) : stock.reasons.map((reason, i) => (
              <p key={i} className="text-sm text-text-secondary">{reason}</p>
            ))}
          </div>
          {stock.institutionalBuying && (
            <div className="mt-3 p-3 bg-accent-green/5 border border-accent-green/20 rounded-lg">
              <p className="text-xs text-accent-green font-medium">
                🏦 Institutional buying confirmed. Multiple signals align for a high-probability long entry.
              </p>
            </div>
          )}
          {stock.institutionalSelling && (
            <div className="mt-3 p-3 bg-accent-red/5 border border-accent-red/20 rounded-lg">
              <p className="text-xs text-accent-red font-medium">
                🏦 Institutional selling confirmed. Distribution pattern detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
