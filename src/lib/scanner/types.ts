export type TrendKind = "bullish" | "mixed" | "bearish";

export type BucketKind =
  | "tradeReady"
  | "bullishSoon"
  | "volumeJump"
  | "volumeRising"
  | "dumpWatch"
  | "watch";

export type WindowStats = {
  priceChangePct: number;
  quoteVolume: number;
  volume: number;
  high: number;
  low: number;
  last: number;
  tradeCount: number;
};

export type Ticker24h = {
  symbol: string;
  base: string;
  lastPrice: number;
  priceChangePct: number;
  quoteVolume: number;
  volume: number;
  high: number;
  low: number;
  tradeCount: number;
};

export type CoinSignal = {
  symbol: string;
  pair: string;
  base: string;
  name: string;
  price: number;
  change24h: number;
  quoteVolume24h: number;
  vol5mPct: number;
  vol15mPct: number;
  vol1hPct: number;
  price5m: number;
  price15m: number;
  price1h: number;
  rangePos15m: number;
  rangePos1h: number;
  trend: TrendKind;
  trendLabel: string;
  bucket: BucketKind;
  bucketLabel: string;
  score: number;
  strengthLabel: string;
  horizon: string;
  why: string;
  liquidityOk: boolean;
  liquidityNote: string;
  newsHint: string | null;
};

export type ScanStats = {
  scanned: number;
  usdtPairs: number;
  tradeReady: number;
  bullishSoon: number;
  volumeJump: number;
  volumeRising: number;
  dumpWatch: number;
  generatedAt: string;
  source: string;
  durationMs: number;
};

export type MarketScan = {
  stats: ScanStats;
  coins: CoinSignal[];
  tradeReady: CoinSignal[];
  bullishSoon: CoinSignal[];
  volumeJump: CoinSignal[];
  volumeRising: CoinSignal[];
  dumpWatch: CoinSignal[];
  btc: CoinSignal | null;
  eth: CoinSignal | null;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  coins: string[];
  tone: "positive" | "negative" | "neutral";
  toneLabel: string;
  summary: string;
};

export type TrendingCoin = {
  symbol: string;
  name: string;
  rank: number | null;
};

export type NewsBundle = {
  generatedAt: string;
  items: NewsItem[];
  trending: TrendingCoin[];
  marketNote: string;
};
