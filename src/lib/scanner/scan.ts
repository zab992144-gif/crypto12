import { analyzeCoin, pickBucket, sortSignals } from "./analyze";
import { fetchAll24h, fetchWindows } from "./binance";
import type { CoinSignal, MarketScan } from "./types";

const CACHE_MS = 6000;
let cache: { at: number; data: MarketScan } | null = null;
let lastGood: MarketScan | null = null;
let inflight: Promise<MarketScan> | null = null;

const DEEP_SCAN = 150;

function emptyScan(error: string, durationMs: number): MarketScan {
  return {
    stats: {
      scanned: 0,
      usdtPairs: 0,
      tradeReady: 0,
      bullishSoon: 0,
      volumeJump: 0,
      volumeRising: 0,
      dumpWatch: 0,
      generatedAt: new Date().toISOString(),
      source: error,
      durationMs,
    },
    coins: [],
    tradeReady: [],
    bullishSoon: [],
    volumeJump: [],
    volumeRising: [],
    dumpWatch: [],
    btc: null,
    eth: null,
  };
}

async function actuallyScan(): Promise<MarketScan> {
  const started = Date.now();
  const all = await fetchAll24h();
  const deep = all.slice(0, DEEP_SCAN);
  const windows = await fetchWindows(
    deep.map((c) => c.symbol),
    ["5m", "15m", "1h"],
    50,
  );

  const analyzed: CoinSignal[] = deep.map((t) =>
    analyzeCoin(t, windows["5m"].get(t.symbol), windows["15m"].get(t.symbol), windows["1h"].get(t.symbol)),
  );

  const ranked = sortSignals(analyzed);
  return {
    stats: {
      scanned: ranked.length,
      usdtPairs: all.length,
      tradeReady: ranked.filter((c) => c.bucket === "tradeReady").length,
      bullishSoon: ranked.filter((c) => c.bucket === "bullishSoon").length,
      volumeJump: ranked.filter((c) => c.bucket === "volumeJump").length,
      volumeRising: ranked.filter((c) => c.bucket === "volumeRising").length,
      dumpWatch: ranked.filter((c) => c.bucket === "dumpWatch").length,
      generatedAt: new Date().toISOString(),
      source: "Binance Spot",
      durationMs: Date.now() - started,
    },
    coins: ranked,
    tradeReady: pickBucket(ranked, "tradeReady", 20),
    bullishSoon: pickBucket(ranked, "bullishSoon", 20),
    volumeJump: pickBucket(ranked, "volumeJump", 20),
    volumeRising: pickBucket(ranked, "volumeRising", 20),
    dumpWatch: pickBucket(ranked, "dumpWatch", 12),
    btc: ranked.find((c) => c.symbol === "BTCUSDT") ?? null,
    eth: ranked.find((c) => c.symbol === "ETHUSDT") ?? null,
  };
}

export async function runScan(force = false): Promise<MarketScan> {
  const now = Date.now();
  if (!force && cache && now - cache.at < CACHE_MS) return cache.data;
  if (!force && inflight) return inflight;

  inflight = (async () => {
    try {
      const data = await actuallyScan();
      cache = { at: Date.now(), data };
      lastGood = data;
      return data;
    } catch (err) {
      if (lastGood) {
        return {
          ...lastGood,
          stats: {
            ...lastGood.stats,
            source: "Binance Spot (last good scan)",
            generatedAt: lastGood.stats.generatedAt,
          },
        };
      }
      const msg = err instanceof Error ? err.message : "scan fail";
      return emptyScan(msg, 0);
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function peekLastScan() {
  return lastGood;
}
