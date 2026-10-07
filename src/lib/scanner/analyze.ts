import { COIN_NAMES } from "./constants";
import type {
  BucketKind,
  CoinSignal,
  Ticker24h,
  TrendKind,
  WindowStats,
} from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function pctVsAvg(current: number, avg: number) {
  if (!Number.isFinite(current) || !Number.isFinite(avg) || avg <= 0) return 0;
  return ((current - avg) / avg) * 100;
}

function rangePos(last: number, low: number, high: number) {
  const span = high - low;
  if (!Number.isFinite(span) || span <= 0) return 0.5;
  return clamp((last - low) / span, 0, 1);
}

function fmtName(base: string) {
  return COIN_NAMES[base] ?? base;
}

function trendOf(price15m: number, price1h: number): { kind: TrendKind; label: string } {
  if (price15m >= 0.2 && price1h >= 0.1) {
    return { kind: "bullish", label: "Bullish ban raha hai" };
  }
  if (price15m <= -0.2 && price1h <= -0.1) {
    return { kind: "bearish", label: "Neeche / bearish" };
  }
  if (price15m >= 0.35 && price1h >= -0.6) {
    return { kind: "bullish", label: "Short-term upar turn" };
  }
  return { kind: "mixed", label: "Mix / clear nahi" };
}

function strengthLabel(score: number) {
  if (score >= 80) return "HIGH";
  if (score >= 62) return "MEDIUM";
  return "LOW";
}

export function analyzeCoin(
  t: Ticker24h,
  w5: WindowStats | undefined,
  w15: WindowStats | undefined,
  w1h: WindowStats | undefined,
): CoinSignal {
  const avg5m = t.quoteVolume / 288;
  const avg15m = t.quoteVolume / 96;
  const avg1h = t.quoteVolume / 24;

  const vol5mPct = pctVsAvg(w5?.quoteVolume ?? 0, avg5m);
  const vol15mPct = pctVsAvg(w15?.quoteVolume ?? 0, avg15m);
  const vol1hPct = pctVsAvg(w1h?.quoteVolume ?? 0, avg1h);

  const price5m = w5?.priceChangePct ?? 0;
  const price15m = w15?.priceChangePct ?? t.priceChangePct / 24;
  const price1h = w1h?.priceChangePct ?? t.priceChangePct / 6;

  const last = w15?.last || w1h?.last || t.lastPrice;
  const rangePos15m = rangePos(last, w15?.low ?? t.low, w15?.high ?? t.high);
  const rangePos1h = rangePos(last, w1h?.low ?? t.low, w1h?.high ?? t.high);

  const { kind: trend, label: trendLabel } = trendOf(price15m, price1h);
  const liquidityOk = t.quoteVolume >= 2_000_000;
  const liquidityNote = liquidityOk
    ? "Liquidity theek hai"
    : "Liquidity kam hai — badi quantity pe price slippery ho sakti hai";

  const volScore = clamp(vol15mPct * 0.12 + vol1hPct * 0.08 + Math.max(vol5mPct, 0) * 0.04, 0, 42);
  const priceScore = clamp(Math.max(price15m, 0) * 6 + Math.max(price1h, 0) * 4, 0, 28);
  const structure = (rangePos15m > 0.62 ? 8 : 0) + (rangePos1h > 0.58 ? 6 : 0);
  const align = trend === "bullish" ? 14 : trend === "mixed" ? 4 : 0;
  const liq = clamp(Math.log10(Math.max(t.quoteVolume, 1)) * 1.6, 0, 12);
  let dumpPenalty = 0;
  if (price15m < -0.25 && vol15mPct > 40) dumpPenalty = 22;
  if (price15m < -0.8 && vol15mPct > 70) dumpPenalty = 32;

  const score = clamp(Math.round(volScore + priceScore + structure + align + liq - dumpPenalty), 0, 100);

  const justJumped =
    vol5mPct > 85 &&
    (w5?.quoteVolume ?? 0) > (w15?.quoteVolume ?? 0) * 0.35 &&
    vol15mPct > 40;

  const rising = vol15mPct > 32 && vol1hPct > 18;
  const tradeReady =
    vol15mPct > 70 &&
    vol1hPct > 28 &&
    price15m > 0.35 &&
    price1h > 0.12 &&
    trend === "bullish" &&
    rangePos15m > 0.5 &&
    liquidityOk;
  const bullishSoon =
    !tradeReady &&
    vol15mPct > 42 &&
    price15m > 0.18 &&
    price1h > -0.7 &&
    trend !== "bearish" &&
    rangePos15m > 0.42;
  const dumpWatch = vol15mPct > 55 && price15m < -0.35;

  let bucket: BucketKind = "watch";
  let bucketLabel = "Sirf watch — abhi strong nahi";
  let horizon = "Next scan ka wait";
  let why = "Volume ya price abhi itna strong nahi ke alert de sakein.";

  if (tradeReady) {
    bucket = "tradeReady";
    bucketLabel = "Bull trade ke liye ready";
    horizon = "Abhi se 1 ghanta";
    why = `15M volume baseline se ${vol15mPct.toFixed(0)}% upar, 1H volume ${vol1hPct.toFixed(0)}% upar, aur price dono timeframe pe upar ja rahi hai. Volume + price confirmation mil gayi.`;
  } else if (bullishSoon) {
    bucket = "bullishSoon";
    bucketLabel = "Bullish ja sakta hai";
    horizon = "Agli 15 minute se 1 ghanta";
    why = `Volume barh raha hai (${vol15mPct.toFixed(0)}% vs 15M baseline) aur price upar turn kar rahi hai (${price15m.toFixed(2)}% in 15M). Trend confirm ho raha hai.`;
  } else if (dumpWatch) {
    bucket = "dumpWatch";
    bucketLabel = "High volume lekin bearish";
    horizon = "Abhi buy nahi";
    why = `Volume tez barha lekin 15M price ${price15m.toFixed(2)}% neeche hai. Ye dump / selling ho sakti hai — sirf volume dekh ke buy mat karo.`;
  } else if (justJumped) {
    bucket = "volumeJump";
    bucketLabel = "Volume abhi abhi jump hua";
    horizon = "Pichle 5–15 minute";
    why = `Pichle 5 minute ka volume average se ${vol5mPct.toFixed(0)}% zyada hai. Pehle price direction confirm karo, phir socho.`;
  } else if (rising) {
    bucket = "volumeRising";
    bucketLabel = "Volume barh raha hai";
    horizon = "15M + 1H dono";
    why = `15M volume ${vol15mPct.toFixed(0)}% aur 1H volume ${vol1hPct.toFixed(0)}% baseline se upar hai. Interest sustained hai.`;
  }

  return {
    symbol: t.symbol,
    pair: `${t.base}/USDT`,
    base: t.base,
    name: fmtName(t.base),
    price: last,
    change24h: t.priceChangePct,
    quoteVolume24h: t.quoteVolume,
    vol5mPct,
    vol15mPct,
    vol1hPct,
    price5m,
    price15m,
    price1h,
    rangePos15m,
    rangePos1h,
    trend,
    trendLabel,
    bucket,
    bucketLabel,
    score,
    strengthLabel: strengthLabel(score),
    horizon,
    why,
    liquidityOk,
    liquidityNote,
    newsHint: null,
  };
}

export function sortSignals(coins: CoinSignal[]) {
  return [...coins].sort((a, b) => b.score - a.score || b.vol15mPct - a.vol15mPct);
}

export function pickBucket(coins: CoinSignal[], bucket: BucketKind, limit: number) {
  return sortSignals(coins.filter((c) => c.bucket === bucket)).slice(0, limit);
}
