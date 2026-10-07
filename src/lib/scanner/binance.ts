import { STABLE_BASES } from "./constants";
import type { Ticker24h, WindowStats } from "./types";

const LEVERAGE_RE = /(\d+[LS]|UP|DOWN|BULL|BEAR)USDT$/i;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function isUsdtSpotSymbol(symbol: string) {
  if (!symbol.endsWith("USDT")) return false;
  if (LEVERAGE_RE.test(symbol)) return false;
  const base = symbol.slice(0, -4);
  if (STABLE_BASES.has(base)) return false;
  return /^[A-Z0-9]{2,20}$/.test(base);
}

export function baseAsset(symbol: string) {
  return symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
}

async function fetchText(url: string, timeoutMs = 14000): Promise<string> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json", "User-Agent": UA },
      });
      if (res.ok) return await res.text();
      lastErr = new Error(`HTTP ${res.status}`);
      if (res.status === 451 || res.status === 403) break;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error("fetch fail");
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }
  throw lastErr ?? new Error("fetch fail");
}

export async function fetchBinanceJson<T>(path: string): Promise<T> {
  const host = "https://data-api.binance.vision";
  const text = await fetchText(`${host}${path}`);
  return JSON.parse(text) as T;
}

type Raw24h = {
  symbol: string;
  lastPrice: string;
  priceChangePercent?: string;
  openPrice?: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  count?: number;
};

type RawWindow = {
  symbol: string;
  priceChangePercent: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  lastPrice: string;
  count?: number;
};

function num(v: string | number | undefined) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parse24h(raw: Raw24h): Ticker24h | null {
  if (!isUsdtSpotSymbol(raw.symbol)) return null;
  const lastPrice = num(raw.lastPrice);
  const open = num(raw.openPrice);
  const change =
    raw.priceChangePercent != null
      ? num(raw.priceChangePercent)
      : open > 0
        ? ((lastPrice - open) / open) * 100
        : 0;
  return {
    symbol: raw.symbol,
    base: baseAsset(raw.symbol),
    lastPrice,
    priceChangePct: change,
    quoteVolume: num(raw.quoteVolume),
    volume: num(raw.volume),
    high: num(raw.highPrice),
    low: num(raw.lowPrice),
    tradeCount: raw.count ?? 0,
  };
}

export function parseWindow(raw: RawWindow): WindowStats {
  return {
    priceChangePct: num(raw.priceChangePercent),
    quoteVolume: num(raw.quoteVolume),
    volume: num(raw.volume),
    high: num(raw.highPrice),
    low: num(raw.lowPrice),
    last: num(raw.lastPrice),
    tradeCount: raw.count ?? 0,
  };
}

export async function fetchAll24h(): Promise<Ticker24h[]> {
  const raw = await fetchBinanceJson<Raw24h[]>("/api/v3/ticker/24hr");
  const out: Ticker24h[] = [];
  for (const row of raw) {
    const parsed = parse24h(row);
    if (parsed && parsed.quoteVolume > 80_000 && parsed.lastPrice > 0) {
      out.push(parsed);
    }
  }
  out.sort((a, b) => b.quoteVolume - a.quoteVolume);
  return out;
}

export async function fetchWindowBatch(
  symbols: string[],
  windowSize: "5m" | "15m" | "1h",
): Promise<Map<string, WindowStats>> {
  const map = new Map<string, WindowStats>();
  if (symbols.length === 0) return map;
  const encoded = encodeURIComponent(JSON.stringify(symbols));
  const raw = await fetchBinanceJson<RawWindow[] | RawWindow>(
    `/api/v3/ticker?symbols=${encoded}&windowSize=${windowSize}`,
  );
  const list = Array.isArray(raw) ? raw : [raw];
  for (const row of list) {
    map.set(row.symbol, parseWindow(row));
  }
  return map;
}

export async function fetchWindows(
  symbols: string[],
  sizes: Array<"5m" | "15m" | "1h">,
  batchSize = 50,
): Promise<Record<"5m" | "15m" | "1h", Map<string, WindowStats>>> {
  const result: Record<"5m" | "15m" | "1h", Map<string, WindowStats>> = {
    "5m": new Map(),
    "15m": new Map(),
    "1h": new Map(),
  };
  const batches: string[][] = [];
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize));
  }

  const jobs: Array<() => Promise<void>> = [];
  for (const batch of batches) {
    for (const size of sizes) {
      jobs.push(async () => {
        try {
          const map = await fetchWindowBatch(batch, size);
          for (const [sym, stats] of map) result[size].set(sym, stats);
        } catch {
          // partial scan is better than a hard fail
        }
      });
    }
  }

  const limit = 5;
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      if (job) await job();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, () => worker()));
  return result;
}
