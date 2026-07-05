import { NextRequest, NextResponse } from "next/server";
import { getFullMarketQuotes, getIntradayCandles } from "@/lib/upstox-api";
import { analyzeStock, calculateMarketSentiment } from "@/lib/analysis-engine";
import { NSE_FO_STOCKS } from "@/lib/nse-fo-stocks";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    const instrumentKeys = NSE_FO_STOCKS.map(s => s.instrumentKey);

    // Fetch full market quotes (up to 500 at once)
    let quotes: Record<string, Record<string, unknown>> = {};
    try {
      const rawQuotes = await getFullMarketQuotes(instrumentKeys, accessToken);
      quotes = rawQuotes as unknown as Record<string, Record<string, unknown>>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch quotes";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // Fetch intraday candles for top movers (limit API calls)
    const analyses = [];
    const sectorChanges: Record<string, number[]> = {};

    // First pass: calculate sector strength from quotes
    for (const stock of NSE_FO_STOCKS) {
      const qKey = Object.keys(quotes).find(k => k.includes(stock.symbol) || k.includes(stock.instrumentKey));
      const q = qKey ? quotes[qKey] : null;
      if (q) {
        const ohlc = q.ohlc as { open: number; high: number; low: number; close: number } | undefined;
        const ltp = (q.last_price as number) || 0;
        const prevClose = ohlc?.close || ltp;
        const changePct = prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : 0;
        if (!sectorChanges[stock.sector]) sectorChanges[stock.sector] = [];
        sectorChanges[stock.sector].push(changePct);
      }
    }

    const sectorStrength: Record<string, number> = {};
    for (const [sector, changes] of Object.entries(sectorChanges)) {
      sectorStrength[sector] = changes.reduce((a, b) => a + b, 0) / changes.length;
    }

    // Second pass: analyze each stock
    for (const stock of NSE_FO_STOCKS) {
      const qKey = Object.keys(quotes).find(k => k.includes(stock.symbol) || k.includes(stock.instrumentKey));
      const q = qKey ? quotes[qKey] : null;
      if (!q) continue;

      const ohlc = q.ohlc as { open: number; high: number; low: number; close: number } | undefined;
      const ltp = (q.last_price as number) || 0;
      if (ltp === 0) continue;

      // Try to get intraday candles
      let candles;
      try {
        candles = await getIntradayCandles(stock.instrumentKey, "30minute", accessToken);
      } catch {
        // If candle fetch fails, create minimal candle data from quote
        candles = [{
          timestamp: new Date().toISOString(),
          open: ohlc?.open || ltp,
          high: ohlc?.high || ltp,
          low: ohlc?.low || ltp,
          close: ltp,
          volume: (q.volume as number) || 0,
          oi: (q.oi as number) || 0,
        }];
      }

      const analysis = analyzeStock(
        stock.symbol,
        stock.name,
        stock.sector,
        stock.instrumentKey,
        {
          ltp,
          open: ohlc?.open || ltp,
          high: ohlc?.high || ltp,
          low: ohlc?.low || ltp,
          close: ohlc?.close || ltp,
          volume: (q.volume as number) || 0,
          oi: (q.oi as number) || 0,
          averagePrice: (q.average_price as number) || ltp,
          totalBuyQty: (q.total_buy_quantity as number) || 0,
          totalSellQty: (q.total_sell_quantity as number) || 0,
          prevClose: ohlc?.close || ltp,
          prevOi: 0,
        },
        candles,
        sectorStrength[stock.sector] || 0
      );

      analyses.push(analysis);
    }

    // Sort by overall score
    analyses.sort((a, b) => b.overallScore - a.overallScore);

    // Market sentiment
    const sentiment = calculateMarketSentiment(analyses);

    // Top 5 buying + top 5 selling
    const topBuying = analyses
      .filter(a => a.direction === "BULLISH")
      .slice(0, 5);
    const topSelling = analyses
      .filter(a => a.direction === "BEARISH")
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 5);

    // Sector analysis
    const sectorAnalysis = Object.entries(sectorStrength)
      .map(([sector, strength]) => ({
        sector,
        strength: Math.round(strength * 100) / 100,
        stockCount: sectorChanges[sector]?.length || 0,
      }))
      .sort((a, b) => b.strength - a.strength);

    // Alerts
    const alerts = analyses
      .filter(a => a.reasons.length >= 3)
      .slice(0, 10)
      .map(a => ({
        symbol: a.symbol,
        type: a.institutionalBuying ? "INSTITUTIONAL_BUYING" :
              a.institutionalSelling ? "INSTITUTIONAL_SELLING" :
              a.oiInterpretation === "LONG_BUILDUP" ? "LONG_BUILDUP" :
              a.oiInterpretation === "SHORT_BUILDUP" ? "SHORT_BUILDUP" : "MOMENTUM",
        message: a.reasons[0] || "",
        score: a.overallScore,
        direction: a.direction,
      }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalStocks: analyses.length,
      sentiment,
      topBuying,
      topSelling,
      allStocks: analyses,
      sectorAnalysis,
      alerts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
