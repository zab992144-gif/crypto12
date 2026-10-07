import { COIN_NAMES, NEGATIVE_NEWS, POSITIVE_NEWS } from "./constants";
import type { NewsBundle, NewsItem, TrendingCoin } from "./types";

const NEWS_CACHE_MS = 180_000;
let newsCache: { at: number; data: NewsBundle } | null = null;

function stripTags(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function between(block: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m?.[1] ? stripTags(m[1]) : "";
}

function matchCoins(text: string): string[] {
  const upper = text.toUpperCase();
  const found = new Set<string>();
  for (const [sym, name] of Object.entries(COIN_NAMES)) {
    if (sym.length < 2) continue;
    const nameRe = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const symRe = new RegExp(`\\b${sym}\\b`);
    if (nameRe.test(text) || symRe.test(upper)) found.add(sym);
  }
  if (/\bBITCOIN\b/i.test(text)) found.add("BTC");
  if (/\bETHEREUM\b/i.test(text)) found.add("ETH");
  return [...found].slice(0, 4);
}

function toneOf(title: string): NewsItem["tone"] {
  if (NEGATIVE_NEWS.test(title)) return "negative";
  if (POSITIVE_NEWS.test(title)) return "positive";
  return "neutral";
}

function toneLabel(tone: NewsItem["tone"]) {
  if (tone === "positive") return "Positive — coin ke liye support ho sakti hai";
  if (tone === "negative") return "Negative — pressure aa sakta hai";
  return "Neutral — sirf context ke liye";
}

function parseRss(xml: string, source: string): NewsItem[] {
  const parts = xml.split(/<item[\s>]/i).slice(1);
  const items: NewsItem[] = [];
  for (const part of parts.slice(0, 18)) {
    const title = between(part, "title");
    if (!title) continue;
    const link = between(part, "link") || part.match(/<link[^>]*>([^<]+)/i)?.[1] || "";
    const pub = between(part, "pubDate") || between(part, "updated");
    const desc = between(part, "description") || between(part, "content:encoded");
    const coins = matchCoins(`${title} ${desc}`);
    const tone = toneOf(title);
    items.push({
      id: `${source}-${title.slice(0, 48)}`,
      title,
      source,
      url: link.startsWith("http") ? link : "",
      publishedAt: pub,
      coins,
      tone,
      toneLabel: toneLabel(tone),
      summary: desc.slice(0, 180),
    });
  }
  return items;
}

async function fetchText(url: string) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "CryptoVolumeScanner/1.0" },
    });
    if (!res.ok) throw new Error(String(res.status));
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

type GeckoTrend = {
  coins?: Array<{
    item?: { symbol?: string; name?: string; market_cap_rank?: number };
  }>;
};

export async function fetchNewsBundle(): Promise<NewsBundle> {
  const now = Date.now();
  if (newsCache && now - newsCache.at < NEWS_CACHE_MS) return newsCache.data;

  const feeds = [
    { url: "https://feeds.feedburner.com/CoinDesk", source: "CoinDesk" },
    { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine" },
  ];

  const settled = await Promise.allSettled(
    feeds.map(async (f) => parseRss(await fetchText(f.url), f.source)),
  );

  const items: NewsItem[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled") items.push(...s.value);
  }
  items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  let trending: TrendingCoin[] = [];
  try {
    const raw = JSON.parse(
      await fetchText("https://api.coingecko.com/api/v3/search/trending"),
    ) as GeckoTrend;
    trending = (raw.coins ?? []).slice(0, 8).map((c, i) => ({
      symbol: (c.item?.symbol ?? "").toUpperCase(),
      name: c.item?.name ?? "",
      rank: c.item?.market_cap_rank ?? i + 1,
    }));
  } catch {
    trending = [];
  }

  const bullNews = items.filter((i) => i.tone === "positive").length;
  const bearNews = items.filter((i) => i.tone === "negative").length;
  let marketNote = "News mix hai — pehle volume + price dekho, sirf headline pe trade mat lo.";
  if (bullNews > bearNews + 2) {
    marketNote = "Headlines zyada positive hain. Phir bhi volume confirmation zaroori hai.";
  } else if (bearNews > bullNews + 2) {
    marketNote = "Headlines mein pressure zyada dikh raha hai. Dump volume se bacho.";
  }

  const data: NewsBundle = {
    generatedAt: new Date().toISOString(),
    items: items.slice(0, 16),
    trending,
    marketNote,
  };
  newsCache = { at: Date.now(), data };
  return data;
}
