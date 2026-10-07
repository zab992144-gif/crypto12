import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RefreshCw, c as Info, d as BellOff, f as Activity, i as Search, l as BookOpen, n as TrendingUp, o as Radio, r as TrendingDown, s as Newspaper, u as Bell } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as runScan, r as GLOSSARY } from "./router-Bn4cLkwk.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cw-4wK2h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var Button = (0, import_react.forwardRef)(function Button({ className, variant = "secondary", type = "button", ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-3.5 text-sm font-medium transition-colors duration-150 disabled:opacity-50", variant === "primary" && "bg-accent text-accent-fg hover:opacity-90", variant === "secondary" && "border border-border bg-bg-subtle text-fg hover:bg-bg-elevated", variant === "ghost" && "text-muted hover:bg-bg-subtle hover:text-fg", className),
		...props
	});
});
function meaningOf(term) {
	return GLOSSARY.find((g) => g.term.toLowerCase().includes(term.toLowerCase()))?.meaning;
}
function Term({ children, of, className }) {
	const meaning = meaningOf(of ?? children);
	if (!meaning) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("abbr", {
		title: meaning,
		className: cn("cursor-help decoration-dotted underline underline-offset-2 decoration-subtle", className),
		children
	});
}
function formatPrice(n) {
	if (!Number.isFinite(n)) return "—";
	if (n >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
	if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
	if (n >= .01) return n.toLocaleString("en-US", { maximumFractionDigits: 5 });
	return n.toPrecision(3);
}
function formatPct(n, digits = 0) {
	if (!Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function formatUsd(n) {
	if (!Number.isFinite(n)) return "—";
	if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
	if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
	if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
	return `$${n.toFixed(0)}`;
}
function formatPkt(iso) {
	const d = iso ? new Date(iso) : /* @__PURE__ */ new Date();
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Karachi",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).format(d);
}
function pktClock(date = /* @__PURE__ */ new Date()) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Karachi",
		weekday: "short",
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).format(date);
}
var TABS = [
	{
		id: "tradeReady",
		label: "Bull trade"
	},
	{
		id: "bullishSoon",
		label: "Bullish ja sakte"
	},
	{
		id: "volumeJump",
		label: "Abhi jump"
	},
	{
		id: "volumeRising",
		label: "Volume barh raha"
	},
	{
		id: "dumpWatch",
		label: "Dump watch"
	},
	{
		id: "all",
		label: "Sab coins"
	},
	{
		id: "news",
		label: "News"
	},
	{
		id: "words",
		label: "Alfaaz"
	}
];
var ALERT_KEY = "cvs-alerts-v1";
var BELL_KEY = "cvs-bell-on";
var SEEN_KEY = "cvs-seen-v1";
function loadAlerts() {
	try {
		return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]");
	} catch {
		return [];
	}
}
function loadSeen() {
	try {
		return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
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
		gain.gain.value = .05;
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + .14);
	} catch {}
}
function listForTab(scan, tab, query) {
	if (!scan) return [];
	let rows = [];
	if (tab === "tradeReady") rows = scan.tradeReady;
	else if (tab === "bullishSoon") rows = scan.bullishSoon;
	else if (tab === "volumeJump") rows = scan.volumeJump;
	else if (tab === "volumeRising") rows = scan.volumeRising;
	else if (tab === "dumpWatch") rows = scan.dumpWatch;
	else if (tab === "all") rows = scan.coins;
	const q = query.trim().toUpperCase();
	if (!q) return rows;
	return rows.filter((c) => c.pair.includes(q) || c.base.includes(q) || c.name.toUpperCase().includes(q) || c.bucketLabel.toUpperCase().includes(q));
}
function attachNews(coins, news) {
	if (!news) return coins;
	return coins.map((c) => {
		const hits = news.items.filter((n) => n.coins.includes(c.base));
		if (hits.length === 0) return c;
		const neg = hits.find((h) => h.tone === "negative");
		const pos = hits.find((h) => h.tone === "positive");
		const hint = neg ? `News pressure: ${neg.title}` : pos ? `News support: ${pos.title}` : `News: ${hits[0]?.title}`;
		return {
			...c,
			newsHint: hint
		};
	});
}
function ScannerDashboard() {
	const [scan, setScan] = (0, import_react.useState)(null);
	const [news, setNews] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [tab, setTab] = (0, import_react.useState)("tradeReady");
	const [query, setQuery] = (0, import_react.useState)("");
	const [clock, setClock] = (0, import_react.useState)(() => pktClock());
	const [liveOn, setLiveOn] = (0, import_react.useState)(false);
	const [livePrices, setLivePrices] = (0, import_react.useState)({});
	const [bellOn, setBellOn] = (0, import_react.useState)(false);
	const [alerts, setAlerts] = (0, import_react.useState)([]);
	const [openCoin, setOpenCoin] = (0, import_react.useState)(null);
	const seenRef = (0, import_react.useRef)({});
	const firstScan = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		setBellOn(localStorage.getItem(BELL_KEY) === "1");
		setAlerts(loadAlerts());
		seenRef.current = loadSeen();
	}, []);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setClock(pktClock()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	async function pullScan() {
		try {
			const res = await fetch("/api/scan");
			if (!res.ok) throw new Error("scan HTTP " + res.status);
			const data = await res.json();
			if (!data.coins || data.coins.length === 0) {
				const fallback = await runScan(true);
				setScan(fallback);
				setError(fallback.stats.scanned ? null : "Market data delay ho gaya, dubara try ho raha hai.");
			} else {
				setScan(data);
				setError(null);
			}
		} catch {
			try {
				const fallback = await runScan(true);
				setScan(fallback);
				setError(null);
			} catch {
				setError("Data nahi mil saka. Internet / Binance thori der baad try karein.");
			}
		} finally {
			setLoading(false);
		}
	}
	async function pullNews() {
		try {
			const res = await fetch("/api/news");
			if (!res.ok) return;
			setNews(await res.json());
		} catch {}
	}
	(0, import_react.useEffect)(() => {
		pullScan();
		pullNews();
		const scanId = window.setInterval(() => void pullScan(), 8e3);
		const newsId = window.setInterval(() => void pullNews(), 18e4);
		return () => {
			window.clearInterval(scanId);
			window.clearInterval(newsId);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const urls = ["wss://stream.binance.com:9443/ws/!miniTicker@arr", "wss://data-stream.binance.vision/ws/!miniTicker@arr"];
		let ws = null;
		let idx = 0;
		let closed = false;
		function connect() {
			if (closed || idx >= urls.length) return;
			try {
				ws = new WebSocket(urls[idx]);
			} catch {
				idx += 1;
				connect();
				return;
			}
			ws.onopen = () => setLiveOn(true);
			ws.onclose = () => {
				setLiveOn(false);
				idx += 1;
				window.setTimeout(connect, 1200);
			};
			ws.onerror = () => ws?.close();
			ws.onmessage = (ev) => {
				try {
					const arr = JSON.parse(String(ev.data));
					const next = {};
					for (const t of arr) if (t.s.endsWith("USDT")) next[t.s] = Number(t.c);
					setLivePrices(next);
				} catch {}
			};
		}
		connect();
		return () => {
			closed = true;
			ws?.close();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!scan) return;
		if (firstScan.current) {
			firstScan.current = false;
			return;
		}
		const hot = [...scan.tradeReady, ...scan.bullishSoon].filter((c) => c.score >= 68);
		const fresh = [];
		const seen = seenRef.current;
		const hour = Math.floor(Date.now() / 36e5);
		for (const coin of hot) {
			const key = `${coin.symbol}:${coin.bucket}:${hour}`;
			if (seen[key]) continue;
			seen[key] = Date.now();
			fresh.push({
				id: key,
				at: (/* @__PURE__ */ new Date()).toISOString(),
				pair: coin.pair,
				title: `${coin.bucketLabel} — ${coin.pair}`,
				why: coin.why,
				score: coin.score
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
					if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(a.title, { body: `Score ${a.score}/100` });
				} catch {}
			}
		}
	}, [scan, bellOn]);
	async function toggleBell() {
		const next = !bellOn;
		setBellOn(next);
		localStorage.setItem(BELL_KEY, next ? "1" : "0");
		if (next && typeof Notification !== "undefined" && Notification.permission === "default") try {
			await Notification.requestPermission();
		} catch {}
	}
	const withHints = (0, import_react.useMemo)(() => {
		if (!scan) return null;
		return {
			...scan,
			coins: attachNews(scan.coins, news),
			tradeReady: attachNews(scan.tradeReady, news),
			bullishSoon: attachNews(scan.bullishSoon, news),
			volumeJump: attachNews(scan.volumeJump, news),
			volumeRising: attachNews(scan.volumeRising, news),
			dumpWatch: attachNews(scan.dumpWatch, news)
		};
	}, [scan, news]);
	const rows = listForTab(withHints, tab, query);
	const btc = withHints?.btc;
	const eth = withHints?.eth;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-muted uppercase",
							children: "Binance Spot · 15M + 1H"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight text-fg sm:text-3xl",
							children: "Crypto Volume Scanner"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-2xl text-sm text-muted",
							children: [
								"Har coin ka ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Term, { children: "volume" }),
								" 15 minute aur 1 ghante pe check hota hai. Sirf volume nahi —",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Term, {
									of: "Confirmation",
									children: "price confirmation"
								}),
								" bhi. Is se dump pe false alert kam milte hain."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-3 text-sm", liveOn ? "text-bull" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								className: "size-4",
								"aria-hidden": true
							}), liveOn ? "LIVE · har second" : "Scan live · 8s refresh"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex min-h-11 items-center rounded-sm border border-border px-3 font-mono text-sm text-fg tabular-nums",
							children: [clock, " PKT"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: bellOn ? "primary" : "secondary",
							onClick: () => void toggleBell(),
							children: [
								bellOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-4" }),
								"Alerts ",
								bellOn ? "on" : "off"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => void pullScan(),
							"aria-label": "Dobara scan",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", loading && "animate-spin") })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "USDT pairs dekhe",
						value: String(withHints?.stats.usdtPairs ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Deep scan",
						value: String(withHints?.stats.scanned ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "BTC 24h",
						value: btc ? formatPct(btc.change24h, 2) : "—",
						tone: btc && btc.change24h >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "ETH 24h",
						value: eth ? formatPct(eth.change24h, 2) : "—",
						tone: eth && eth.change24h >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Bull trade",
						value: String(withHints?.stats.tradeReady ?? 0),
						tone: "bull"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Last scan",
						value: withHints ? formatPkt(withHints.stats.generatedAt) : "—"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md border border-border bg-bg-elevated px-4 py-3 text-sm text-warn",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex gap-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					className: "mt-0.5 size-4 shrink-0",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Term, { children: "Score" }), " 0–100 hai (volume + price direction + dono timeframe). Mushkil word pe hover / tap karke matlab dekh lo. Ye monitoring tool hai — automatic trade nahi karta."] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("min-h-11 shrink-0 rounded-sm px-3 text-sm font-medium whitespace-nowrap", tab === t.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-bg-subtle hover:text-fg"),
					children: [
						t.label,
						t.id === "tradeReady" && withHints ? ` ${withHints.stats.tradeReady}` : "",
						t.id === "bullishSoon" && withHints ? ` ${withHints.stats.bullishSoon}` : ""
					]
				}, t.id))
			}),
			tab !== "news" && tab !== "words" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-3.5 left-3 size-4 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Coin dhoondo — BTC, SOL, PEPE...",
					className: "h-11 w-full rounded-md border border-border bg-bg-elevated pr-3 pl-10 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent"
				})]
			}) : null,
			tab === "news" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsSection, { news }) : tab === "words" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlossarySection, {}) : loading && !withHints ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-lg bg-bg-elevated" }, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Market scan chal raha hai — Binance spot se data aa raha hai."
				})]
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { tab }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.slice(0, tab === "all" ? 80 : 24).map((coin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinCard, {
					coin,
					livePrice: livePrices[coin.symbol],
					open: openCoin === coin.symbol,
					onToggle: () => setOpenCoin((s) => s === coin.symbol ? null : coin.symbol)
				}) }, coin.symbol))
			}),
			alerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2 border-t border-border pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-fg",
					children: "Alert history"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: alerts.slice(0, 8).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: a.pair
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-muted tabular-nums",
								children: formatPkt(a.at)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: a.title
						})]
					}, a.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-border pt-4 text-xs text-subtle",
				children: [
					"Data: Binance Spot public market. Paper / monitoring only. Apna capital risk pe mat lagao bina khud check kiye. Last scan ",
					withHints?.stats.durationMs ?? 0,
					"ms · source ",
					withHints?.stats.source ?? "—",
					"."
				]
			})
		]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg-elevated px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("font-mono text-lg font-medium tabular-nums", tone === "bull" && "text-bull", tone === "bear" && "text-bear"),
			children: value
		})]
	});
}
function Empty({ tab }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border border-border bg-bg-elevated px-4 py-8 text-center text-sm text-muted",
		children: {
			tradeReady: "Is waqt koi coin dono timeframe pe strong bull confirmation nahi de raha. Scan jari hai.",
			bullishSoon: "Abhi koi clear 'bullish ban raha hai' setup nahi. Volume aate hi yahan dikhega.",
			volumeJump: "Pichle 5–15 minute mein koi bada volume jump nahi mila.",
			volumeRising: "15M + 1H pe sustained volume rise wali list khali hai.",
			dumpWatch: "High volume + price girne wala koi strong dump abhi nahi.",
			all: "Is filter pe coin nahi mila."
		}[tab] ?? "Kuch nahi mila."
	});
}
function CoinCard({ coin, livePrice, open, onToggle }) {
	const price = livePrice && livePrice > 0 ? livePrice : coin.price;
	const TrendIcon = coin.trend === "bearish" ? TrendingDown : TrendingUp;
	const tone = coin.bucket === "dumpWatch" ? "bear" : coin.trend === "bullish" ? "bull" : coin.trend === "bearish" ? "bear" : "warn";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border border-border bg-bg-elevated p-3 sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onToggle,
			className: "flex w-full min-h-11 flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-9 items-center justify-center rounded-sm bg-bg-subtle", tone === "bull" && "text-bull", tone === "bear" && "text-bear", tone === "warn" && "text-warn"),
					children: coin.bucket === "dumpWatch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block font-medium text-fg",
						children: [
							coin.pair,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted",
								children: coin.name
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-xs text-muted",
						children: coin.bucketLabel
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs tabular-nums sm:flex sm:items-center sm:gap-5 sm:text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Price",
						value: `$${formatPrice(price)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "15M vol",
						value: formatPct(coin.vol15mPct),
						tone: coin.vol15mPct >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "1H vol",
						value: formatPct(coin.vol1hPct),
						tone: coin.vol1hPct >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "15M price",
						value: formatPct(coin.price15m, 2),
						tone: coin.price15m >= 0 ? "bull" : "bear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Score",
						value: `${coin.score}/100`
					})
				]
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-fg",
					children: coin.why
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Trend: ",
					coin.trendLabel,
					". Horizon: ",
					coin.horizon,
					". Strength: ",
					coin.strengthLabel,
					". 24h volume:",
					" ",
					formatUsd(coin.quoteVolume24h),
					". ",
					coin.liquidityNote,
					"."
				] }),
				coin.newsHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-warn",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, { className: "mr-1 inline size-3.5" }), coin.newsHint]
				}) : null
			]
		}) : null]
	});
}
function Metric({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: cn("text-fg", tone === "bull" && "text-bull", tone === "bear" && "text-bear"),
		children: value
	})] });
}
function NewsSection({ news }) {
	if (!news) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "News load ho rahi hai…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md border border-border bg-bg-elevated px-4 py-3 text-sm text-fg",
				children: news.marketNote
			}),
			news.trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-sm font-medium",
				children: "Duniya mein abhi discuss ho rahe coins"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				children: news.trending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border bg-bg-subtle px-2 py-1 text-xs text-fg",
					children: [
						t.symbol,
						" · ",
						t.name
					]
				}, t.symbol))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: news.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-bg-elevated p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [item.source, item.coins.length ? ` · ${item.coins.join(", ")}` : ""]
						}),
						item.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: item.url,
							target: "_blank",
							rel: "noreferrer",
							className: "font-medium text-fg hover:underline",
							children: item.title
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-fg",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: item.toneLabel
						})
					]
				}, item.id))
			})
		]
	});
}
function GlossarySection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: GLOSSARY.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-lg border border-border bg-bg-elevated p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 font-medium text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
					className: "size-4 text-muted",
					"aria-hidden": true
				}), g.term]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: g.meaning
			})]
		}, g.term))
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScannerDashboard, {});
}
//#endregion
export { Home as component };
