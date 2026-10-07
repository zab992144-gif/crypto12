import { i as __toESM } from "../_runtime.mjs";
import { _ as lazyRouteComponent, b as useRouter, f as Scripts, g as Outlet, h as createRouter, p as HeadContent, q as require_react, v as createFileRoute, x as require_jsx_runtime, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Bn4cLkwk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CgzqtFC7.css";
var APP_NAME = "Crypto Volume Scanner";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Binance spot pe 15 minute aur 1 ghante ka volume + bullish trend scanner, live alerts ke sath."
			},
			{
				name: "theme-color",
				content: "#0c0d10"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-right",
				toastOptions: { style: {
					background: "#14161c",
					border: "1px solid #2a2e38",
					color: "#eef0f4"
				} }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-Cw-4wK2h.mjs");
var Route$2 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var STABLE_BASES = /* @__PURE__ */ new Set([
	"USDC",
	"FDUSD",
	"TUSD",
	"BUSD",
	"DAI",
	"USDP",
	"USDE",
	"EUR",
	"AEUR",
	"EURI",
	"USD1",
	"RLUSD",
	"USDT",
	"USDD",
	"PYUSD",
	"GUSD",
	"FRAX",
	"LUSD",
	"USTC",
	"USDJ"
]);
var COIN_NAMES = {
	BTC: "Bitcoin",
	ETH: "Ethereum",
	SOL: "Solana",
	XRP: "XRP",
	BNB: "BNB",
	DOGE: "Dogecoin",
	ADA: "Cardano",
	AVAX: "Avalanche",
	LINK: "Chainlink",
	DOT: "Polkadot",
	SUI: "Sui",
	NEAR: "NEAR",
	UNI: "Uniswap",
	LTC: "Litecoin",
	ATOM: "Cosmos",
	APT: "Aptos",
	ARB: "Arbitrum",
	OP: "Optimism",
	PEPE: "Pepe",
	SHIB: "Shiba Inu",
	WIF: "dogwifhat",
	TON: "Toncoin",
	TRX: "TRON",
	FIL: "Filecoin",
	INJ: "Injective",
	TIA: "Celestia",
	SEI: "Sei",
	RENDER: "Render",
	RNDR: "Render",
	FET: "Fetch.ai",
	AGIX: "SingularityNET",
	TAO: "Bittensor",
	AAVE: "Aave",
	MKR: "Maker",
	CRV: "Curve",
	LDO: "Lido",
	ENA: "Ethena",
	WLD: "Worldcoin",
	ONDO: "Ondo",
	JUP: "Jupiter",
	HBAR: "Hedera",
	ALGO: "Algorand",
	VET: "VeChain",
	SAND: "The Sandbox",
	MANA: "Decentraland",
	AXS: "Axie Infinity",
	IMX: "Immutable",
	STX: "Stacks",
	RUNE: "THORChain",
	GRT: "The Graph",
	BCH: "Bitcoin Cash",
	ETC: "Ethereum Classic",
	XLM: "Stellar",
	HYPE: "Hyperliquid",
	PENGU: "Pudgy Penguins",
	FARTCOIN: "Fartcoin",
	TRUMP: "TRUMP",
	PNUT: "Peanut",
	BONK: "Bonk",
	FLOKI: "FLOKI",
	W: "Wormhole",
	JTO: "Jito",
	PYTH: "Pyth",
	ORDI: "ORDI",
	S: "Sonic",
	KAIA: "Kaia",
	POL: "Polygon",
	MATIC: "Polygon",
	QNT: "Quant",
	ZEC: "Zcash",
	DASH: "Dash",
	XMR: "Monero",
	VIRTUAL: "Virtuals",
	AI16Z: "ai16z",
	MOVE: "Movement",
	BERA: "Berachain",
	IP: "Story",
	SPX: "SPX6900",
	POPCAT: "POPCAT",
	MOODENG: "MOODENG",
	GOAT: "GOAT",
	ACT: "ACT",
	NEIRO: "Neiro",
	EIGEN: "EigenLayer",
	STRK: "Starknet",
	ZK: "ZKsync",
	SAGA: "Saga",
	OM: "MANTRA",
	ORCA: "Orca",
	WBT: "WhiteBIT",
	ASTER: "Aster",
	PUMP: "Pump"
};
var GLOSSARY = [
	{
		term: "Volume",
		meaning: "Kitna coin kharida aur becha gaya. Volume barhe to market mein zyada activity hai."
	},
	{
		term: "Volume spike / jump",
		meaning: "Volume achanak average se kaafi zyada ho jana. Ye interest ka signal hai, lekin dump bhi isi waqt ho sakta hai."
	},
	{
		term: "Baseline",
		meaning: "Pehle ka average volume. Isi se compare karke pata chalta hai volume asl mein barha hai ya nahi."
	},
	{
		term: "Bullish",
		meaning: "Price upar jane ka mood / trend. Buyers zyada strong hain."
	},
	{
		term: "Bearish",
		meaning: "Price neeche jane ka mood / trend. Sellers zyada strong hain."
	},
	{
		term: "Trend",
		meaning: "Price kis taraf chal rahi hai — upar, neeche, ya mix."
	},
	{
		term: "Momentum",
		meaning: "Price ki raftar. Tez upar ya tez neeche move ko momentum kehte hain."
	},
	{
		term: "Spot market",
		meaning: "Asli coin abhi kharid/bechne ka market. Future ya leverage nahi — seedha spot price."
	},
	{
		term: "Timeframe",
		meaning: "Chart ka time window. 15M = pichle 15 minute, 1H = pichla 1 ghanta."
	},
	{
		term: "Score",
		meaning: "0 se 100 tak hamari strength. Volume + price direction + dono timeframe mil kar banti hai."
	},
	{
		term: "Liquidity",
		meaning: "Kitni asani se badi quantity kharid/bech sakte ho bina price zyada shift kiye."
	},
	{
		term: "Alert",
		meaning: "Jab koi coin strong condition pe aaye to foran notice."
	},
	{
		term: "Dump",
		meaning: "Volume ke saath price tez girna. Sirf volume dekh ke buy nahi karna."
	},
	{
		term: "Pump",
		meaning: "Price ka achanak jump. Kabhi real demand, kabhi temporary hype."
	},
	{
		term: "Confirmation",
		meaning: "Volume ke saath price bhi usi direction mein jana. Is se false alert kam hote hain."
	},
	{
		term: "USDT pair",
		meaning: "Coin ko Tether (USDT) ke against trade karna, jaise BTC/USDT."
	},
	{
		term: "Price change %",
		meaning: "Price kitne percent upar ya neeche gayi us timeframe mein."
	}
];
var POSITIVE_NEWS = /\b(surge|rally|bull|etf|approv|partnership|record|high|adopt|inflow|upgrade|launch|win|soar|gain|breakout|all-time)\b/i;
var NEGATIVE_NEWS = /\b(hack|crash|dump|sec|lawsuit|ban|exploit|outflow|fraud|collapse|probe|fine|stolen|liquidat|warn|reject)\b/i;
var NEWS_CACHE_MS = 18e4;
var newsCache = null;
function stripTags(s) {
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&/g, "&").replace(/"/g, "\"").replace(/&#39;/g, "'").replace(/</g, "<").replace(/>/g, ">").replace(/\s+/g, " ").trim();
}
function between(block, tag) {
	const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
	const m = block.match(re);
	return m?.[1] ? stripTags(m[1]) : "";
}
function matchCoins(text) {
	const upper = text.toUpperCase();
	const found = /* @__PURE__ */ new Set();
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
function toneOf(title) {
	if (NEGATIVE_NEWS.test(title)) return "negative";
	if (POSITIVE_NEWS.test(title)) return "positive";
	return "neutral";
}
function toneLabel(tone) {
	if (tone === "positive") return "Positive — coin ke liye support ho sakti hai";
	if (tone === "negative") return "Negative — pressure aa sakta hai";
	return "Neutral — sirf context ke liye";
}
function parseRss(xml, source) {
	const parts = xml.split(/<item[\s>]/i).slice(1);
	const items = [];
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
			summary: desc.slice(0, 180)
		});
	}
	return items;
}
async function fetchText$1(url) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 1e4);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { "User-Agent": "CryptoVolumeScanner/1.0" }
		});
		if (!res.ok) throw new Error(String(res.status));
		return await res.text();
	} finally {
		clearTimeout(timer);
	}
}
async function fetchNewsBundle() {
	if (newsCache && Date.now() - newsCache.at < NEWS_CACHE_MS) return newsCache.data;
	const settled = await Promise.allSettled([{
		url: "https://feeds.feedburner.com/CoinDesk",
		source: "CoinDesk"
	}, {
		url: "https://bitcoinmagazine.com/.rss/full/",
		source: "Bitcoin Magazine"
	}].map(async (f) => parseRss(await fetchText$1(f.url), f.source)));
	const items = [];
	for (const s of settled) if (s.status === "fulfilled") items.push(...s.value);
	items.sort((a, b) => a.publishedAt < b.publishedAt ? 1 : -1);
	let trending = [];
	try {
		trending = (JSON.parse(await fetchText$1("https://api.coingecko.com/api/v3/search/trending")).coins ?? []).slice(0, 8).map((c, i) => ({
			symbol: (c.item?.symbol ?? "").toUpperCase(),
			name: c.item?.name ?? "",
			rank: c.item?.market_cap_rank ?? i + 1
		}));
	} catch {
		trending = [];
	}
	const bullNews = items.filter((i) => i.tone === "positive").length;
	const bearNews = items.filter((i) => i.tone === "negative").length;
	let marketNote = "News mix hai — pehle volume + price dekho, sirf headline pe trade mat lo.";
	if (bullNews > bearNews + 2) marketNote = "Headlines zyada positive hain. Phir bhi volume confirmation zaroori hai.";
	else if (bearNews > bullNews + 2) marketNote = "Headlines mein pressure zyada dikh raha hai. Dump volume se bacho.";
	const data = {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		items: items.slice(0, 16),
		trending,
		marketNote
	};
	newsCache = {
		at: Date.now(),
		data
	};
	return data;
}
var Route$1 = createFileRoute("/api/news")({ server: { handlers: { GET: async () => {
	const data = await fetchNewsBundle();
	return Response.json(data, { headers: { "Cache-Control": "public, max-age=60" } });
} } } });
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function pctVsAvg(current, avg) {
	if (!Number.isFinite(current) || !Number.isFinite(avg) || avg <= 0) return 0;
	return (current - avg) / avg * 100;
}
function rangePos(last, low, high) {
	const span = high - low;
	if (!Number.isFinite(span) || span <= 0) return .5;
	return clamp((last - low) / span, 0, 1);
}
function fmtName(base) {
	return COIN_NAMES[base] ?? base;
}
function trendOf(price15m, price1h) {
	if (price15m >= .2 && price1h >= .1) return {
		kind: "bullish",
		label: "Bullish ban raha hai"
	};
	if (price15m <= -.2 && price1h <= -.1) return {
		kind: "bearish",
		label: "Neeche / bearish"
	};
	if (price15m >= .35 && price1h >= -.6) return {
		kind: "bullish",
		label: "Short-term upar turn"
	};
	return {
		kind: "mixed",
		label: "Mix / clear nahi"
	};
}
function strengthLabel(score) {
	if (score >= 80) return "HIGH";
	if (score >= 62) return "MEDIUM";
	return "LOW";
}
function analyzeCoin(t, w5, w15, w1h) {
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
	const liquidityOk = t.quoteVolume >= 2e6;
	const liquidityNote = liquidityOk ? "Liquidity theek hai" : "Liquidity kam hai — badi quantity pe price slippery ho sakti hai";
	const volScore = clamp(vol15mPct * .12 + vol1hPct * .08 + Math.max(vol5mPct, 0) * .04, 0, 42);
	const priceScore = clamp(Math.max(price15m, 0) * 6 + Math.max(price1h, 0) * 4, 0, 28);
	const structure = (rangePos15m > .62 ? 8 : 0) + (rangePos1h > .58 ? 6 : 0);
	const align = trend === "bullish" ? 14 : trend === "mixed" ? 4 : 0;
	const liq = clamp(Math.log10(Math.max(t.quoteVolume, 1)) * 1.6, 0, 12);
	let dumpPenalty = 0;
	if (price15m < -.25 && vol15mPct > 40) dumpPenalty = 22;
	if (price15m < -.8 && vol15mPct > 70) dumpPenalty = 32;
	const score = clamp(Math.round(volScore + priceScore + structure + align + liq - dumpPenalty), 0, 100);
	const justJumped = vol5mPct > 85 && (w5?.quoteVolume ?? 0) > (w15?.quoteVolume ?? 0) * .35 && vol15mPct > 40;
	const rising = vol15mPct > 32 && vol1hPct > 18;
	const tradeReady = vol15mPct > 70 && vol1hPct > 28 && price15m > .35 && price1h > .12 && trend === "bullish" && rangePos15m > .5 && liquidityOk;
	const bullishSoon = !tradeReady && vol15mPct > 42 && price15m > .18 && price1h > -.7 && trend !== "bearish" && rangePos15m > .42;
	const dumpWatch = vol15mPct > 55 && price15m < -.35;
	let bucket = "watch";
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
		newsHint: null
	};
}
function sortSignals(coins) {
	return [...coins].sort((a, b) => b.score - a.score || b.vol15mPct - a.vol15mPct);
}
function pickBucket(coins, bucket, limit) {
	return sortSignals(coins.filter((c) => c.bucket === bucket)).slice(0, limit);
}
var HOSTS = [
	"https://data-api.binance.vision",
	"https://api.binance.com",
	"https://api1.binance.com",
	"https://api2.binance.com"
];
var LEVERAGE_RE = /(\d+[LS]|UP|DOWN|BULL|BEAR)USDT$/i;
function isUsdtSpotSymbol(symbol) {
	if (!symbol.endsWith("USDT")) return false;
	if (LEVERAGE_RE.test(symbol)) return false;
	const base = symbol.slice(0, -4);
	if (STABLE_BASES.has(base)) return false;
	return /^[A-Z0-9]{2,20}$/.test(base);
}
function baseAsset(symbol) {
	return symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
}
async function fetchText(url, timeoutMs = 12e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { "User-Agent": "CryptoVolumeScanner/1.0" }
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.text();
	} finally {
		clearTimeout(timer);
	}
}
async function fetchBinanceJson(path) {
	let lastErr;
	for (const host of HOSTS) try {
		const text = await fetchText(`${host}${path}`);
		return JSON.parse(text);
	} catch (err) {
		lastErr = err;
	}
	throw lastErr instanceof Error ? lastErr : /* @__PURE__ */ new Error("Binance data nahi mila");
}
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function parse24h(raw) {
	if (!isUsdtSpotSymbol(raw.symbol)) return null;
	const lastPrice = num(raw.lastPrice);
	const open = num(raw.openPrice);
	const change = raw.priceChangePercent != null ? num(raw.priceChangePercent) : open > 0 ? (lastPrice - open) / open * 100 : 0;
	return {
		symbol: raw.symbol,
		base: baseAsset(raw.symbol),
		lastPrice,
		priceChangePct: change,
		quoteVolume: num(raw.quoteVolume),
		volume: num(raw.volume),
		high: num(raw.highPrice),
		low: num(raw.lowPrice),
		tradeCount: raw.count ?? 0
	};
}
function parseWindow(raw) {
	return {
		priceChangePct: num(raw.priceChangePercent),
		quoteVolume: num(raw.quoteVolume),
		volume: num(raw.volume),
		high: num(raw.highPrice),
		low: num(raw.lowPrice),
		last: num(raw.lastPrice),
		tradeCount: raw.count ?? 0
	};
}
async function fetchAll24h() {
	const raw = await fetchBinanceJson("/api/v3/ticker/24hr");
	const out = [];
	for (const row of raw) {
		const parsed = parse24h(row);
		if (parsed && parsed.quoteVolume > 8e4 && parsed.lastPrice > 0) out.push(parsed);
	}
	out.sort((a, b) => b.quoteVolume - a.quoteVolume);
	return out;
}
async function fetchWindowBatch(symbols, windowSize) {
	const map = /* @__PURE__ */ new Map();
	if (symbols.length === 0) return map;
	const raw = await fetchBinanceJson(`/api/v3/ticker?symbols=${encodeURIComponent(JSON.stringify(symbols))}&windowSize=${windowSize}`);
	const list = Array.isArray(raw) ? raw : [raw];
	for (const row of list) map.set(row.symbol, parseWindow(row));
	return map;
}
async function fetchWindows(symbols, sizes, batchSize = 50) {
	const result = {
		"5m": /* @__PURE__ */ new Map(),
		"15m": /* @__PURE__ */ new Map(),
		"1h": /* @__PURE__ */ new Map()
	};
	const batches = [];
	for (let i = 0; i < symbols.length; i += batchSize) batches.push(symbols.slice(i, i + batchSize));
	const jobs = [];
	for (const batch of batches) for (const size of sizes) jobs.push(async () => {
		try {
			const map = await fetchWindowBatch(batch, size);
			for (const [sym, stats] of map) result[size].set(sym, stats);
		} catch {}
	});
	const limit = 6;
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
var CACHE_MS = 8e3;
var cache = null;
var inflight = null;
var DEEP_SCAN = 180;
function emptyScan(error, durationMs) {
	return {
		stats: {
			scanned: 0,
			usdtPairs: 0,
			tradeReady: 0,
			bullishSoon: 0,
			volumeJump: 0,
			volumeRising: 0,
			dumpWatch: 0,
			generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			source: error,
			durationMs
		},
		coins: [],
		tradeReady: [],
		bullishSoon: [],
		volumeJump: [],
		volumeRising: [],
		dumpWatch: [],
		btc: null,
		eth: null
	};
}
async function runScan(force = false) {
	if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.data;
	if (!force && inflight) return inflight;
	inflight = (async () => {
		const started = Date.now();
		try {
			const all = await fetchAll24h();
			const deep = all.slice(0, DEEP_SCAN);
			const windows = await fetchWindows(deep.map((c) => c.symbol), [
				"5m",
				"15m",
				"1h"
			], 50);
			const ranked = sortSignals(deep.map((t) => analyzeCoin(t, windows["5m"].get(t.symbol), windows["15m"].get(t.symbol), windows["1h"].get(t.symbol))));
			const tradeReady = pickBucket(ranked, "tradeReady", 20);
			const bullishSoon = pickBucket(ranked, "bullishSoon", 20);
			const volumeJump = pickBucket(ranked, "volumeJump", 20);
			const volumeRising = pickBucket(ranked, "volumeRising", 20);
			const dumpWatch = pickBucket(ranked, "dumpWatch", 12);
			const data = {
				stats: {
					scanned: ranked.length,
					usdtPairs: all.length,
					tradeReady: ranked.filter((c) => c.bucket === "tradeReady").length,
					bullishSoon: ranked.filter((c) => c.bucket === "bullishSoon").length,
					volumeJump: ranked.filter((c) => c.bucket === "volumeJump").length,
					volumeRising: ranked.filter((c) => c.bucket === "volumeRising").length,
					dumpWatch: ranked.filter((c) => c.bucket === "dumpWatch").length,
					generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
					source: "Binance Spot",
					durationMs: Date.now() - started
				},
				coins: ranked,
				tradeReady,
				bullishSoon,
				volumeJump,
				volumeRising,
				dumpWatch,
				btc: ranked.find((c) => c.symbol === "BTCUSDT") ?? null,
				eth: ranked.find((c) => c.symbol === "ETHUSDT") ?? null
			};
			cache = {
				at: Date.now(),
				data
			};
			return data;
		} catch (err) {
			return emptyScan(err instanceof Error ? err.message : "scan fail", Date.now() - started);
		} finally {
			inflight = null;
		}
	})();
	return inflight;
}
var Route = createFileRoute("/api/scan")({ server: { handlers: { GET: async () => {
	const data = await runScan();
	return Response.json(data, { headers: { "Cache-Control": "public, max-age=4" } });
} } } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	ApiNewsRoute: Route$1.update({
		id: "/api/news",
		path: "/api/news",
		getParentRoute: () => Route$3
	}),
	ApiScanRoute: Route.update({
		id: "/api/scan",
		path: "/api/scan",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { runScan as n, GLOSSARY as r, router_exports as t };
