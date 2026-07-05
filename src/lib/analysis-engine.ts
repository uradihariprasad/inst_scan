// Institutional Momentum Analysis Engine
import type { CandleData, OptionChainData } from "./upstox-api";

// ===================== TECHNICAL INDICATORS =====================

export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const ema: number[] = [data[0]];
  const multiplier = 2 / (period + 1);
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * multiplier + ema[i - 1] * (1 - multiplier));
  }
  return ema;
}

export function calculateVWAP(candles: CandleData[]): number[] {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  return candles.map((c) => {
    const tp = (c.high + c.low + c.close) / 3;
    cumulativeTPV += tp * c.volume;
    cumulativeVolume += c.volume;
    return cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : c.close;
  });
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length < period + 1) return closes.map(() => 50);
  const rsi: number[] = new Array(period).fill(50);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;
  rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) / period;
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return rsi;
}

export function calculateMACD(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateADX(candles: CandleData[], period: number = 14): number[] {
  if (candles.length < period + 1) return candles.map(() => 25);
  const trueRanges: number[] = [];
  const plusDMs: number[] = [];
  const minusDMs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
    const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;
    plusDMs.push(plusDM);
    minusDMs.push(minusDM);
  }

  const smoothedTR = calculateEMA(trueRanges, period);
  const smoothedPlusDM = calculateEMA(plusDMs, period);
  const smoothedMinusDM = calculateEMA(minusDMs, period);

  const adxValues: number[] = [25];
  for (let i = 0; i < smoothedTR.length; i++) {
    if (smoothedTR[i] === 0) { adxValues.push(25); continue; }
    const plusDI = (smoothedPlusDM[i] / smoothedTR[i]) * 100;
    const minusDI = (smoothedMinusDM[i] / smoothedTR[i]) * 100;
    const dx = plusDI + minusDI === 0 ? 0 : (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
    adxValues.push(dx);
  }
  return calculateEMA(adxValues, period);
}

export function calculateATR(candles: CandleData[], period: number = 14): number[] {
  if (candles.length < 2) return candles.map(() => 0);
  const trueRanges: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    trueRanges.push(
      Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1].close),
        Math.abs(candles[i].low - candles[i - 1].close)
      )
    );
  }
  return calculateEMA(trueRanges, period);
}

export function calculateBollingerBands(closes: number[], period: number = 20): { upper: number[]; middle: number[]; lower: number[] } {
  const result = { upper: [] as number[], middle: [] as number[], lower: [] as number[] };
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.upper.push(closes[i]);
      result.middle.push(closes[i]);
      result.lower.push(closes[i]);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    result.middle.push(mean);
    result.upper.push(mean + 2 * std);
    result.lower.push(mean - 2 * std);
  }
  return result;
}

// ===================== ANALYSIS FUNCTIONS =====================

export interface StockAnalysis {
  symbol: string;
  name: string;
  sector: string;
  instrumentKey: string;
  ltp: number;
  change: number;
  changePct: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  oi: number;
  oiChange: number;
  vwap: number;
  priceVsVwap: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  emaAligned: boolean;
  rsi: number;
  macdHistogram: number;
  adx: number;
  atr: number;
  bbWidth: number;
  // Scores (0-100)
  institutionalScore: number;
  momentumScore: number;
  trendScore: number;
  volumeScore: number;
  optionChainScore: number;
  oiScore: number;
  sectorScore: number;
  overallScore: number;
  // Direction
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  // OI Analysis
  oiInterpretation: "LONG_BUILDUP" | "SHORT_BUILDUP" | "LONG_UNWINDING" | "SHORT_COVERING" | "NEUTRAL";
  // Institutional Detection
  institutionalBuying: boolean;
  institutionalSelling: boolean;
  smoothMomentum: boolean;
  // Price Action
  higherHigh: boolean;
  higherLow: boolean;
  lowerHigh: boolean;
  lowerLow: boolean;
  // Trade recommendation
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskReward: number;
  holdingTime: string;
  // Explanation
  reasons: string[];
}

export function analyzeStock(
  symbol: string,
  name: string,
  sector: string,
  instrumentKey: string,
  quote: {
    ltp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    oi: number;
    averagePrice: number;
    totalBuyQty: number;
    totalSellQty: number;
    prevClose: number;
    prevOi: number;
  },
  candles: CandleData[],
  sectorStrength: number
): StockAnalysis {
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  const ltp = quote.ltp;
  const prevClose = quote.prevClose || quote.close;
  const change = ltp - prevClose;
  const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

  // Calculate indicators
  const ema9Arr = calculateEMA(closes, 9);
  const ema21Arr = calculateEMA(closes, 21);
  const ema50Arr = calculateEMA(closes, Math.min(50, closes.length));
  const ema200Arr = calculateEMA(closes, Math.min(200, closes.length));
  const vwapArr = calculateVWAP(candles);
  const rsiArr = calculateRSI(closes);
  const macdResult = calculateMACD(closes);
  const adxArr = calculateADX(candles);
  const atrArr = calculateATR(candles);
  const bbands = calculateBollingerBands(closes);

  const last = closes.length - 1;
  const ema9 = ema9Arr[last] || ltp;
  const ema21 = ema21Arr[last] || ltp;
  const ema50 = ema50Arr[last] || ltp;
  const ema200 = ema200Arr[last] || ltp;
  const vwap = vwapArr[last] || quote.averagePrice || ltp;
  const rsi = rsiArr[last] || 50;
  const macdHist = macdResult.histogram[last] || 0;
  const adx = adxArr[last] || 25;
  const atr = atrArr[last] || 0;
  const bbWidth = bbands.upper[last] && bbands.lower[last] && bbands.middle[last]
    ? ((bbands.upper[last] - bbands.lower[last]) / bbands.middle[last]) * 100
    : 0;

  // Volume analysis
  const avgVolume = volumes.length > 5
    ? volumes.slice(0, Math.max(1, volumes.length - 1)).reduce((a, b) => a + b, 0) / Math.max(1, volumes.length - 1)
    : quote.volume;
  const relativeVolume = avgVolume > 0 ? quote.volume / avgVolume : 1;

  // EMA Alignment
  const emaAligned = ltp > ema9 && ema9 > ema21 && ema21 > ema50;

  // Price vs VWAP
  const priceVsVwap = vwap > 0 ? ((ltp - vwap) / vwap) * 100 : 0;

  // OI Analysis
  const oiChange = quote.oi - (quote.prevOi || 0);
  const oiChangePct = quote.prevOi > 0 ? (oiChange / quote.prevOi) * 100 : 0;

  let oiInterpretation: StockAnalysis["oiInterpretation"] = "NEUTRAL";
  if (changePct > 0 && oiChangePct > 0) oiInterpretation = "LONG_BUILDUP";
  else if (changePct < 0 && oiChangePct > 0) oiInterpretation = "SHORT_BUILDUP";
  else if (changePct < 0 && oiChangePct < 0) oiInterpretation = "LONG_UNWINDING";
  else if (changePct > 0 && oiChangePct < 0) oiInterpretation = "SHORT_COVERING";

  // Price Action
  const recentHighs = candles.slice(-5).map(c => c.high);
  const recentLows = candles.slice(-5).map(c => c.low);
  const higherHigh = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1] > recentHighs[recentHighs.length - 2];
  const higherLow = recentLows.length >= 2 && recentLows[recentLows.length - 1] > recentLows[recentLows.length - 2];
  const lowerHigh = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1] < recentHighs[recentHighs.length - 2];
  const lowerLow = recentLows.length >= 2 && recentLows[recentLows.length - 1] < recentLows[recentLows.length - 2];

  // ===================== SCORING =====================

  // Trend Score (0-100)
  let trendScore = 50;
  if (ltp > ema9) trendScore += 8;
  if (ltp > ema21) trendScore += 8;
  if (ltp > ema50) trendScore += 7;
  if (ltp > ema200) trendScore += 7;
  if (emaAligned) trendScore += 10;
  if (higherHigh && higherLow) trendScore += 10;
  if (lowerHigh && lowerLow) trendScore -= 20;
  trendScore = Math.max(0, Math.min(100, trendScore));

  // Momentum Score
  let momentumScore = 50;
  if (rsi > 50 && rsi < 80) momentumScore += 15;
  if (rsi > 80) momentumScore += 5;
  if (rsi < 30) momentumScore -= 15;
  if (macdHist > 0) momentumScore += 10;
  if (adx > 25) momentumScore += 10;
  if (adx > 40) momentumScore += 5;
  if (bbWidth > 2) momentumScore += 5;
  momentumScore = Math.max(0, Math.min(100, momentumScore));

  // Volume Score
  let volumeScore = 50;
  if (relativeVolume > 1.5) volumeScore += 15;
  if (relativeVolume > 2) volumeScore += 10;
  if (relativeVolume > 3) volumeScore += 10;
  if (quote.totalBuyQty > quote.totalSellQty * 1.2) volumeScore += 10;
  if (quote.totalSellQty > quote.totalBuyQty * 1.2) volumeScore -= 10;
  volumeScore = Math.max(0, Math.min(100, volumeScore));

  // OI Score
  let oiScore = 50;
  if (oiInterpretation === "LONG_BUILDUP") oiScore += 25;
  if (oiInterpretation === "SHORT_COVERING") oiScore += 15;
  if (oiInterpretation === "SHORT_BUILDUP") oiScore -= 20;
  if (oiInterpretation === "LONG_UNWINDING") oiScore -= 15;
  oiScore = Math.max(0, Math.min(100, oiScore));

  // VWAP Score
  let vwapScore = 50;
  if (priceVsVwap > 0) vwapScore += 15;
  if (priceVsVwap > 0.5) vwapScore += 10;
  if (priceVsVwap < -0.5) vwapScore -= 15;
  vwapScore = Math.max(0, Math.min(100, vwapScore));

  // Sector Score
  const sectorScoreVal = Math.max(0, Math.min(100, 50 + sectorStrength * 5));

  // Option Chain Score (placeholder - will be enhanced with actual option chain data)
  const optionChainScore = 50;

  // Institutional Score (composite)
  const institutionalScore = Math.round(
    trendScore * 0.15 +
    momentumScore * 0.15 +
    volumeScore * 0.15 +
    oiScore * 0.15 +
    vwapScore * 0.1 +
    sectorScoreVal * 0.1 +
    optionChainScore * 0.1 +
    (emaAligned ? 10 : 0)
  );

  // Overall Score
  const overallScore = Math.round(
    institutionalScore * 0.3 +
    momentumScore * 0.2 +
    trendScore * 0.2 +
    volumeScore * 0.15 +
    oiScore * 0.15
  );

  // Institutional Detection
  const institutionalBuying =
    overallScore > 65 &&
    priceVsVwap > 0 &&
    emaAligned &&
    (oiInterpretation === "LONG_BUILDUP" || oiInterpretation === "SHORT_COVERING") &&
    relativeVolume > 1.2;

  const institutionalSelling =
    overallScore < 35 &&
    priceVsVwap < 0 &&
    (oiInterpretation === "SHORT_BUILDUP" || oiInterpretation === "LONG_UNWINDING");

  // Smooth Momentum
  const smoothMomentum =
    adx > 25 &&
    Math.abs(changePct) < 5 &&
    emaAligned &&
    relativeVolume > 0.8;

  // Direction
  let direction: StockAnalysis["direction"] = "NEUTRAL";
  if (overallScore > 60) direction = "BULLISH";
  if (overallScore < 40) direction = "BEARISH";

  let signal: StockAnalysis["signal"] = "NEUTRAL";
  if (overallScore > 75) signal = "STRONG_BUY";
  else if (overallScore > 60) signal = "BUY";
  else if (overallScore < 25) signal = "STRONG_SELL";
  else if (overallScore < 40) signal = "SELL";

  // Trade Levels
  const entry = ltp;
  const stopLoss = direction === "BULLISH"
    ? Math.round((ltp - atr * 1.5) * 100) / 100
    : Math.round((ltp + atr * 1.5) * 100) / 100;
  const risk = Math.abs(entry - stopLoss);
  const target1 = direction === "BULLISH"
    ? Math.round((entry + risk * 1.5) * 100) / 100
    : Math.round((entry - risk * 1.5) * 100) / 100;
  const target2 = direction === "BULLISH"
    ? Math.round((entry + risk * 2.5) * 100) / 100
    : Math.round((entry - risk * 2.5) * 100) / 100;
  const target3 = direction === "BULLISH"
    ? Math.round((entry + risk * 3.5) * 100) / 100
    : Math.round((entry - risk * 3.5) * 100) / 100;
  const riskReward = risk > 0 ? Math.round((Math.abs(target2 - entry) / risk) * 10) / 10 : 0;

  // Holding time
  const holdingTime = adx > 40 ? "1-3 hours" : adx > 25 ? "30min-2hr" : "15-45min";

  // Reasons
  const reasons: string[] = [];
  if (institutionalBuying) reasons.push("🏦 Institutional buying detected");
  if (institutionalSelling) reasons.push("🏦 Institutional selling detected");
  if (priceVsVwap > 0) reasons.push("📈 Price above VWAP");
  if (priceVsVwap < 0) reasons.push("📉 Price below VWAP");
  if (oiInterpretation === "LONG_BUILDUP") reasons.push("🟢 Long Build-up (Price↑ OI↑)");
  if (oiInterpretation === "SHORT_BUILDUP") reasons.push("🔴 Short Build-up (Price↓ OI↑)");
  if (oiInterpretation === "SHORT_COVERING") reasons.push("🟡 Short Covering (Price↑ OI↓)");
  if (oiInterpretation === "LONG_UNWINDING") reasons.push("🟠 Long Unwinding (Price↓ OI↓)");
  if (emaAligned) reasons.push("✅ EMA Alignment (9>21>50)");
  if (higherHigh && higherLow) reasons.push("📊 Higher High, Higher Low");
  if (relativeVolume > 1.5) reasons.push(`📊 High Relative Volume (${relativeVolume.toFixed(1)}x)`);
  if (rsi > 55 && rsi < 75) reasons.push(`💪 RSI Strong (${rsi.toFixed(0)})`);
  if (adx > 25) reasons.push(`🔥 Strong Trend (ADX: ${adx.toFixed(0)})`);
  if (sectorStrength > 2) reasons.push("🏆 Sector Outperforming");
  if (smoothMomentum) reasons.push("🎯 Smooth Momentum Detected");

  return {
    symbol, name, sector, instrumentKey, ltp,
    change, changePct, volume: quote.volume, avgVolume, relativeVolume,
    oi: quote.oi, oiChange, vwap, priceVsVwap,
    ema9, ema21, ema50, ema200, emaAligned,
    rsi, macdHistogram: macdHist, adx, atr, bbWidth,
    institutionalScore, momentumScore, trendScore,
    volumeScore, optionChainScore, oiScore,
    sectorScore: sectorScoreVal, overallScore,
    direction, signal,
    oiInterpretation,
    institutionalBuying, institutionalSelling, smoothMomentum,
    higherHigh, higherLow, lowerHigh, lowerLow,
    entry, stopLoss, target1, target2, target3, riskReward,
    holdingTime, reasons,
  };
}

export function analyzeOptionChain(optionChain: OptionChainData[]): {
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
} {
  let totalCallOI = 0, totalPutOI = 0;
  let callOIChange = 0, putOIChange = 0;
  const bullishSignals: string[] = [];
  const bearishSignals: string[] = [];

  const strikeOI: Record<number, { callOI: number; putOI: number }> = {};

  for (const strike of optionChain) {
    const callOI = strike.call_options?.market_data?.oi || 0;
    const putOI = strike.put_options?.market_data?.oi || 0;
    const callPrevOI = strike.call_options?.market_data?.prev_oi || 0;
    const putPrevOI = strike.put_options?.market_data?.prev_oi || 0;

    totalCallOI += callOI;
    totalPutOI += putOI;
    callOIChange += callOI - callPrevOI;
    putOIChange += putOI - putPrevOI;

    strikeOI[strike.strike_price] = { callOI, putOI };
  }

  const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 1;

  // Max Pain
  let minPain = Infinity;
  let maxPain = 0;
  const strikes = Object.keys(strikeOI).map(Number).sort((a, b) => a - b);
  for (const strike of strikes) {
    let pain = 0;
    for (const s of strikes) {
      if (s < strike) pain += strikeOI[s].callOI * (strike - s);
      if (s > strike) pain += strikeOI[s].putOI * (s - strike);
    }
    if (pain < minPain) { minPain = pain; maxPain = strike; }
  }

  // Support: High Put OI
  const sortedByPutOI = [...strikes].sort((a, b) => (strikeOI[b]?.putOI || 0) - (strikeOI[a]?.putOI || 0));
  const supportLevels = sortedByPutOI.slice(0, 3);

  // Resistance: High Call OI
  const sortedByCallOI = [...strikes].sort((a, b) => (strikeOI[b]?.callOI || 0) - (strikeOI[a]?.callOI || 0));
  const resistanceLevels = sortedByCallOI.slice(0, 3);

  // Signals
  const strongPutWriting = putOIChange > 0 && putOIChange > callOIChange * 1.5;
  const strongCallWriting = callOIChange > 0 && callOIChange > putOIChange * 1.5;
  const callUnwinding = callOIChange < 0;
  const putUnwinding = putOIChange < 0;

  if (strongPutWriting) bullishSignals.push("Strong Put Writing");
  if (callUnwinding) bullishSignals.push("Call Unwinding");
  if (pcr > 1.2) bullishSignals.push("High PCR (Bullish)");

  if (strongCallWriting) bearishSignals.push("Strong Call Writing");
  if (putUnwinding) bearishSignals.push("Put Unwinding");
  if (pcr < 0.7) bearishSignals.push("Low PCR (Bearish)");

  let score = 50;
  if (strongPutWriting) score += 15;
  if (callUnwinding) score += 10;
  if (strongCallWriting) score -= 15;
  if (putUnwinding) score -= 10;
  if (pcr > 1) score += 10;
  if (pcr < 0.8) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    pcr, maxPain, totalCallOI, totalPutOI,
    callOIChange, putOIChange,
    strongPutWriting, strongCallWriting,
    callUnwinding, putUnwinding,
    supportLevels, resistanceLevels,
    bullishSignals, bearishSignals,
    score,
  };
}

export interface MarketSentiment {
  overall: "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONG_BEARISH";
  advanceDecline: { advances: number; declines: number; ratio: number };
  sectorBreadth: Record<string, number>;
  pcr: number;
  marketScore: number;
  description: string;
}

export function calculateMarketSentiment(
  analyses: StockAnalysis[]
): MarketSentiment {
  const advances = analyses.filter(a => a.changePct > 0).length;
  const declines = analyses.filter(a => a.changePct < 0).length;
  const ratio = declines > 0 ? advances / declines : advances;

  const sectorBreadth: Record<string, number> = {};
  const sectorStocks: Record<string, StockAnalysis[]> = {};
  for (const a of analyses) {
    if (!sectorStocks[a.sector]) sectorStocks[a.sector] = [];
    sectorStocks[a.sector].push(a);
  }
  for (const [sector, stocks] of Object.entries(sectorStocks)) {
    sectorBreadth[sector] = stocks.reduce((sum, s) => sum + s.changePct, 0) / stocks.length;
  }

  const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / Math.max(1, analyses.length);
  const bullishCount = analyses.filter(a => a.direction === "BULLISH").length;
  const bearishCount = analyses.filter(a => a.direction === "BEARISH").length;

  let marketScore = 50;
  if (ratio > 2) marketScore += 20;
  else if (ratio > 1.5) marketScore += 10;
  else if (ratio < 0.5) marketScore -= 20;
  else if (ratio < 0.75) marketScore -= 10;
  marketScore += (avgScore - 50) * 0.3;
  marketScore = Math.max(0, Math.min(100, marketScore));

  let overall: MarketSentiment["overall"] = "NEUTRAL";
  if (marketScore > 75) overall = "STRONG_BULLISH";
  else if (marketScore > 60) overall = "BULLISH";
  else if (marketScore < 25) overall = "STRONG_BEARISH";
  else if (marketScore < 40) overall = "BEARISH";

  const descriptions: Record<string, string> = {
    STRONG_BULLISH: "Strong institutional buying across sectors. Broad-based rally with healthy breadth.",
    BULLISH: "Positive institutional flow. Most sectors showing strength.",
    NEUTRAL: "Mixed signals. Wait for clarity before taking positions.",
    BEARISH: "Institutional selling pressure. Caution advised.",
    STRONG_BEARISH: "Heavy institutional distribution. Risk-off mode.",
  };

  return {
    overall,
    advanceDecline: { advances, declines, ratio },
    sectorBreadth,
    pcr: 0,
    marketScore: Math.round(marketScore),
    description: descriptions[overall],
  };
}
