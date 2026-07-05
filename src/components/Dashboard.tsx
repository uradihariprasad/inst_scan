"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StockAnalysis, MarketSentiment } from "@/lib/analysis-engine";
import MarketOverview from "./MarketOverview";
import StockTable from "./StockTable";
import TopPicks from "./TopPicks";
import SectorDashboard from "./SectorDashboard";
import AlertsPanel from "./AlertsPanel";
import StockDetail from "./StockDetail";

interface ScanResult {
  timestamp: string;
  totalStocks: number;
  sentiment: MarketSentiment;
  topBuying: StockAnalysis[];
  topSelling: StockAnalysis[];
  allStocks: StockAnalysis[];
  sectorAnalysis: Array<{ sector: string; strength: number; stockCount: number }>;
  alerts: Array<{
    symbol: string;
    type: string;
    message: string;
    score: number;
    direction: string;
  }>;
}

type Tab = "overview" | "buying" | "selling" | "all" | "sectors" | "alerts" | "recommendations";

interface DashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export default function Dashboard({ accessToken, onLogout }: DashboardProps) {
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/market/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch data");
      }
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000); // 30 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchData]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Market Overview", icon: "📊" },
    { id: "recommendations", label: "AI Recommendations", icon: "🎯" },
    { id: "buying", label: "Inst. Buying", icon: "🟢" },
    { id: "selling", label: "Inst. Selling", icon: "🔴" },
    { id: "all", label: "All Stocks", icon: "📋" },
    { id: "sectors", label: "Sectors", icon: "🏭" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
  ];

  if (selectedStock) {
    return (
      <StockDetail
        stock={selectedStock}
        accessToken={accessToken}
        onBack={() => setSelectedStock(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary">IMI Platform</h1>
              <p className="text-[10px] text-text-muted">Institutional Momentum Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {data && (
              <div className="hidden md:flex items-center gap-3 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  data.sentiment.overall.includes("BULLISH")
                    ? "bg-accent-green/20 text-accent-green"
                    : data.sentiment.overall.includes("BEARISH")
                    ? "bg-accent-red/20 text-accent-red"
                    : "bg-accent-yellow/20 text-accent-yellow"
                }`}>
                  {data.sentiment.overall.replace("_", " ")}
                </span>
                <span className="text-text-muted">
                  {data.totalStocks} stocks scanned
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-text-muted">
              {lastUpdated && <span>Updated: {lastUpdated}</span>}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1.5 rounded-md transition ${autoRefresh ? "bg-accent-green/20 text-accent-green" : "bg-bg-secondary text-text-muted"}`}
                title={autoRefresh ? "Auto-refresh ON (30s)" : "Auto-refresh OFF"}
              >
                <svg className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: "3s" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={fetchData}
                className="p-1.5 rounded-md bg-bg-secondary text-text-muted hover:text-text-primary transition"
                title="Refresh now"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <button
              onClick={onLogout}
              className="text-xs text-text-muted hover:text-accent-red transition px-2 py-1 rounded-md hover:bg-accent-red/10"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-accent-blue text-accent-blue"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1920px] mx-auto p-4">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-text-primary font-medium">Scanning NSE F&O Stocks...</p>
              <p className="text-text-muted text-sm mt-1">Analyzing institutional momentum across 50 stocks</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-accent-red font-medium">Error Loading Data</p>
              <p className="text-text-muted text-sm mt-1 max-w-md">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg text-sm hover:bg-accent-blue/30 transition"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <>
            {activeTab === "overview" && (
              <MarketOverview data={data} onSelectStock={setSelectedStock} />
            )}
            {activeTab === "recommendations" && (
              <TopPicks
                buying={data.topBuying}
                selling={data.topSelling}
                onSelectStock={setSelectedStock}
              />
            )}
            {activeTab === "buying" && (
              <StockTable
                stocks={data.allStocks.filter(s => s.direction === "BULLISH")}
                title="Institutional Buying Stocks"
                onSelectStock={setSelectedStock}
              />
            )}
            {activeTab === "selling" && (
              <StockTable
                stocks={data.allStocks.filter(s => s.direction === "BEARISH")}
                title="Institutional Selling Stocks"
                onSelectStock={setSelectedStock}
              />
            )}
            {activeTab === "all" && (
              <StockTable
                stocks={data.allStocks}
                title="All F&O Stocks"
                onSelectStock={setSelectedStock}
              />
            )}
            {activeTab === "sectors" && (
              <SectorDashboard
                sectors={data.sectorAnalysis}
                stocks={data.allStocks}
                onSelectStock={setSelectedStock}
              />
            )}
            {activeTab === "alerts" && (
              <AlertsPanel alerts={data.alerts} stocks={data.allStocks} onSelectStock={setSelectedStock} />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
