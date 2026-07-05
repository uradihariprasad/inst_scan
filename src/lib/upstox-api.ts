// Upstox API v2 client
const BASE_URL = "https://api.upstox.com/v2";

export interface UpstoxQuote {
  ohlc: { open: number; high: number; low: number; close: number };
  depth: {
    buy: Array<{ price: number; quantity: number; orders: number }>;
    sell: Array<{ price: number; quantity: number; orders: number }>;
  };
  timestamp: string;
  instrument_token: string;
  symbol: string;
  last_price: number;
  volume: number;
  average_price: number;
  oi: number;
  net_change: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  lower_circuit_limit: number;
  upper_circuit_limit: number;
  last_trade_time: string;
  oi_day_high: number;
  oi_day_low: number;
}

export interface OptionChainData {
  expiry: string;
  pcr: number;
  strike_price: number;
  underlying_key: string;
  underlying_spot_price: number;
  call_options: {
    instrument_key: string;
    market_data: {
      ltp: number;
      volume: number;
      oi: number;
      close_price: number;
      bid_price: number;
      bid_qty: number;
      ask_price: number;
      ask_qty: number;
      prev_oi: number;
    };
    option_greeks: {
      vega: number;
      theta: number;
      gamma: number;
      delta: number;
      iv: number;
    };
  };
  put_options: {
    instrument_key: string;
    market_data: {
      ltp: number;
      volume: number;
      oi: number;
      close_price: number;
      bid_price: number;
      bid_qty: number;
      ask_price: number;
      ask_qty: number;
      prev_oi: number;
    };
    option_greeks: {
      vega: number;
      theta: number;
      gamma: number;
      delta: number;
      iv: number;
    };
  };
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oi: number;
}

async function upstoxFetch(endpoint: string, token: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstox API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Get full market quotes for up to 500 instruments
export async function getFullMarketQuotes(
  instrumentKeys: string[],
  token: string
): Promise<Record<string, UpstoxQuote>> {
  const keys = instrumentKeys.join(",");
  const data = await upstoxFetch(
    `/market-quote/quotes?instrument_key=${encodeURIComponent(keys)}`,
    token
  );
  return data.data || {};
}

// Get LTP for multiple instruments
export async function getLTP(
  instrumentKeys: string[],
  token: string
): Promise<Record<string, { last_price: number; instrument_token: string }>> {
  const keys = instrumentKeys.join(",");
  const data = await upstoxFetch(
    `/market-quote/ltp?instrument_key=${encodeURIComponent(keys)}`,
    token
  );
  return data.data || {};
}

// Get OHLC quotes
export async function getOHLC(
  instrumentKeys: string[],
  token: string,
  interval: string = "1d"
): Promise<Record<string, unknown>> {
  const keys = instrumentKeys.join(",");
  const data = await upstoxFetch(
    `/market-quote/ohlc?instrument_key=${encodeURIComponent(keys)}&interval=${interval}`,
    token
  );
  return data.data || {};
}

// Get option chain
export async function getOptionChain(
  instrumentKey: string,
  expiryDate: string,
  token: string
): Promise<OptionChainData[]> {
  const data = await upstoxFetch(
    `/option/chain?instrument_key=${encodeURIComponent(instrumentKey)}&expiry_date=${expiryDate}`,
    token
  );
  return data.data || [];
}

// Get intraday candle data
export async function getIntradayCandles(
  instrumentKey: string,
  interval: string = "1minute",
  token: string
): Promise<CandleData[]> {
  const data = await upstoxFetch(
    `/historical-candle/intraday/${encodeURIComponent(instrumentKey)}/${interval}`,
    token
  );
  const candles = data.data?.candles || [];
  return candles.map((c: [string, number, number, number, number, number, number]) => ({
    timestamp: c[0],
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    volume: c[5],
    oi: c[6] || 0,
  }));
}

// Get historical candle data
export async function getHistoricalCandles(
  instrumentKey: string,
  interval: string = "day",
  toDate: string,
  fromDate: string,
  token: string
): Promise<CandleData[]> {
  const data = await upstoxFetch(
    `/historical-candle/${encodeURIComponent(instrumentKey)}/${interval}/${toDate}/${fromDate}`,
    token
  );
  const candles = data.data?.candles || [];
  return candles.map((c: [string, number, number, number, number, number, number]) => ({
    timestamp: c[0],
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    volume: c[5],
    oi: c[6] || 0,
  }));
}

// Validate token
export async function validateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/user/profile`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
