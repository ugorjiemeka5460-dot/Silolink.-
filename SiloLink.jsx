import React, { useState, useEffect, useMemo } from "react";
import {
  Sprout, Package, Clock, TrendingUp, Search, Bell, Plus, X,
  MapPin, Users, LayoutGrid, Warehouse, Snowflake, Wheat,
  ChevronRight, AlertTriangle, CheckCircle2, ArrowUpRight, Loader2,
  Globe, Gavel, PiggyBank, Truck, Fish, Drumstick, Store, Tractor, Tag,
  MessageCircle, Video, Send, Activity
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

/* ---------- design tokens ---------- */
const COLORS = {
  bg: "#12261C", panel: "#1B3628", panelLine: "rgba(247,241,224,0.09)",
  card: "#FBF6EA", cardLine: "rgba(28,38,32,0.10)",
  ink: "#1C2620", inkMuted: "#65756A", paper: "#F4EFE0", paperMuted: "rgba(244,239,224,0.62)",
  gold: "#D9A441", goldDeep: "#B9832E", rust: "#B5482A", sage: "#5C8A5C", teal: "#3E7C74", sky: "#4A6FA5",
  violet: "#8B5FBF",
};
const cardStyle = { background: COLORS.card, border: `1px solid ${COLORS.cardLine}` };
const panelStyle = { background: COLORS.panel, border: `1px solid ${COLORS.panelLine}` };

/* ---------- reference data ---------- */
const TODAY = new Date("2026-08-16T00:00:00");

const REGIONS = [
  { id: "lagos-ng", name: "Lagos, Nigeria", hub: "Ikorodu Hub", tonnes: 18.4 },
  { id: "nairobi-ke", name: "Nairobi, Kenya", hub: "Kiambu Hub", tonnes: 12.1 },
  { id: "dar-tz", name: "Dar es Salaam, Tanzania", hub: "Morogoro Hub", tonnes: 9.6 },
  { id: "saopaulo-br", name: "São Paulo, Brazil", hub: "Campinas Hub", tonnes: 21.7 },
  { id: "bangkok-th", name: "Bangkok, Thailand", hub: "Nonthaburi Hub", tonnes: 15.2 },
  { id: "accra-gh", name: "Accra, Ghana", hub: "Tema Hub", tonnes: 7.8 },
  { id: "london-uk", name: "London, UK", hub: "Diaspora Desk", tonnes: 0 },
];
const regionName = (id) => REGIONS.find((r) => r.id === id)?.name || id;
const REGION_MULT = { "lagos-ng": 0.95, "nairobi-ke": 1.05, "dar-tz": 0.85, "saopaulo-br": 1.15, "bangkok-th": 1.0, "accra-gh": 0.9, "london-uk": 1.65 };

const PRODUCTS = {
  "Yam Tubers": { life: 90, unit: "kg", category: "Crops" },
  "Garri (Processed Cassava)": { life: 180, unit: "kg", category: "Crops" },
  "Ofada Rice": { life: 365, unit: "kg", category: "Crops" },
  "Fresh Tomatoes": { life: 7, unit: "kg", category: "Crops" },
  "Cocoa Beans": { life: 270, unit: "kg", category: "Crops" },
  "Scotch Bonnet Pepper": { life: 10, unit: "kg", category: "Crops" },
  "Plantain": { life: 14, unit: "kg", category: "Crops" },
  "Maize (Dried)": { life: 200, unit: "kg", category: "Crops" },
  "Vanilla Beans": { life: 365, unit: "kg", category: "Crops" },
  "Arabica Coffee Beans": { life: 300, unit: "kg", category: "Crops" },
  "Live Cattle": { life: 25, unit: "head", category: "Livestock" },
  "Live Chicken": { life: 12, unit: "head", category: "Livestock" },
  "Fresh Beef": { life: 5, unit: "kg", category: "Livestock" },
  "Fresh Tilapia Fish": { life: 4, unit: "kg", category: "Seafood" },
  "Catfish": { life: 4, unit: "kg", category: "Seafood" },
};
const CROP_LIST = Object.keys(PRODUCTS).filter((p) => PRODUCTS[p].category === "Crops");

const GROW_DAYS = {
  "Yam Tubers": 150, "Garri (Processed Cassava)": 270, "Ofada Rice": 120, "Fresh Tomatoes": 75,
  "Cocoa Beans": 180, "Scotch Bonnet Pepper": 90, "Plantain": 300, "Maize (Dried)": 100,
  "Vanilla Beans": 365, "Arabica Coffee Beans": 240,
};
const YIELD_PER_HA = {
  "Yam Tubers": 8000, "Garri (Processed Cassava)": 12000, "Ofada Rice": 4000, "Fresh Tomatoes": 20000,
  "Cocoa Beans": 500, "Scotch Bonnet Pepper": 3000, "Plantain": 10000, "Maize (Dried)": 3500,
  "Vanilla Beans": 300, "Arabica Coffee Beans": 800,
};
const PRICE_PER_UNIT = {
  "Yam Tubers": 1.2, "Garri (Processed Cassava)": 1.5, "Ofada Rice": 2, "Fresh Tomatoes": 0.9,
  "Cocoa Beans": 3.5, "Scotch Bonnet Pepper": 2.2, "Plantain": 1, "Maize (Dried)": 0.8,
  "Vanilla Beans": 45, "Arabica Coffee Beans": 6,
  "Live Cattle": 700, "Live Chicken": 12, "Fresh Beef": 7, "Fresh Tilapia Fish": 4, "Catfish": 5,
};
const SIZE_LABELS = {
  "Live Cattle": "Adult, avg 350kg live weight", "Live Chicken": "Broiler, avg 2.2kg",
  "Fresh Beef": "Butchered cuts, avg 1kg packs", "Fresh Tilapia Fish": "Medium, avg 0.6kg each",
  "Catfish": "Large, avg 1.5–2kg each",
};

const STORAGE_TYPES = {
  "Dry Storage": { cap: 3000, icon: Warehouse }, "Cold Storage": { cap: 800, icon: Snowflake },
  "Silo (Grain)": { cap: 6000, icon: Wheat }, "Livestock Pen": { cap: 300, icon: Drumstick },
};
const CATEGORY_ICON = { Crops: Sprout, Livestock: Drumstick, Seafood: Fish };
const CATEGORY_COLOR = { Crops: COLORS.gold, Livestock: COLORS.teal, Seafood: COLORS.sky };
const INTENTS = ["Sell Locally", "Export", "Process", "Send to Auction"];
const PROCESS_OPTIONS = {
  Crops: ["Raw / Unprocessed", "Cleaned & Bagged", "Milled / Ground"],
  Livestock: ["Whole (unprocessed)", "Cleaned & Packaged", "Portioned Cuts"],
  Seafood: ["Whole (unprocessed)", "Cleaned & Packaged", "Portioned Cuts"],
};

const LAND_PLOTS_SEED = [
  { id: "p1", region: "lagos-ng", name: "Ikorodu Riverside Plot", hectares: 12, soil: "Loamy — Excellent", landowner: "Adewale Okafor", rentPerHaMonth: 60 },
  { id: "p2", region: "nairobi-ke", name: "Kiambu Highland Plot", hectares: 20, soil: "Volcanic — Excellent", landowner: "Ngozi Umeh", rentPerHaMonth: 50 },
  { id: "p3", region: "dar-tz", name: "Morogoro Valley Plot", hectares: 30, soil: "Clay-loam — Good", landowner: "Local Landowner Cooperative", rentPerHaMonth: 35 },
  { id: "p4", region: "saopaulo-br", name: "Campinas Red-Soil Plot", hectares: 25, soil: "Terra roxa — Excellent", landowner: "Carlos Menezes", rentPerHaMonth: 70 },
  { id: "p5", region: "bangkok-th", name: "Nonthaburi Paddy Plot", hectares: 15, soil: "Silty — Good", landowner: "Somchai Pattana", rentPerHaMonth: 40 },
  { id: "p6", region: "accra-gh", name: "Tema Coastal Plot", hectares: 10, soil: "Sandy-loam — Fair", landowner: "Amara Osei", rentPerHaMonth: 30 },
];
const CARE_LOG = ["Soil tested & fertilized by the field team", "Irrigation scheduled weekly", "Weeding & pest control handled on-site"];
const SOIL_OPTIONS = ["Loamy — Excellent", "Volcanic — Excellent", "Terra roxa — Excellent", "Clay-loam — Good", "Silty — Good", "Sandy-loam — Fair"];

const SEED_BATCHES = [
  { id: "b1", product: "Yam Tubers", quantity: 1450, storageType: "Dry Storage", dateStored: "2026-06-20", intent: null, processChoice: null, listed: false },
  { id: "b2", product: "Fresh Tomatoes", quantity: 220, storageType: "Cold Storage", dateStored: "2026-08-11", intent: "Sell Locally", processChoice: null, listed: false },
  { id: "b3", product: "Cocoa Beans", quantity: 3800, storageType: "Silo (Grain)", dateStored: "2026-03-02", intent: "Export", processChoice: null, listed: false },
  { id: "b4", product: "Garri (Processed Cassava)", quantity: 900, storageType: "Dry Storage", dateStored: "2026-07-01", intent: "Process", processChoice: "Cleaned & Bagged", listed: false },
  { id: "b5", product: "Live Chicken", quantity: 85, storageType: "Livestock Pen", dateStored: "2026-08-09", intent: null, processChoice: null, listed: false },
  { id: "b6", product: "Live Cattle", quantity: 14, storageType: "Livestock Pen", dateStored: "2026-07-28", intent: null, processChoice: null, listed: false },
  { id: "b7", product: "Fresh Tilapia Fish", quantity: 60, storageType: "Cold Storage", dateStored: "2026-08-13", intent: null, processChoice: null, listed: false },
];

const SEED_AUCTIONS = [
  { id: "a1", product: "Live Cattle", quantity: 6, unit: "head", region: "nairobi-ke", seller: "Ngozi Umeh", leadBid: 4200, leadBidder: "Tunde Bakare", status: "live", processChoice: null, deliveryRegion: null },
  { id: "a2", product: "Live Chicken", quantity: 40, unit: "head", region: "accra-gh", seller: "Folake Adeyemi", leadBid: 620, leadBidder: "You", status: "live", processChoice: null, deliveryRegion: null },
  { id: "a3", product: "Fresh Beef", quantity: 150, unit: "kg", region: "saopaulo-br", seller: "Carlos Menezes", leadBid: 980, leadBidder: "Chidinma Eze", status: "closed", processChoice: "Portioned Cuts", deliveryRegion: "lagos-ng" },
];

const SEED_CAMPAIGNS = [
  { id: "c1", title: "Bulk Vanilla Beans from Tanzania", product: "Vanilla Beans", originRegion: "dar-tz", destRegion: "lagos-ng", initiator: "You", target: 3000, funded: 1150, contributors: 4, note: "Bulk price is 22% cheaper than buying solo." },
  { id: "c2", title: "Shared Arabica Coffee Container", product: "Arabica Coffee Beans", originRegion: "nairobi-ke", destRegion: "bangkok-th", initiator: "Somchai Pattana", target: 5000, funded: 4600, contributors: 9, note: "One more contribution and logistics gets booked." },
  { id: "c3", title: "Cattle Restocking Circle", product: "Live Cattle", originRegion: "accra-gh", destRegion: "dar-tz", initiator: "Amara Osei", target: 2400, funded: 600, contributors: 2, note: "Splitting a full livestock truck lowers transport cost per head." },
];

const SEED_INVESTMENTS = [
  { id: "inv1", plotId: "p1", region: "lagos-ng", hectares: 3, crop: "Maize (Dried)", datePlanted: "2026-05-20", status: "growing" },
  { id: "inv2", plotId: "p3", region: "dar-tz", hectares: 5, crop: "Fresh Tomatoes", datePlanted: "2026-06-01", status: "growing" },
];

const SEED_MARKETPLACE = [
  { id: "m1", product: "Cocoa Beans", quantity: 1200, unit: "kg", price: 4200, region: "accra-gh", seller: "Amara Osei", type: "Export", status: "available", size: null },
  { id: "m2", product: "Fresh Tilapia Fish", quantity: 80, unit: "kg", price: 320, region: "bangkok-th", seller: "Somchai Pattana", type: "Sell Locally", status: "available", size: SIZE_LABELS["Fresh Tilapia Fish"] },
  { id: "m3", product: "Arabica Coffee Beans", quantity: 600, unit: "kg", price: 3600, region: "nairobi-ke", seller: "Ngozi Umeh", type: "Export", status: "available", size: null },
  { id: "m4", product: "Catfish", quantity: 200, unit: "kg", price: 1000, region: "lagos-ng", seller: "Adewale Okafor", type: "Sell Locally", status: "available", size: SIZE_LABELS["Catfish"] },
];

const SEED_SHIPMENTS = [
  { id: "s1", kind: "Auction", product: "Fresh Beef", quantity: 150, unit: "kg", originRegion: "saopaulo-br", destRegion: "lagos-ng", progress: 65, recipient: null },
  { id: "s2", kind: "Group Buying", product: "Arabica Coffee Beans", quantity: 600, unit: "kg", originRegion: "nairobi-ke", destRegion: "bangkok-th", progress: 100, recipient: null },
  { id: "s3", kind: "Marketplace", product: "Cocoa Beans", quantity: 1200, unit: "kg", originRegion: "accra-gh", destRegion: "london-uk", progress: 30, recipient: null },
];

const SEED_TIPS = [
  { id: "t1", author: "Ngozi Umeh", product: "Live Cattle", title: "How to spot healthy cattle before buying", body: "Look for clear eyes, a shiny coat, steady breathing, and alert ears — any discharge or limping is a red flag.", video: true },
  { id: "t2", author: "Somchai Pattana", product: "Arabica Coffee Beans", title: "Best conditions for storing green coffee", body: "Keep beans below 20°C, away from direct sunlight, in breathable jute — plastic traps moisture and speeds spoilage.", video: false },
  { id: "t3", author: "Folake Adeyemi", product: "Fresh Tilapia Fish", title: "A 5-second freshness test at the market", body: "Press the flesh — it should spring back immediately. Cloudy eyes or a sunken belly mean it's been sitting too long.", video: true },
];

const REGION_FARMERS = [
  { name: "Adewale Okafor", farm: "Ilaje Family Farms", region: "lagos-ng", product: "Yam & Cassava", km: 6, letter: "A" },
  { name: "Chidinma Eze", farm: "Sunrise Root Farms", region: "lagos-ng", product: "Garri, Cassava", km: 9, letter: "C" },
  { name: "Tunde Bakare", farm: "Bakare Rice Fields", region: "lagos-ng", product: "Ofada Rice", km: 14, letter: "T" },
  { name: "Ngozi Umeh", farm: "Umeh Cattle Ranch", region: "nairobi-ke", product: "Cattle, Beef", km: 11, letter: "N" },
  { name: "Folake Adeyemi", farm: "Adeyemi Poultry", region: "accra-gh", product: "Chicken, Pepper", km: 18, letter: "F" },
  { name: "Amara Osei", farm: "Osei Livestock Co.", region: "accra-gh", product: "Cattle, Chicken", km: 22, letter: "A" },
  { name: "Somchai Pattana", farm: "Pattana Coffee Estate", region: "bangkok-th", product: "Coffee, Rice", km: 8, letter: "S" },
  { name: "Carlos Menezes", farm: "Menezes Fazenda", region: "saopaulo-br", product: "Beef, Coffee", km: 15, letter: "C" },
];

/* ---------- helpers ---------- */
function daysBetween(dateStr) { const d = new Date(dateStr + "T00:00:00"); return Math.floor((TODAY - d) / 86400000); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function fmtMoney(n) { return "$" + Math.round(n).toLocaleString(); }
function fmtMoney2(n) { return "$" + n.toFixed(2); }
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function sellerCode(name) { return "SL-" + (1000 + (hashStr(name) % 9000)); }
function priceAt(product, regionId, dayIndex) {
  const base = PRICE_PER_UNIT[product] || 1;
  const mult = REGION_MULT[regionId] || 1;
  const seed = hashStr(product + regionId);
  const wave = 1 + 0.12 * Math.sin(dayIndex * 0.9 + (seed % 7)) + 0.05 * Math.sin(dayIndex * 2.3 + (seed % 5) * 1.7);
  return Math.max(0.15, base * mult * wave);
}

function batchMeta(b) {
  const product = PRODUCTS[b.product];
  const storage = STORAGE_TYPES[b.storageType];
  const daysStored = daysBetween(b.dateStored);
  const daysRemaining = product.life - daysStored;
  const percentFull = clamp((b.quantity / storage.cap) * 100, 2, 100);
  let freshness = "fresh";
  if (daysRemaining < 0) freshness = "expired";
  else if (daysRemaining <= 7) freshness = "critical";
  else if (daysRemaining <= 30) freshness = "watch";
  return { daysStored, daysRemaining, percentFull, freshness, life: product.life, unit: product.unit, category: product.category };
}
function investmentMeta(inv) {
  const grow = GROW_DAYS[inv.crop];
  const daysGrown = Math.max(0, daysBetween(inv.datePlanted));
  const percent = clamp((daysGrown / grow) * 100, 0, 100);
  const ready = daysGrown >= grow;
  const totalYield = Math.round(inv.hectares * YIELD_PER_HA[inv.crop]);
  const company = Math.round(totalYield * 0.10);
  const grower = Math.round(totalYield * 0.80);
  const landowner = Math.round(totalYield * 0.05);
  const community = totalYield - company - grower - landowner;
  return { grow, daysGrown, percent, ready, totalYield, company, grower, landowner, community };
}

const FRESH_COLOR = { fresh: COLORS.sage, watch: COLORS.gold, critical: COLORS.rust, expired: COLORS.inkMuted };
const FRESH_LABEL = { fresh: "Fresh", watch: "Nearing limit", critical: "Act soon", expired: "Past shelf life" };
const INTENT_COLOR = { "Sell Locally": COLORS.sage, "Export": COLORS.sky, "Process": COLORS.goldDeep, "Send to Auction": COLORS.teal };
const STEP_LABELS = ["Preparing", "In Transit", "Customs", "Out for Delivery", "Delivered"];
const LINE_COLORS = [COLORS.gold, COLORS.sky, COLORS.teal, COLORS.rust, COLORS.sage, COLORS.goldDeep, COLORS.violet];

/* ---------- shared bits ---------- */
function SiloGauge({ percent, color, size = 56 }) {
  const w = size, h = size * 1.35;
  return (
    <div className="relative shrink-0 rounded-t-full rounded-b-lg overflow-hidden border" style={{ width: w, height: h, borderColor: COLORS.cardLine, background: "rgba(28,38,32,0.05)" }}>
      <div className="absolute bottom-0 left-0 right-0 transition-all duration-500" style={{ height: `${percent}%`, background: `linear-gradient(180deg, ${color}CC, ${color})` }} />
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] font-mono font-semibold" style={{ color: percent > 55 ? COLORS.card : COLORS.ink }}>{Math.round(percent)}%</span></div>
    </div>
  );
}
function FieldBar({ percent, ready }) {
  return <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(28,38,32,0.08)" }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: ready ? COLORS.sage : COLORS.gold }} /></div>;
}
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl p-4 flex-1 min-w-[150px]" style={cardStyle}>
      <div className="flex items-center justify-between mb-3"><span className="text-xs uppercase tracking-wide font-semibold" style={{ color: COLORS.inkMuted }}>{label}</span><Icon size={16} style={{ color: COLORS.goldDeep }} /></div>
      <div className="text-2xl font-semibold font-mono" style={{ color: COLORS.ink }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>{sub}</div>}
    </div>
  );
}
function RouteTrack({ progress }) {
  const step = progress >= 95 ? 4 : progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 20 ? 1 : 0;
  return (
    <div>
      <div className="relative h-1.5 rounded-full my-4" style={{ background: "rgba(28,38,32,0.08)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress}%`, background: COLORS.sage }} />
        <div className="absolute" style={{ left: `calc(${clamp(progress, 3, 97)}% - 8px)`, top: -7 }}><Truck size={16} style={{ color: COLORS.goldDeep }} /></div>
      </div>
      <div className="flex justify-between">
        {STEP_LABELS.map((l, i) => <span key={l} className="text-[10px]" style={{ color: i <= step ? COLORS.sage : COLORS.inkMuted, fontWeight: i <= step ? 700 : 400 }}>{l}</span>)}
      </div>
    </div>
  );
}

/* ---------- chat modal ---------- */
function ChatModal({ person, onClose }) {
  const [messages, setMessages] = useState([{ from: "them", text: `Hi! Yes, the ${person.product} is still available — how much do you need?` }]);
  const [draft, setDraft] = useState("");
  const send = () => { if (!draft.trim()) return; setMessages((p) => [...p, { from: "me", text: draft }]); setDraft(""); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 flex flex-col" style={{ ...cardStyle, maxHeight: "80vh" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{person.seller}</h2>
            <p className="text-[11px] font-mono" style={{ color: COLORS.inkMuted }}>{sellerCode(person.seller)} · {regionName(person.region)}</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mb-3" style={{ minHeight: 120 }}>
          {messages.map((m, i) => (
            <div key={i} className="flex" style={{ justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
              <span className="text-xs px-3 py-2 rounded-2xl max-w-[75%]" style={{ background: m.from === "me" ? COLORS.gold : "rgba(28,38,32,0.06)", color: COLORS.ink }}>{m.text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." className="flex-1 text-sm px-3 py-2 rounded-full" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
          <button onClick={send} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: COLORS.ink }}><Send size={14} style={{ color: COLORS.paper }} /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------- batch card ---------- */
function BatchCard({ batch, onSetIntent, onSetProcess, onList }) {
  const meta = batchMeta(batch);
  const color = FRESH_COLOR[meta.freshness];
  const CatIcon = CATEGORY_ICON[meta.category];
  const canList = (batch.intent === "Sell Locally" || batch.intent === "Export") && !batch.listed;
  const price = Math.round(batch.quantity * (PRICE_PER_UNIT[batch.product] || 1));
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <div className="flex gap-4">
        <SiloGauge percent={meta.percentFull} color={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-1.5"><CatIcon size={13} style={{ color: COLORS.goldDeep }} /><h3 className="font-semibold text-[15px]" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{batch.product}</h3></div>
              <p className="text-xs mt-0.5" style={{ color: COLORS.inkMuted }}>{batch.storageType} · stored {meta.daysStored}d ago</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0" style={{ color: meta.freshness === "watch" ? "#7A5717" : "#FFFFFF", background: color }}>
              {meta.freshness === "critical" || meta.freshness === "expired" ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}{FRESH_LABEL[meta.freshness]}
            </span>
          </div>
          <div className="flex items-center gap-5 mt-3 flex-wrap font-mono text-xs" style={{ color: COLORS.ink }}>
            <span><b>{batch.quantity.toLocaleString()}</b> {meta.unit} stored</span>
            <span>{meta.daysRemaining >= 0 ? <><b>{meta.daysRemaining}d</b> shelf life left</> : <><b>{Math.abs(meta.daysRemaining)}d</b> past shelf life</>}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.cardLine}` }}>
        {!batch.intent ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>What do you want to do with this batch?</p>
            <div className="flex flex-wrap gap-2">
              {INTENTS.map((i) => (
                <button key={i} onClick={() => onSetIntent(batch.id, i)} className="text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80" style={{ background: INTENT_COLOR[i], color: "#fff" }}>
                  {i === "Send to Auction" ? <span className="flex items-center gap-1"><Gavel size={11} />{i}</span> : i}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: INTENT_COLOR[batch.intent] + "22", color: INTENT_COLOR[batch.intent] }}>
              → {batch.intent}{batch.intent === "Send to Auction" ? " (listed live)" : batch.listed ? " · on marketplace" : ""}
            </span>
            <div className="flex gap-2">
              {batch.intent === "Process" && (
                <select value={batch.processChoice || ""} onChange={(e) => onSetProcess(batch.id, e.target.value)} className="text-xs px-2.5 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>
                  <option value="" disabled>Choose processing method</option>
                  {PROCESS_OPTIONS[meta.category].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {canList && <button onClick={() => onList(batch.id, price)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: COLORS.ink, color: COLORS.paper }}><Tag size={11} /> List for {fmtMoney(price)}</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- marketplace card ---------- */
function MarketplaceCard({ m, onBuy, onContact }) {
  const sold = m.status === "sold";
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ ...cardStyle, opacity: sold ? 0.65 : 1 }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-[15px]" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{m.quantity.toLocaleString()} {m.unit} · {m.product}</h3>
          {m.size && <p className="text-xs mt-0.5" style={{ color: COLORS.goldDeep }}>{m.size}</p>}
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.inkMuted }}><MapPin size={11} /> {regionName(m.region)} · {m.seller} <span className="font-mono">({sellerCode(m.seller)})</span></p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: INTENT_COLOR[m.type], color: "#fff" }}>{m.type}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-sm font-semibold" style={{ color: COLORS.ink }}>{fmtMoney(m.price)}</span>
        <div className="flex gap-2">
          <button onClick={() => onContact(m)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}><MessageCircle size={12} /> Contact</button>
          {sold ? (
            <span className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5" style={{ color: COLORS.sage }}><CheckCircle2 size={13} /> Sold</span>
          ) : (
            <button onClick={() => onBuy(m.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: COLORS.gold, color: COLORS.ink }}><Store size={12} /> Buy now</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- market prices (line + pie charts) ---------- */
function MarketPrices({ marketplace }) {
  const [product, setProduct] = useState("Cocoa Beans");
  const days = useMemo(() => { const arr = []; for (let i = 13; i >= 0; i--) { const d = new Date(TODAY); d.setDate(d.getDate() - i); arr.push(d); } return arr; }, []);
  const chartData = useMemo(() => days.map((d, i) => {
    const row = { day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    REGIONS.forEach((r) => { row[r.id] = Number(priceAt(product, r.id, i).toFixed(2)); });
    return row;
  }), [product, days]);
  const todays = REGIONS.map((r) => ({ region: r, price: priceAt(product, r.id, 13) })).sort((a, b) => a.price - b.price);
  const cheapest = todays[0], priciest = todays[todays.length - 1];

  const mix = useMemo(() => {
    const counts = { Crops: 0, Livestock: 0, Seafood: 0 };
    marketplace.forEach((m) => { const c = PRODUCTS[m.product]?.category; if (c) counts[c]++; });
    return Object.keys(counts).filter((k) => counts[k] > 0).map((k) => ({ name: k, value: counts[k] }));
  }, [marketplace]);

  return (
    <div className="space-y-4">
      <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full p-2.5 rounded-lg text-sm" style={{ ...cardStyle, color: COLORS.ink }}>
        {Object.keys(PRODUCTS).map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <div className="rounded-2xl p-4" style={cardStyle}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: COLORS.inkMuted }}><Activity size={13} /> 14-day price trend by region ({PRODUCTS[product].unit})</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke={COLORS.cardLine} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: COLORS.inkMuted }} />
            <YAxis tick={{ fontSize: 10, fill: COLORS.inkMuted }} width={36} />
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.cardLine}`, fontSize: 11, borderRadius: 8 }} />
            {REGIONS.map((r, i) => <Line key={r.id} type="monotone" dataKey={r.id} name={r.name} stroke={LINE_COLORS[i % LINE_COLORS.length]} dot={false} strokeWidth={2} />)}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {REGIONS.map((r, i) => (
            <span key={r.id} className="text-[10px] flex items-center gap-1" style={{ color: COLORS.inkMuted }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: LINE_COLORS[i % LINE_COLORS.length], display: "inline-block" }} />{r.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Cheapest today</p>
          <p className="text-sm font-semibold mt-1" style={{ color: COLORS.sage, fontFamily: "Fraunces, serif" }}>{cheapest.region.name}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: COLORS.ink }}>{fmtMoney2(cheapest.price)}/{PRODUCTS[product].unit}</p>
        </div>
        <div className="rounded-2xl p-4" style={cardStyle}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Priciest today</p>
          <p className="text-sm font-semibold mt-1" style={{ color: COLORS.rust, fontFamily: "Fraunces, serif" }}>{priciest.region.name}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: COLORS.ink }}>{fmtMoney2(priciest.price)}/{PRODUCTS[product].unit}</p>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={cardStyle}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLORS.inkMuted }}>Marketplace mix by category</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={mix} dataKey="value" nameKey="name" outerRadius={65} label={{ fontSize: 11, fill: COLORS.ink }}>
              {mix.map((c) => <Cell key={c.name} fill={CATEGORY_COLOR[c.name]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.cardLine}`, fontSize: 11, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- community tips ---------- */
function TipCard({ t }) {
  return (
    <div className="rounded-2xl p-4" style={cardStyle}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.video ? COLORS.rust : COLORS.sky }}>
          {t.video ? <Video size={15} color="#fff" /> : <MessageCircle size={15} color="#fff" />}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{t.video ? "Video tip" : "Tip"} · {t.product}</p>
          <h4 className="text-sm font-semibold mt-0.5" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{t.title}</h4>
          <p className="text-xs mt-1" style={{ color: COLORS.inkMuted }}>{t.body}</p>
          <p className="text-[11px] mt-2 font-mono" style={{ color: COLORS.goldDeep }}>— {t.author}</p>
        </div>
      </div>
    </div>
  );
}
function AddTipModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [product, setProduct] = useState(Object.keys(PRODUCTS)[0]);
  const [body, setBody] = useState("");
  const [video, setVideo] = useState(false);
  const submit = () => { if (!title || !body) return; onAdd({ id: "t" + Date.now(), author: "You", product, title, body, video }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Share a tip</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Product</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{Object.keys(PRODUCTS).map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to tell ripe plantain" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Tip</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Share what you know..." className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="flex items-center gap-2 text-xs mb-4" style={{ color: COLORS.inkMuted }}><input type="checkbox" checked={video} onChange={(e) => setVideo(e.target.checked)} /> This is a video tip</label>
        <button onClick={submit} className="w-full py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.gold, color: COLORS.ink }}>Post tip</button>
      </div>
    </div>
  );
}

/* ---------- investment (land) card ---------- */
function InvestmentCard({ inv, plot, onHarvest }) {
  const meta = investmentMeta(inv);
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5"><Sprout size={13} style={{ color: COLORS.goldDeep }} /><h3 className="font-semibold text-[15px]" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{inv.hectares}ha of {inv.crop}</h3></div>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.inkMuted }}><MapPin size={11} /> {plot?.name} · {regionName(inv.region)} · leased from {plot?.landowner}</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: COLORS.teal, color: "#fff" }}>Leased plot</span>
      </div>

      {inv.status === "growing" && (
        <div className="mt-3">
          <FieldBar percent={meta.percent} ready={meta.ready} />
          <p className="text-xs font-mono mt-1.5" style={{ color: COLORS.ink }}>{meta.daysGrown}/{meta.grow} days grown</p>
          <div className="mt-3 space-y-1">{CARE_LOG.map((c) => <p key={c} className="text-xs flex items-center gap-1.5" style={{ color: COLORS.inkMuted }}><CheckCircle2 size={12} style={{ color: COLORS.sage }} />{c}</p>)}</div>
          <p className="text-[11px] mt-2" style={{ color: COLORS.inkMuted }}>Managed entirely by the SiloLink field team — no action needed until harvest.</p>
        </div>
      )}
      {inv.status === "ready" && (
        <div className="mt-3">
          <FieldBar percent={100} ready={true} />
          <p className="text-xs font-semibold mt-2" style={{ color: COLORS.sage }}>Ready for harvest — est. {meta.totalYield.toLocaleString()} kg total</p>
          <button onClick={() => onHarvest(inv.id)} className="w-full mt-3 py-2 rounded-full text-xs font-semibold" style={{ background: COLORS.gold, color: COLORS.ink }}>Harvest & split produce</button>
        </div>
      )}
      {inv.status === "harvested" && (
        <div className="mt-3 pt-3 space-y-1.5 text-xs font-mono" style={{ borderTop: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>
          <p>Total harvest: <b>{meta.totalYield.toLocaleString()} kg</b></p>
          <p style={{ color: COLORS.inkMuted }}>10% company fee · {meta.company.toLocaleString()} kg</p>
          <p style={{ color: COLORS.sage }}>80% to you (the grower) · {meta.grower.toLocaleString()} kg</p>
          <p style={{ color: COLORS.inkMuted }}>5% to landowner ({plot?.landowner}) · {meta.landowner.toLocaleString()} kg</p>
          <p style={{ color: COLORS.inkMuted }}>5% to government & local farmers · {meta.community.toLocaleString()} kg</p>
          <p className="pt-1" style={{ color: COLORS.goldDeep, fontFamily: "Inter" }}>Your share was added to My Storage — decide what to do with it on the Dashboard.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- shipment card ---------- */
function ShipmentCard({ s }) {
  const done = s.progress >= 100;
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(28,38,32,0.08)", color: COLORS.inkMuted }}>{s.kind}</span>
          <h3 className="font-semibold text-[15px] mt-1.5" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{s.quantity.toLocaleString()} {s.unit} · {s.product}</h3>
          {s.recipient && <p className="text-xs mt-0.5" style={{ color: COLORS.goldDeep }}>To: {s.recipient}</p>}
        </div>
        <span className="text-[11px] font-semibold" style={{ color: done ? COLORS.sage : COLORS.ink }}>{done ? "Delivered" : `${s.progress}%`}</span>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs font-mono" style={{ color: COLORS.inkMuted }}>
        <MapPin size={12} /> {regionName(s.originRegion)} <ChevronRight size={12} /> {regionName(s.destRegion)}
      </div>
      <RouteTrack progress={s.progress} />
    </div>
  );
}

function FarmerRow({ f }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${COLORS.panelLine}` }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0" style={{ background: COLORS.gold, color: COLORS.ink }}>{f.letter}</div>
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate" style={{ color: COLORS.paper, fontFamily: "Fraunces, serif" }}>{f.name}</p><p className="text-xs truncate" style={{ color: COLORS.paperMuted }}>{f.farm} · {f.product}</p></div>
      <p className="text-[11px] shrink-0" style={{ color: COLORS.paperMuted }}>{regionName(f.region)}</p>
    </div>
  );
}

/* ---------- modals ---------- */
function AddBatchModal({ onClose, onAdd }) {
  const [product, setProduct] = useState("Yam Tubers");
  const [quantity, setQuantity] = useState("");
  const [storageType, setStorageType] = useState("Dry Storage");
  const [dateStored, setDateStored] = useState("2026-08-16");
  const submit = () => { if (!quantity || Number(quantity) <= 0) return; onAdd({ id: "b" + Date.now(), product, quantity: Number(quantity), storageType, dateStored, intent: null, processChoice: null, listed: false }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Log a new batch</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Product</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{Object.keys(PRODUCTS).map((p) => <option key={p} value={p}>{p} ({PRODUCTS[p].category})</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Quantity</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={`e.g. 500 (${PRODUCTS[product].unit})`} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Storage type</label>
        <select value={storageType} onChange={(e) => setStorageType(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{Object.keys(STORAGE_TYPES).map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Date stored</label>
        <input type="date" value={dateStored} onChange={(e) => setDateStored(e.target.value)} className="w-full mt-1 mb-5 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <button onClick={submit} className="w-full py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.gold, color: COLORS.ink }}>Add to storage</button>
      </div>
    </div>
  );
}
function AddCampaignModal({ myRegion, onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [product, setProduct] = useState("Vanilla Beans");
  const [originRegion, setOriginRegion] = useState("dar-tz");
  const [target, setTarget] = useState("");
  const submit = () => { if (!title || !target || Number(target) <= 0) return; onAdd({ id: "c" + Date.now(), title, product, originRegion, destRegion: myRegion, initiator: "You", target: Number(target), funded: 0, contributors: 0, note: "Buying in bulk with the group brings the per-unit cost down." }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Start a buying circle</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>What are you pooling funds for?</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bulk vanilla order from Tanzania" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Product</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{Object.keys(PRODUCTS).map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Source region</label>
        <select value={originRegion} onChange={(e) => setOriginRegion(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Target amount (USD)</label>
        <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 2000" className="w-full mt-1 mb-5 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <button onClick={submit} className="w-full py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.sky, color: "#fff" }}>Open the circle</button>
      </div>
    </div>
  );
}
function GrowModal({ landPlots, onClose, onAdd }) {
  const [plotId, setPlotId] = useState(landPlots[0].id);
  const [hectares, setHectares] = useState("");
  const [crop, setCrop] = useState(CROP_LIST[0]);
  const plot = landPlots.find((p) => p.id === plotId);
  const ha = Number(hectares) || 0;
  const submit = () => { if (!ha || ha <= 0 || ha > plot.hectares) return; onAdd({ id: "inv" + Date.now(), plotId, region: plot.region, hectares: ha, crop, datePlanted: "2026-08-16", status: "growing" }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Grow on leased land</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Plot</label>
        <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{landPlots.map((p) => <option key={p.id} value={p.id}>{p.name} — {regionName(p.region)} ({p.hectares}ha, {p.soil})</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Hectares (max {plot.hectares})</label>
        <input type="number" value={hectares} onChange={(e) => setHectares(e.target.value)} placeholder="e.g. 5" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Seed / crop to plant</label>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{CROP_LIST.map((c) => <option key={c} value={c}>{c} · matures in {GROW_DAYS[c]}d</option>)}</select>
        {ha > 0 && <p className="text-xs font-mono mb-3" style={{ color: COLORS.inkMuted }}>Est. yield: {(ha * YIELD_PER_HA[crop]).toLocaleString()} kg · management fee {fmtMoney(ha * plot.rentPerHaMonth)}/month.</p>}
        <p className="text-[11px] mb-4" style={{ color: COLORS.inkMuted }}>SiloLink's field team plants, waters, weeds, and harvests for you. At harvest: 80% to you, 10% to SiloLink, 5% to the landowner, 5% to government & local farmers.</p>
        <button onClick={submit} disabled={!ha || ha <= 0 || ha > plot.hectares} className="w-full py-3 rounded-full font-semibold text-sm disabled:opacity-40" style={{ background: COLORS.gold, color: COLORS.ink }}>Start growing</button>
      </div>
    </div>
  );
}
function ListLandModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("lagos-ng");
  const [hectares, setHectares] = useState("");
  const [soil, setSoil] = useState(SOIL_OPTIONS[0]);
  const [rent, setRent] = useState("");
  const submit = () => { if (!name || !hectares || Number(hectares) <= 0) return; onAdd({ id: "p" + Date.now(), region, name, hectares: Number(hectares), soil, landowner: "You", rentPerHaMonth: Number(rent) || 40 }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Lease your land to us</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Plot name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Behind the old market road" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Region</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{REGIONS.filter((r) => r.id !== "london-uk").map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Hectares available</label>
        <input type="number" value={hectares} onChange={(e) => setHectares(e.target.value)} placeholder="e.g. 8" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Soil quality</label>
        <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{SOIL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Suggested lease rate ($/ha/month, optional)</label>
        <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="e.g. 45" className="w-full mt-1 mb-4 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <p className="text-[11px] mb-4" style={{ color: COLORS.inkMuted }}>We lease land — we never buy it outright. Once growers start planting here, you earn 5% of every harvest as lease income, for as long as your land is in use.</p>
        <button onClick={submit} className="w-full py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.teal, color: "#fff" }}>Submit plot for leasing</button>
      </div>
    </div>
  );
}
function SendAbroadModal({ onClose, onAdd }) {
  const [product, setProduct] = useState("Cocoa Beans");
  const [quantity, setQuantity] = useState("");
  const [originRegion, setOriginRegion] = useState("london-uk");
  const [destRegion, setDestRegion] = useState("lagos-ng");
  const [recipient, setRecipient] = useState("");
  const qty = Number(quantity) || 0;
  const cost = qty * (PRICE_PER_UNIT[product] || 1) * (REGION_MULT[destRegion] || 1) + 25;
  const submit = () => { if (!qty || !recipient) return; onAdd({ id: "s" + Date.now(), kind: "Diaspora Send", product, quantity: qty, unit: PRODUCTS[product].unit, originRegion, destRegion, progress: 5, recipient }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(18,38,28,0.55)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>Send produce to family abroad</h2><button onClick={onClose}><X size={18} style={{ color: COLORS.inkMuted }} /></button></div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Product</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{Object.keys(PRODUCTS).map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Quantity ({PRODUCTS[product].unit})</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 20" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Sending from</label><select value={originRegion} onChange={(e) => setOriginRegion(e.target.value)} className="w-full mt-1 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
          <div><label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Delivering to</label><select value={destRegion} onChange={(e) => setDestRegion(e.target.value)} className="w-full mt-1 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Recipient's name</label>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Mama Uche" className="w-full mt-1 mb-3 p-2.5 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }} />
        {qty > 0 && <p className="text-xs font-mono mb-4" style={{ color: COLORS.inkMuted }}>Estimated cost incl. logistics: {fmtMoney(cost)}</p>}
        <button onClick={submit} disabled={!qty || !recipient} className="w-full py-3 rounded-full font-semibold text-sm disabled:opacity-40" style={{ background: COLORS.sky, color: "#fff" }}>Send & track delivery</button>
      </div>
    </div>
  );
}

/* ---------- auction + campaign cards ---------- */
function AuctionCard({ a, onBid, onClose, onFulfill }) {
  const category = PRODUCTS[a.product]?.category || "Livestock";
  const [process, setProcess] = useState(a.processChoice || "");
  const [dest, setDest] = useState(a.deliveryRegion || "");
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h3 className="font-semibold text-[15px]" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{a.quantity} {a.unit} · {a.product}</h3><p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.inkMuted }}><MapPin size={11} /> {regionName(a.region)} · seller {a.seller}</p></div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: a.status === "live" ? COLORS.teal : a.status === "fulfilled" ? COLORS.sage : COLORS.inkMuted, color: "#fff" }}>{a.status === "live" ? "Live bidding" : a.status === "fulfilled" ? "Fulfilled" : "Bidding closed"}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="font-mono text-sm" style={{ color: COLORS.ink }}>Leading bid: <b>{fmtMoney(a.leadBid)}</b> <span style={{ color: COLORS.inkMuted }}>by {a.leadBidder}</span></div>
        {a.status === "live" && <div className="flex gap-2"><button onClick={() => onBid(a.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: COLORS.gold, color: COLORS.ink }}><Gavel size={12} /> Bid {fmtMoney(Math.round(a.leadBid * 1.05))}</button><button onClick={() => onClose(a.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.inkMuted }}>End auction</button></div>}
      </div>
      {a.status === "closed" && (
        <div className="mt-4 pt-3 space-y-2" style={{ borderTop: `1px solid ${COLORS.cardLine}` }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>{a.leadBidder} won — how should it be prepared and delivered?</p>
          <div className="flex gap-2 flex-wrap">
            <select value={process} onChange={(e) => setProcess(e.target.value)} className="text-xs px-2.5 py-1.5 rounded-lg flex-1 min-w-[160px]" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}><option value="" disabled>Processing method</option>{PROCESS_OPTIONS[category].map((p) => <option key={p} value={p}>{p}</option>)}</select>
            <select value={dest} onChange={(e) => setDest(e.target.value)} className="text-xs px-2.5 py-1.5 rounded-lg flex-1 min-w-[160px]" style={{ border: `1px solid ${COLORS.cardLine}`, color: COLORS.ink }}><option value="" disabled>Deliver to region</option>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          </div>
          <button disabled={!process || !dest} onClick={() => onFulfill(a.id, process, dest)} className="w-full py-2 rounded-full text-xs font-semibold disabled:opacity-40" style={{ background: COLORS.ink, color: COLORS.paper }}>Confirm & dispatch</button>
        </div>
      )}
      {a.status === "fulfilled" && <div className="mt-4 pt-3 flex items-center gap-2 text-xs" style={{ borderTop: `1px solid ${COLORS.cardLine}`, color: COLORS.inkMuted }}><Truck size={13} style={{ color: COLORS.sage }} />{a.processChoice} · shipping to {regionName(a.deliveryRegion)}</div>}
    </div>
  );
}
function CampaignCard({ c, onContribute }) {
  const pct = clamp((c.funded / c.target) * 100, 0, 100);
  const funded = c.funded >= c.target;
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h3 className="font-semibold text-[15px]" style={{ color: COLORS.ink, fontFamily: "Fraunces, serif" }}>{c.title}</h3><p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.inkMuted }}><PiggyBank size={11} /> started by {c.initiator} · {regionName(c.originRegion)} → {regionName(c.destRegion)}</p></div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: funded ? COLORS.sage : COLORS.sky, color: "#fff" }}>{funded ? "Funded" : "Raising funds"}</span>
      </div>
      <div className="mt-3">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(28,38,32,0.08)" }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: funded ? COLORS.sage : COLORS.sky }} /></div>
        <div className="flex items-center justify-between mt-1.5 font-mono text-xs" style={{ color: COLORS.ink }}><span>{fmtMoney(c.funded)} of {fmtMoney(c.target)} raised</span><span style={{ color: COLORS.inkMuted }}>{c.contributors} contributors</span></div>
      </div>
      <p className="text-xs mt-2" style={{ color: COLORS.inkMuted }}>{c.note}</p>
      {!funded && <button onClick={() => onContribute(c.id)} className="mt-3 w-full py-2 rounded-full text-xs font-semibold" style={{ background: COLORS.sky, color: "#fff" }}>Contribute {fmtMoney(Math.round(c.target * 0.1))}</button>}
      {funded && <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: COLORS.inkMuted }}><Truck size={13} style={{ color: COLORS.sage }} /> Transport & logistics handled by SiloLink — delivering to {regionName(c.destRegion)}.</div>}
    </div>
  );
}

/* ---------- main app ---------- */
export default function SiloLink() {
  const [batches, setBatches] = useState(SEED_BATCHES);
  const [auctions, setAuctions] = useState(SEED_AUCTIONS);
  const [campaigns, setCampaigns] = useState(SEED_CAMPAIGNS);
  const [investments, setInvestments] = useState(SEED_INVESTMENTS);
  const [landPlots, setLandPlots] = useState(LAND_PLOTS_SEED);
  const [marketplace, setMarketplace] = useState(SEED_MARKETPLACE);
  const [shipments, setShipments] = useState(SEED_SHIPMENTS);
  const [tips, setTips] = useState(SEED_TIPS);
  const [myRegion, setMyRegion] = useState("lagos-ng");
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [marketSubTab, setMarketSubTab] = useState("listings");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showGrow, setShowGrow] = useState(false);
  const [showListLand, setShowListLand] = useState(false);
  const [showSendAbroad, setShowSendAbroad] = useState(false);
  const [showAddTip, setShowAddTip] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("app-state-v2", false);
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.batches) setBatches(s.batches);
          if (s.auctions) setAuctions(s.auctions);
          if (s.campaigns) setCampaigns(s.campaigns);
          if (s.investments) setInvestments(s.investments);
          if (s.landPlots) setLandPlots(s.landPlots);
          if (s.marketplace) setMarketplace(s.marketplace);
          if (s.shipments) setShipments(s.shipments);
          if (s.tips) setTips(s.tips);
          if (s.myRegion) setMyRegion(s.myRegion);
        }
      } catch (e) { /* no saved state yet */ } finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("app-state-v2", JSON.stringify({ batches, auctions, campaigns, investments, landPlots, marketplace, shipments, tips, myRegion }), false).catch(() => {});
  }, [batches, auctions, campaigns, investments, landPlots, marketplace, shipments, tips, myRegion, loaded]);

  useEffect(() => {
    setInvestments((prev) => prev.map((inv) => (inv.status === "growing" && investmentMeta(inv).ready ? { ...inv, status: "ready" } : inv)));
  }, [loaded]);

  const setIntent = (id, intent) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, intent } : b)));
    if (intent === "Send to Auction") {
      const b = batches.find((x) => x.id === id);
      if (b) setAuctions((prev) => [{ id: "a" + Date.now(), product: b.product, quantity: b.quantity, unit: PRODUCTS[b.product].unit, region: myRegion, seller: "You", leadBid: 0, leadBidder: "—", status: "live", processChoice: null, deliveryRegion: null }, ...prev]);
    }
  };
  const setProcessChoice = (id, choice) => setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, processChoice: choice } : b)));
  const listBatch = (id, price) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, listed: true } : b)));
    const b = batches.find((x) => x.id === id);
    if (b) setMarketplace((prev) => [{ id: "m" + Date.now(), product: b.product, quantity: b.quantity, unit: PRODUCTS[b.product].unit, price, region: myRegion, seller: "You", type: b.intent, status: "available", size: SIZE_LABELS[b.product] || null }, ...prev]);
  };
  const buyListing = (id) => {
    setMarketplace((prev) => prev.map((m) => (m.id === id ? { ...m, status: "sold", buyer: "You" } : m)));
    const m = marketplace.find((x) => x.id === id);
    if (m) setShipments((prev) => [{ id: "s" + Date.now(), kind: "Marketplace", product: m.product, quantity: m.quantity, unit: m.unit, originRegion: m.region, destRegion: myRegion, progress: 8, recipient: null }, ...prev]);
  };
  const placeBid = (id) => setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, leadBid: Math.max(50, Math.round(a.leadBid * 1.05)) || 50, leadBidder: "You" } : a)));
  const closeAuction = (id) => setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "closed" } : a)));
  const fulfillAuction = (id, process, dest) => {
    setAuctions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "fulfilled", processChoice: process, deliveryRegion: dest } : a)));
    const a = auctions.find((x) => x.id === id);
    if (a) setShipments((prev) => [{ id: "s" + Date.now(), kind: "Auction", product: a.product, quantity: a.quantity, unit: a.unit, originRegion: a.region, destRegion: dest, progress: 12, recipient: null }, ...prev]);
  };
  const contribute = (id) => setCampaigns((prev) => prev.map((c) => {
    if (c.id !== id) return c;
    const newFunded = Math.min(c.target, c.funded + Math.round(c.target * 0.1));
    if (c.funded < c.target && newFunded >= c.target) {
      setShipments((sp) => [{ id: "s" + Date.now(), kind: "Group Buying", product: c.product, quantity: Math.round(c.target / (PRICE_PER_UNIT[c.product] || 1)), unit: PRODUCTS[c.product]?.unit || "kg", originRegion: c.originRegion, destRegion: c.destRegion, progress: 8, recipient: null }, ...sp]);
    }
    return { ...c, funded: newFunded, contributors: c.contributors + 1 };
  }));
  const addCampaign = (c) => setCampaigns((prev) => [c, ...prev]);
  const addBatch = (b) => setBatches((prev) => [b, ...prev]);
  const addInvestment = (inv) => setInvestments((prev) => [inv, ...prev]);
  const addLandPlot = (p) => setLandPlots((prev) => [p, ...prev]);
  const addTip = (t) => setTips((prev) => [t, ...prev]);
  const addShipment = (s) => setShipments((prev) => [s, ...prev]);

  const harvest = (id) => {
    const inv = investments.find((x) => x.id === id);
    if (!inv) return;
    const meta = investmentMeta(inv);
    setInvestments((prev) => prev.map((x) => (x.id === id ? { ...x, status: "harvested" } : x)));
    setBatches((prev) => [{ id: "b" + Date.now(), product: inv.crop, quantity: meta.grower, storageType: "Dry Storage", dateStored: "2026-08-16", intent: null, processChoice: null, listed: false }, ...prev]);
  };

  const filtered = useMemo(() => batches.filter((b) => b.product.toLowerCase().includes(query.toLowerCase())), [batches, query]);
  const totals = useMemo(() => {
    const active = batches.filter((b) => !b.intent).length;
    const avgLife = Math.round(batches.reduce((s, b) => s + batchMeta(b).daysRemaining, 0) / (batches.length || 1));
    const liveAuctions = auctions.filter((a) => a.status === "live").length;
    const inTransit = shipments.filter((s) => s.progress < 100).length;
    return { active, avgLife, liveAuctions, inTransit };
  }, [batches, auctions, shipments]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}><Loader2 className="animate-spin" style={{ color: COLORS.gold }} /></div>;

  const NavItem = ({ icon: Icon, label, id }) => (
    <button onClick={() => setTab(id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ background: tab === id ? "rgba(217,164,65,0.14)" : "transparent", color: tab === id ? COLORS.gold : COLORS.paperMuted }}>
      <Icon size={17} /><span>{label}</span>
    </button>
  );
  const TITLES = { dashboard: "Your storage floor", marketplace: "Open marketplace", auctions: "Global livestock auctions", land: "Land & leasing", funding: "Community buying circles", logistics: "Logistics tracker", network: "Farmers around the world" };

  return (
    <div className="min-h-screen w-full" style={{ background: COLORS.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-5 p-4 sm:p-6">
        <aside className="lg:w-60 shrink-0">
          <div className="rounded-2xl p-4 lg:sticky lg:top-6" style={panelStyle}>
            <div className="flex items-center gap-2 mb-5 px-1"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.gold }}><Sprout size={16} style={{ color: COLORS.ink }} /></div><span className="font-semibold text-[15px]" style={{ color: COLORS.paper, fontFamily: "Fraunces, serif" }}>SiloLink</span></div>
            <nav className="space-y-1">
              <NavItem icon={LayoutGrid} label="Dashboard" id="dashboard" />
              <NavItem icon={Store} label="Marketplace" id="marketplace" />
              <NavItem icon={Gavel} label="Auctions" id="auctions" />
              <NavItem icon={Tractor} label="Land & Leasing" id="land" />
              <NavItem icon={PiggyBank} label="Group Buying" id="funding" />
              <NavItem icon={Truck} label="Logistics" id="logistics" />
              <NavItem icon={Users} label="Global Network" id="network" />
            </nav>
            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${COLORS.panelLine}` }}>
              <div className="flex items-center gap-3 px-1 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: COLORS.gold, color: COLORS.ink }}>Y</div>
                <div className="min-w-0"><p className="text-sm font-semibold truncate" style={{ color: COLORS.paper }}>@you_{myRegion.split("-")[0]}</p><p className="text-[11px] font-mono truncate" style={{ color: COLORS.paperMuted }}>{sellerCode("You")}</p></div>
              </div>
              <label className="text-[10px] font-semibold uppercase tracking-wide px-1" style={{ color: COLORS.paperMuted }}>Your region</label>
              <select value={myRegion} onChange={(e) => setMyRegion(e.target.value)} className="w-full mt-1 p-2 rounded-lg text-xs" style={{ background: COLORS.bg, color: COLORS.paper, border: `1px solid ${COLORS.panelLine}` }}>{REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-5">
          <div className="flex items-center gap-3 flex-wrap justify-between">
            <div><h1 className="text-xl font-semibold" style={{ color: COLORS.paper, fontFamily: "Fraunces, serif" }}>{TITLES[tab]}</h1><p className="text-xs mt-0.5" style={{ color: COLORS.paperMuted }}>Sunday, 16 August 2026</p></div>
            <div className="flex items-center gap-2">
              {tab === "dashboard" && <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-2" style={panelStyle}><Search size={14} style={{ color: COLORS.paperMuted }} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search produce..." className="bg-transparent outline-none text-xs w-32" style={{ color: COLORS.paper }} /></div>}
              <button style={panelStyle} className="w-9 h-9 rounded-full flex items-center justify-center"><Bell size={15} style={{ color: COLORS.paperMuted }} /></button>
              {tab === "dashboard" && <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.gold, color: COLORS.ink }}><Plus size={15} /> Log batch</button>}
              {tab === "funding" && <button onClick={() => setShowCampaign(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.sky, color: "#fff" }}><Plus size={15} /> Start circle</button>}
              {tab === "land" && <>
                <button onClick={() => setShowListLand(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.teal, color: "#fff" }}><Plus size={15} /> Lease your land</button>
                <button onClick={() => setShowGrow(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.gold, color: COLORS.ink }}><Sprout size={15} /> Grow here</button>
              </>}
              {tab === "logistics" && <button onClick={() => setShowSendAbroad(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.sky, color: "#fff" }}><Send size={15} /> Send abroad</button>}
              {tab === "marketplace" && marketSubTab === "tips" && <button onClick={() => setShowAddTip(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: COLORS.gold, color: COLORS.ink }}><Plus size={15} /> Share tip</button>}
            </div>
          </div>

          {tab === "dashboard" && (
            <>
              <div className="flex gap-3 flex-wrap">
                <StatCard icon={Package} label="Awaiting decision" value={totals.active} sub="batches with no plan yet" />
                <StatCard icon={Clock} label="Avg. shelf life left" value={`${totals.avgLife}d`} sub="across all produce" />
                <StatCard icon={Gavel} label="Live auctions" value={totals.liveAuctions} sub="open right now" />
                <StatCard icon={Truck} label="Shipments in transit" value={totals.inTransit} sub="track them under Logistics" />
              </div>
              <div className="rounded-2xl p-4" style={panelStyle}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: COLORS.paperMuted }}><Globe size={13} /> Regional silos worldwide</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {REGIONS.map((r) => (
                    <button key={r.id} onClick={() => setMyRegion(r.id)} className="shrink-0 rounded-xl px-3 py-2.5 text-left min-w-[130px]" style={{ background: r.id === myRegion ? "rgba(217,164,65,0.14)" : COLORS.bg, border: `1px solid ${r.id === myRegion ? COLORS.gold : COLORS.panelLine}` }}>
                      <p className="text-xs font-semibold" style={{ color: COLORS.paper }}>{r.name}</p><p className="text-[11px] font-mono mt-1" style={{ color: COLORS.paperMuted }}>{r.tonnes}t stored</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: COLORS.paperMuted }}>No produce matches "{query}".</p>}
                {filtered.map((b) => <BatchCard key={b.id} batch={b} onSetIntent={setIntent} onSetProcess={setProcessChoice} onList={listBatch} />)}
              </div>
            </>
          )}

          {tab === "marketplace" && (
            <div className="space-y-4">
              <div className="flex gap-2 rounded-full p-1 w-fit" style={panelStyle}>
                {[["listings", "Buy & Sell"], ["prices", "Market Prices"], ["tips", "Community Tips"]].map(([id, label]) => (
                  <button key={id} onClick={() => setMarketSubTab(id)} className="px-3.5 py-1.5 rounded-full text-xs font-semibold" style={{ background: marketSubTab === id ? COLORS.gold : "transparent", color: marketSubTab === id ? COLORS.ink : COLORS.paperMuted }}>{label}</button>
                ))}
              </div>
              {marketSubTab === "listings" && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: COLORS.paperMuted }}>Anyone — farmer or not — can buy, sell, or contact a seller directly. List a batch from your Dashboard once it's marked Sell Locally or Export.</p>
                  {marketplace.map((m) => <MarketplaceCard key={m.id} m={m} onBuy={buyListing} onContact={setChatTarget} />)}
                </div>
              )}
              {marketSubTab === "prices" && <MarketPrices marketplace={marketplace} />}
              {marketSubTab === "tips" && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: COLORS.paperMuted }}>Real-time advice from other users — which produce is good, which to avoid, what's easy to find right now.</p>
                  {tips.map((t) => <TipCard key={t.id} t={t} />)}
                </div>
              )}
            </div>
          )}

          {tab === "auctions" && <div className="space-y-3"><p className="text-xs -mt-1" style={{ color: COLORS.paperMuted }}>Livestock and fresh produce released for open bidding across all regions.</p>{auctions.map((a) => <AuctionCard key={a.id} a={a} onBid={placeBid} onClose={closeAuction} onFulfill={fulfillAuction} />)}</div>}

          {tab === "land" && (
            <div className="space-y-3">
              <p className="text-xs -mt-1" style={{ color: COLORS.paperMuted }}>We lease land, we never sell it. Owners lease their land to us; growers rent growing rights on it. Our field team plants, tends, and harvests — growers just decide what to do with their share.</p>
              {investments.map((inv) => <InvestmentCard key={inv.id} inv={inv} plot={landPlots.find((p) => p.id === inv.plotId)} onHarvest={harvest} />)}
            </div>
          )}

          {tab === "funding" && <div className="space-y-3"><p className="text-xs -mt-1" style={{ color: COLORS.paperMuted }}>Pool funds with other farmers to buy in bulk from another region — SiloLink handles transport once a circle is funded.</p>{campaigns.map((c) => <CampaignCard key={c.id} c={c} onContribute={contribute} />)}</div>}

          {tab === "logistics" && (
            <div className="space-y-3">
              <p className="text-xs -mt-1" style={{ color: COLORS.paperMuted }}>Track produce moving between regions — including sending goods abroad to family in the diaspora.</p>
              {shipments.map((s) => <ShipmentCard key={s.id} s={s} />)}
            </div>
          )}

          {tab === "network" && (
            <div className="rounded-2xl p-4 sm:p-5" style={panelStyle}>
              <p className="text-xs mb-1" style={{ color: COLORS.paperMuted }}>{REGION_FARMERS.length} farmers storing produce across {REGIONS.length - 1} regional silos</p>
              <div>{REGION_FARMERS.map((f) => <FarmerRow key={f.name} f={f} />)}</div>
            </div>
          )}
        </main>
      </div>

      {showAdd && <AddBatchModal onClose={() => setShowAdd(false)} onAdd={addBatch} />}
      {showCampaign && <AddCampaignModal myRegion={myRegion} onClose={() => setShowCampaign(false)} onAdd={addCampaign} />}
      {showGrow && <GrowModal landPlots={landPlots} onClose={() => setShowGrow(false)} onAdd={addInvestment} />}
      {showListLand && <ListLandModal onClose={() => setShowListLand(false)} onAdd={addLandPlot} />}
      {showSendAbroad && <SendAbroadModal onClose={() => setShowSendAbroad(false)} onAdd={addShipment} />}
      {showAddTip && <AddTipModal onClose={() => setShowAddTip(false)} onAdd={addTip} />}
      {chatTarget && <ChatModal person={chatTarget} onClose={() => setChatTarget(null)} />}
    </div>
  );
}
