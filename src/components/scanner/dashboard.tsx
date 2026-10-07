import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bell,
  BellOff,
  BookOpen,
  Info,
  Newspaper,
  Radio,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Term } from "@/components/scanner/term";
import { GLOSSARY } from "@/lib/scanner/constants";
import { formatPct, formatPkt, formatPrice, formatUsd, pktClock } from "@/lib/scanner/format";
import type { BucketKind, CoinSignal, MarketScan, NewsBundle } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

type TabId = BucketKind | "all" | "news" | "words";

const TABS: { id: TabId; label: string }[] = [
  { id: "tradeReady", label: "Bull trade" },
  { id: "bullishSoon", label: "Bullish ja sakte" },
  { id: "volumeJump", label: "Abhi jump" },
  { id: "volumeRising", label: "Volume barh raha" },
  { id: "dumpWatch", label: "Dump watch" },
  { id: "all", label: "Sab coins" },
  { id: "news", label: "News" },
  { id: "words", label: "Alfaaz" },
];

const ALERT_KEY = "cvs-alerts-v1";
const BELL_KEY = "cvs-bell-on";
const SEEN_KEY = "cvs-seen-v1";

type SavedAlert = {
  id: string;
  at: string;
  pair: string;
  title: string;
  why: string;
  score: number;
};

function loadAlerts(): SavedAlert[] {
  try {
    return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]") as SavedAlert[];
  } catch {
    return [];
  }
}

function loadSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch {
    /* ignore */
  }
}

function listForTab(scan: MarketScan | null, tab: TabId, query: string): CoinSignal[] {
  if (!scan) return [];
  let rows: CoinSignal[] = [];
  if (tab === "tradeReady") rows = scan.tradeReady;
  else if (tab === "bullishSoon") rows = scan.bullishSoon;
  else if (tab === "volumeJump") rows = scan.volumeJump;
  else if (tab === "volumeRising") rows = scan.volumeRising;
  else if (tab === "dumpWatch") rows = scan.dumpWatch;
  else if (tab === "all") rows = scan.coins;
  const q = query.trim().toUpperCase();
  if (!q) return rows;
  return rows.filter(
    (c) =>
      c.pair.includes(q) ||
      c.base.includes(q) ||
      c.name.toUpperCase().includes(q) ||
      c.bucketLabel.toUpperCase().includes(q),
  );
}

function attachNews(coins: CoinSignal[], news: NewsBundle | null): CoinSignal[] {
  if (!news) return coins;
  return coins.map((c) => {
    const hits = news.items.filter((n) => n.coins.includes(c.base));
    if (hits.length === 0) return c;
    const neg = hits.find((h) => h.tone === "negative");
    const pos = hits.find((h) => h.tone === "positive");
    const hint = neg
      ? `News pressure: ${neg.title}`
      : pos
        ? `News support: ${pos.title}`
        : `News: ${hits[0]?.title}`;
    return { ...c, newsHint: hint };
  });
}

export function ScannerDashboard() {
  const [scan, setScan] = useState<MarketScan | null>(null);
  const [news, setNews] = useState<NewsBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("tradeReady");
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState("—");
  const [liveOn, setLiveOn] = useState(false);
  const [bellOn, setBellOn] = useState(false);
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [openCoin, setOpenCoin] = useState<string | null>(null);
  const seenRef = useRef<Record<string, number>>({});
  const firstScan = useRef(true);
  const userTab = useRef(false);

  useEffect(() => {
    if (userTab.current || !scan) return;
    if (scan.tradeReady.length > 0) return;
    if (scan.bullishSoon.length > 0) setTab("bullishSoon");
    else if (scan.volumeJump.length > 0) setTab("volumeJump");
    else if (scan.volumeRising.length > 0) setTab("volumeRising");
    else setTab("all");
  }, [scan]);

  useEffect(() => {
    setBellOn(localStorage.getItem(BELL_KEY) === "1");
    setAlerts(loadAlerts());
    seenRef.current = loadSeen();
  }, []);

  useEffect(() => {
    const tick = () => setClock(pktClock());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function pullScan() {
    try {
      const res = await fetch("/api/scan");
      if (!res.ok) throw new Error("scan HTTP " + res.status);
      const data = (await res.json()) as MarketScan;
      if (data.stats.scanned > 0) {
        setScan(data);
        setLiveOn(true);
        setError(null);
      } else {
        setError("Market data delay ho gaya, dubara try ho raha hai.");
      }
    } catch {
      setError("Data nahi mil saka. Internet / Binance thori der baad try karein.");
    } finally {
      setLoading(false);
    }
  }

  async function pullNews() {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) return;
      setNews((await res.json()) as NewsBundle);
    } catch {
      /* news optional */
    }
  }

  useEffect(() => {
    void pullScan();
    void pullNews();
    const scanId = window.setInterval(() => void pullScan(), 5000);
    const newsId = window.setInterval(() => void pullNews(), 180000);
    return () => {
      window.clearInterval(scanId);
      window.clearInterval(newsId);
    };
  }, []);

  useEffect(() => {
    if (!scan) return;
    if (firstScan.current) {
      firstScan.current = false;
      return;
    }
    const hot = [...scan.tradeReady, ...scan.bullishSoon].filter((c) => c.score >= 68);
    const fresh: SavedAlert[] = [];
    const seen = seenRef.current;
    const hour = Math.floor(Date.now() / 3_600_000);
    for (const coin of hot) {
      const key = `${coin.symbol}:${coin.bucket}:${hour}`;
      if (seen[key]) continue;
      seen[key] = Date.now();
      fresh.push({
        id: key,
        at: new Date().toISOString(),
        pair: coin.pair,
        title: `${coin.bucketLabel} — ${coin.pair}`,
        why: coin.why,
        score: coin.score,
      });
    }
    if (fresh.length === 0) return;
    seenRef.current = seen;
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    setAlerts((prev) => {
      const next = [...fresh, ...prev].slice(0, 40);
      localStorage.setItem(ALERT_KEY, JSON.stringify(next));
      return next;
    });
    for (const a of fresh) {
      toast(a.title, { description: `Score ${a.score}/100 · ${a.why.slice(0, 140)}` });
      if (bellOn) {
        beep();
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(a.title, { body: `Score ${a.score}/100` });
          }
        } catch {
          /* iframe may block */
        }
      }
    }
  }, [scan, bellOn]);

  async function toggleBell() {
    const next = !bellOn;
    setBellOn(next);
    localStorage.setItem(BELL_KEY, next ? "1" : "0");
    if (next && typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        /* ignore */
      }
    }
  }

  const withHints = useMemo(() => {
    if (!scan) return null;
    return {
      ...scan,
      coins: attachNews(scan.coins, news),
      tradeReady: attachNews(scan.tradeReady, news),
      bullishSoon: attachNews(scan.bullishSoon, news),
      volumeJump: attachNews(scan.volumeJump, news),
      volumeRising: attachNews(scan.volumeRising, news),
      dumpWatch: attachNews(scan.dumpWatch, news),
    };
  }, [scan, news]);

  const rows = listForTab(withHints, tab, query);
  const btc = withHints?.btc;
  const eth = withHints?.eth;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7">
      <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Binance Spot · 15M + 1H
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Crypto Volume Scanner
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Har coin ka <Term>volume</Term> 15 minute aur 1 ghante pe check hota hai. Sirf volume nahi —
            <Term of="Confirmation">price confirmation</Term> bhi. Is se dump pe false alert kam milte hain.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-3 text-sm",
              liveOn ? "text-bull" : "text-muted",
            )}
          >
            <Radio className="size-4" aria-hidden />
            {liveOn ? "LIVE · market scan" : "Scan start ho raha hai"}
          </span>
          <span className="inline-flex min-h-11 items-center rounded-sm border border-border px-3 font-mono text-sm text-fg tabular-nums">
            {clock} PKT
          </span>
          <Button variant={bellOn ? "primary" : "secondary"} onClick={() => void toggleBell()}>
            {bellOn ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            Alerts {bellOn ? "on" : "off"}
          </Button>
          <Button variant="ghost" onClick={() => void pullScan()} aria-label="Dobara scan">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <Stat label="USDT pairs dekhe" value={String(withHints?.stats.usdtPairs ?? "—")} />
        <Stat label="Deep scan" value={String(withHints?.stats.scanned ?? "—")} />
        <Stat
          label="BTC 24h"
          value={btc ? formatPct(btc.change24h, 2) : "—"}
          tone={btc && btc.change24h >= 0 ? "bull" : "bear"}
        />
        <Stat
          label="ETH 24h"
          value={eth ? formatPct(eth.change24h, 2) : "—"}
          tone={eth && eth.change24h >= 0 ? "bull" : "bear"}
        />
        <Stat label="Bull trade" value={String(withHints?.stats.tradeReady ?? 0)} tone="bull" />
        <Stat
          label="Last scan"
          value={withHints ? formatPkt(withHints.stats.generatedAt) : "—"}
        />
      </section>

      {error ? (
        <p className="rounded-md border border-border bg-bg-elevated px-4 py-3 text-sm text-warn">
          {error}
        </p>
      ) : null}

      <p className="flex gap-2 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <Term>Score</Term> 0–100 hai (volume + price direction + dono timeframe). Mushkil word pe
          hover / tap karke matlab dekh lo. Ye monitoring tool hai — automatic trade nahi karta.
        </span>
      </p>

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              userTab.current = true;
              setTab(t.id);
            }}
            className={cn(
              "min-h-11 shrink-0 rounded-sm px-3 text-sm font-medium whitespace-nowrap",
              tab === t.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-bg-subtle hover:text-fg",
            )}
          >
            {t.label}
            {t.id === "tradeReady" && withHints ? ` ${withHints.stats.tradeReady}` : ""}
            {t.id === "bullishSoon" && withHints ? ` ${withHints.stats.bullishSoon}` : ""}
          </button>
        ))}
      </div>

      {tab !== "news" && tab !== "words" ? (
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Coin dhoondo — BTC, SOL, PEPE..."
            className="h-11 w-full rounded-md border border-border bg-bg-elevated pr-3 pl-10 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
          />
        </div>
      ) : null}

      {tab === "news" ? (
        <NewsSection news={news} />
      ) : tab === "words" ? (
        <GlossarySection />
      ) : loading && !withHints ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-bg-elevated" />
          ))}
          <p className="text-sm text-muted">Market scan chal raha hai — Binance spot se data aa raha hai.</p>
        </div>
      ) : rows.length === 0 ? (
        <Empty tab={tab} />
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, tab === "all" ? 80 : 24).map((coin) => (
            <li key={coin.symbol}>
              <CoinCard
                coin={coin}
                open={openCoin === coin.symbol}
                onToggle={() => setOpenCoin((s) => (s === coin.symbol ? null : coin.symbol))}
              />
            </li>
          ))}
        </ul>
      )}

      {alerts.length > 0 ? (
        <section className="space-y-2 border-t border-border pt-4">
          <h2 className="text-sm font-medium text-fg">Alert history</h2>
          <ul className="space-y-1">
            {alerts.slice(0, 8).map((a) => (
              <li key={a.id} className="rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{a.pair}</span>
                  <span className="font-mono text-xs text-muted tabular-nums">{formatPkt(a.at)}</span>
                </div>
                <p className="text-muted">{a.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="border-t border-border pt-4 text-xs text-subtle">
        Data: Binance Spot public market. Paper / monitoring only. Apna capital risk pe mat lagao bina
        khud check kiye. Last scan {withHints?.stats.durationMs ?? 0}ms · source {withHints?.stats.source ?? "—"}.
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear";
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={cn(
          "font-mono text-lg font-medium tabular-nums",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Empty({ tab }: { tab: TabId }) {
  const copy: Record<string, string> = {
    tradeReady: "Is waqt koi coin dono timeframe pe strong bull confirmation nahi de raha. Scan jari hai.",
    bullishSoon: "Abhi koi clear 'bullish ban raha hai' setup nahi. Volume aate hi yahan dikhega.",
    volumeJump: "Pichle 5–15 minute mein koi bada volume jump nahi mila.",
    volumeRising: "15M + 1H pe sustained volume rise wali list khali hai.",
    dumpWatch: "High volume + price girne wala koi strong dump abhi nahi.",
    all: "Is filter pe coin nahi mila.",
  };
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-4 py-8 text-center text-sm text-muted">
      {copy[tab] ?? "Kuch nahi mila."}
    </div>
  );
}

function CoinCard({
  coin,
  open,
  onToggle,
}: {
  coin: CoinSignal;
  open: boolean;
  onToggle: () => void;
}) {
  const price = coin.price;
  const TrendIcon = coin.trend === "bearish" ? TrendingDown : TrendingUp;
  const tone =
    coin.bucket === "dumpWatch" ? "bear" : coin.trend === "bullish" ? "bull" : coin.trend === "bearish" ? "bear" : "warn";

  return (
    <article className="rounded-lg border border-border bg-bg-elevated p-3 sm:p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-h-11 flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-sm bg-bg-subtle",
              tone === "bull" && "text-bull",
              tone === "bear" && "text-bear",
              tone === "warn" && "text-warn",
            )}
          >
            {coin.bucket === "dumpWatch" ? (
              <Activity className="size-4" />
            ) : (
              <TrendIcon className="size-4" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-fg">
              {coin.pair}{" "}
              <span className="font-normal text-muted">{coin.name}</span>
            </span>
            <span className="block truncate text-xs text-muted">{coin.bucketLabel}</span>
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs tabular-nums sm:flex sm:items-center sm:gap-5 sm:text-sm">
          <Metric label="Price" value={`$${formatPrice(price)}`} />
          <Metric label="15M vol" value={formatPct(coin.vol15mPct)} tone={coin.vol15mPct >= 0 ? "bull" : "bear"} />
          <Metric label="1H vol" value={formatPct(coin.vol1hPct)} tone={coin.vol1hPct >= 0 ? "bull" : "bear"} />
          <Metric label="15M price" value={formatPct(coin.price15m, 2)} tone={coin.price15m >= 0 ? "bull" : "bear"} />
          <Metric label="Score" value={`${coin.score}/100`} />
        </dl>
      </button>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted">
          <p className="text-fg">{coin.why}</p>
          <p>
            Trend: {coin.trendLabel}. Horizon: {coin.horizon}. Strength: {coin.strengthLabel}. 24h volume:{" "}
            {formatUsd(coin.quoteVolume24h)}. {coin.liquidityNote}.
          </p>
          {coin.newsHint ? (
            <p className="text-warn">
              <Newspaper className="mr-1 inline size-3.5" />
              {coin.newsHint}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bull" | "bear";
}) {
  return (
    <div>
      <dt className="text-xs text-subtle">{label}</dt>
      <dd
        className={cn(
          "text-fg",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function NewsSection({ news }: { news: NewsBundle | null }) {
  if (!news) {
    return <p className="text-sm text-muted">News load ho rahi hai…</p>;
  }
  return (
    <div className="space-y-4">
      <p className="rounded-md border border-border bg-bg-elevated px-4 py-3 text-sm text-fg">
        {news.marketNote}
      </p>
      {news.trending.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-medium">Duniya mein abhi discuss ho rahe coins</h2>
          <ul className="flex flex-wrap gap-2">
            {news.trending.map((t) => (
              <li
                key={t.symbol}
                className="rounded-sm border border-border bg-bg-subtle px-2 py-1 text-xs text-fg"
              >
                {t.symbol} · {t.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="space-y-2">
        {news.items.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-bg-elevated p-3">
            <p className="text-xs text-muted">
              {item.source}
              {item.coins.length ? ` · ${item.coins.join(", ")}` : ""}
            </p>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-fg hover:underline">
                {item.title}
              </a>
            ) : (
              <p className="font-medium text-fg">{item.title}</p>
            )}
            <p className="text-sm text-muted">{item.toneLabel}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GlossarySection() {
  return (
    <ul className="space-y-2">
      {GLOSSARY.map((g) => (
        <li key={g.term} className="rounded-lg border border-border bg-bg-elevated p-3">
          <p className="flex items-center gap-2 font-medium text-fg">
            <BookOpen className="size-4 text-muted" aria-hidden />
            {g.term}
          </p>
          <p className="text-sm text-muted">{g.meaning}</p>
        </li>
      ))}
    </ul>
  );
}
