// AuraHomeScreen.jsx
// Aura Beauty Directory — Adelaide
// Zero hardcoded data. All listings come from Airtable via useAirtable().
//
// BUGS FIXED IN THIS VERSION:
//  1. Category filter now uses case-insensitive trimmed comparison (was strict ===)
//  2. Search now includes category field (was missing)
//  3. Search results show inline — no longer hidden behind showSearch gate
//  4. Category cards correctly handle any case/whitespace from Airtable values
//  5. "Available today" filter now also matches "today" (case-insensitive)

import { useState, useMemo } from "react";
import {
  Scissors, Sparkles, Fingerprint, Palette, Search, MapPin, Star,
  Heart, CalendarDays, User, ArrowUpRight, Leaf, ChevronLeft, Clock,
  X, CheckCircle, Phone, Globe, BookOpen, ChevronRight, SlidersHorizontal,
  Bell, Settings, HelpCircle, Info, Check, Loader2, AlertCircle,
} from "lucide-react";
import { useAirtable } from "./src/useAirtable.js";

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  cream:"#FDFBF7", surface:"#F0EBE2", muted:"#EDE8DF",
  border:"#DDD6C8", divider:"#CBBFAE", text:"#3A3228",
  sub:"#9A8E7A", hint:"#B5A898", bronze:"#7D6E54", dark:"#6B6050", sage:"#8A9E8C",
};
const SERIF = "'Cormorant Garamond', Georgia, serif";

// Visual config per category. Keys are lowercase-trimmed for robust matching.
// Add new categories here as your Airtable grows.
const CAT_CFG = {
  "hair":               { Icon: Scissors,    bg: "#8A9E8C", border: "#798D7B" },
  "skin":               { Icon: Sparkles,    bg: "#A3B09A", border: "#92A08A" },
  "nails":              { Icon: Fingerprint, bg: "#7A9188", border: "#6A8178" },
  "makeup":             { Icon: Palette,     bg: "#B5916A", border: "#A07D56" },
  "brows & lashes":     { Icon: Sparkles,    bg: "#9E9A82", border: "#8C8870" },
  "massage & wellness": { Icon: Leaf,        bg: "#8A9E94", border: "#798D82" },
  "tanning":            { Icon: Sparkles,    bg: "#B5A06A", border: "#A38E56" },
  "waxing":             { Icon: Scissors,    bg: "#9E8A82", border: "#8C7870" },
};
const DEF_CFG = { Icon: Sparkles, bg: "#9A9A8A", border: "#888878" };

// FIX 1: Get category config using lowercase trimmed key
// This means "Makeup", "MAKEUP", "makeup ", " Makeup" all match correctly.
function getCatCfg(category) {
  return CAT_CFG[(category || "").toLowerCase().trim()] || DEF_CFG;
}

// Display order for category cards on the home screen
const CAT_ORDER = [
  "hair", "skin", "nails", "makeup",
  "brows & lashes", "massage & wellness", "tanning", "waxing",
];

const SORT_OPTS   = ["Recommended", "Top rated", "Name A–Z", "Price: Low–High"];
const PRICE_ORDER = { "$": 1, "$$": 2, "$$$": 3 };

// ─── Primitives ───────────────────────────────────────────────────
const Tag = ({ children }) => (
  <span className="text-[11px] rounded-full px-3 py-1 tracking-wide whitespace-nowrap"
    style={{ border: `1px solid ${C.divider}`, color: C.dark, background: "transparent" }}>
    {children}
  </span>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3"  y="3"  width="7" height="7" rx="1"/>
    <rect x="14" y="3"  width="7" height="7" rx="1"/>
    <rect x="3"  y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

// Business photo or a styled placeholder
function Avatar({ listing, size = 48 }) {
  if (listing.photo) {
    return (
      <img src={listing.photo} alt={listing.name}
        style={{ width: size, height: size, borderRadius: size * 0.3,
          objectFit: "cover", border: `1px solid ${C.divider}`, flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
      background: "#D4C9B8", border: `1px solid ${C.divider}`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Leaf size={size * 0.38} color={C.sub} strokeWidth={1.4} />
    </div>
  );
}

// ─── Layout chrome ────────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex justify-between items-center px-7 pt-4 pb-0 flex-shrink-0">
      <span className="text-[12px] font-medium tracking-wide" style={{ color: C.sub }}>9:41</span>
      <div className="flex items-center gap-1.5" style={{ color: C.sub }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <circle cx="12" cy="20" r="1" fill="currentColor"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="16" height="10" rx="2"/>
          <path d="M22 11v2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function NavBar({ activeNav, onNavTap }) {
  const items = [
    { id: "home",    Icon: GridIcon,     label: null      },
    { id: "saved",   Icon: Heart,        label: "Saved"   },
    { id: "book",    Icon: CalendarDays, label: "Book"    },
    { id: "profile", Icon: User,         label: "Profile" },
  ];
  return (
    <div className="flex justify-around items-center px-4 pt-3 pb-7 flex-shrink-0"
      style={{ borderTop: `1px solid ${C.border}`, background: C.cream }}>
      {items.map(({ id, Icon, label }) => {
        const on = activeNav === id;
        return (
          <button key={id} onClick={() => onNavTap(id)}
            className="flex flex-col items-center gap-1.5 min-w-[56px] bg-transparent border-none outline-none cursor-pointer">
            <span style={{ color: on ? C.text : "#C0B8AA" }}>
              <Icon size={20} strokeWidth={1.5} />
            </span>
            {id === "home"
              ? on
                ? <span className="w-1 h-1 rounded-full" style={{ background: C.text }} />
                : <span className="w-1 h-1" />
              : <span className="text-[9px] tracking-[0.16em] uppercase"
                  style={{ color: on ? C.text : "#B0A898" }}>{label}</span>
            }
          </button>
        );
      })}
    </div>
  );
}

function Sheet({ onClose, title, children }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(58,50,40,0.4)" }}>
      <div className="rounded-t-[28px] overflow-hidden"
        style={{ background: C.cream, maxHeight: "80%", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-[18px] font-normal" style={{ fontFamily: SERIF, color: C.text }}>{title}</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0">
            <X size={18} color={C.sub} strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto aura-scroll flex-1 px-6 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

function BookingToast({ business, onClose }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center z-50 pb-24 px-6"
      style={{ pointerEvents: "none" }}>
      <div className="w-full rounded-[20px] p-5 flex items-start gap-3"
        style={{ background: C.text, pointerEvents: "auto", boxShadow: "0 8px 32px rgba(58,50,40,0.3)" }}>
        <CheckCircle size={18} color="#8A9E8C" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-0.5"
            style={{ color: "rgba(253,251,247,0.5)" }}>Redirecting to booking site</p>
          <p className="text-[17px] font-normal leading-tight"
            style={{ fontFamily: SERIF, color: C.cream }}>{business.name}</p>
          <p className="text-[11px] mt-0.5 font-light"
            style={{ color: "rgba(253,251,247,0.5)" }}>{business.bookingUrl}</p>
        </div>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0 mt-0.5">
          <X size={15} color="rgba(253,251,247,0.45)" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
      <Loader2 size={28} color={C.sage} strokeWidth={1.5} className="animate-spin" />
      <p className="text-[14px] font-light" style={{ color: C.sub }}>Loading listings…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <AlertCircle size={28} color="#C87882" strokeWidth={1.5} />
      <p className="text-[16px] font-normal" style={{ fontFamily: SERIF, color: C.text }}>
        Couldn't load listings
      </p>
      <p className="text-[12px] font-light leading-relaxed" style={{ color: C.sub }}>{message}</p>
      <p className="text-[11px] mt-1" style={{ color: C.hint }}>
        Check Vercel environment variables and redeploy.
      </p>
    </div>
  );
}

// ─── Home screen ──────────────────────────────────────────────────
function CategoryCard({ label, count, Icon, bg, border, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const scale  = pressed ? "scale(0.95)" : hovered ? "scale(1.03)" : "scale(1)";
  const shadow = pressed ? "none" : hovered ? "0 8px 28px rgba(0,0,0,0.13)" : "0 4px 18px rgba(0,0,0,0.08)";
  return (
    <div className="relative rounded-[20px] p-5 flex flex-col justify-between cursor-pointer select-none"
      style={{ backgroundColor: bg, border: `1px solid ${border}`, minHeight: 160,
        transform: scale, boxShadow: shadow,
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1),box-shadow 0.18s ease" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(253,251,247,0.18)" }}>
        <Icon size={18} color="rgba(253,251,247,0.82)" strokeWidth={1.5} />
      </div>
      <div className="mt-8">
        <p className="text-[26px] font-light leading-tight"
          style={{ fontFamily: SERIF, color: "#FDFBF7" }}>{label}</p>
        <p className="text-[10px] tracking-[0.18em] uppercase mt-1"
          style={{ color: "rgba(253,251,247,0.6)" }}>{count} listings</p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.5}
        style={{ position: "absolute", bottom: 16, right: 16, color: "rgba(253,251,247,0.38)" }} />
    </div>
  );
}

function HomeScreen({ listings, loading, error, onNavigate, savedIds, onToggleSave }) {
  const [query,   setQuery]   = useState("");
  const [showLoc, setShowLoc] = useState(false);
  const [suburb,  setSuburb]  = useState("All suburbs");

  // FIX 1: Build category cards using lowercase trimmed key for matching
  const catStats = useMemo(() => {
    const counts = {};
    listings.forEach(l => {
      const key = (l.category || "").toLowerCase().trim();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, count]) => {
        const cfg = CAT_CFG[key] || DEF_CFG;
        // Display label: find the original casing from the first matching listing
        const original = listings.find(l => (l.category || "").toLowerCase().trim() === key)?.category || key;
        return { label: original, key, count, ...cfg };
      })
      .sort((a, b) => {
        const ai = CAT_ORDER.indexOf(a.key);
        const bi = CAT_ORDER.indexOf(b.key);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      });
  }, [listings]);

  const suburbs = useMemo(() => {
    const s = [...new Set(listings.map(l => l.suburb).filter(Boolean))].sort();
    return ["All suburbs", ...s];
  }, [listings]);

  const featuredListings = useMemo(
    () => listings.filter(l => l.featured).slice(0, 3),
    [listings]
  );

  // FIX 2 & 3: Search across name, tagline, category AND suburb.
  // No longer gated behind showSearch state — results show as you type.
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return listings.filter(l =>
      (l.name     || "").toLowerCase().includes(q) ||
      (l.tagline  || "").toLowerCase().includes(q) ||
      (l.category || "").toLowerCase().includes(q) ||
      (l.suburb   || "").toLowerCase().includes(q) ||
      (l.tags || []).some(t => (t || "").toLowerCase().includes(q))
    );
  }, [query, listings]);

  const isSearching = query.trim().length > 0;

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} />;

  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      {/* Header */}
      <div className="pt-6 pb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: C.sub }}>
          Your beauty directory
        </p>
        <h1 className="text-[52px] font-light leading-none tracking-tight"
          style={{ fontFamily: SERIF, color: C.text }}>Au<em>ra</em></h1>
        <p className="text-[13px] font-light mt-2 tracking-widest" style={{ color: C.sub }}>
          Discover · Book · Glow
        </p>
      </div>

      {/* Search bar — FIX: always shows results inline below, no showSearch gate */}
      <div className="mt-5 mb-2 relative">
        <div className="flex items-center gap-3 rounded-[14px] px-4 py-3.5"
          style={{ background: C.surface,
            border: `1px solid ${isSearching ? C.bronze : C.border}`,
            transition: "border-color 0.2s" }}>
          <Search size={15} color={isSearching ? C.bronze : C.hint} strokeWidth={1.5} />
          <input
            className="flex-1 text-[13px] font-light tracking-wide bg-transparent border-none outline-none"
            style={{ color: C.text, caretColor: C.bronze }}
            placeholder="Search salons, categories, suburbs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query
            ? <button onClick={() => setQuery("")}
                className="bg-transparent border-none cursor-pointer p-0">
                <X size={14} color={C.hint} strokeWidth={1.5} />
              </button>
            : <button onClick={() => setShowLoc(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border-none cursor-pointer hover:opacity-80"
                style={{ background: "#E0D8CC" }}>
                <MapPin size={11} color={C.bronze} strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase"
                  style={{ color: C.dark }}>
                  {suburb === "All suburbs" ? "Near me" : suburb}
                </span>
              </button>
          }
        </div>

        {/* FIX: Search results always shown when query present — no showSearch gate */}
        {isSearching && (
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-[16px] overflow-hidden z-40"
            style={{ background: C.cream, border: `1px solid ${C.border}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
            {searchResults.length === 0
              ? <div className="py-6 flex flex-col items-center gap-2">
                  <p className="text-[13px]" style={{ color: C.hint }}>
                    No results for "{query}"
                  </p>
                  <p className="text-[11px]" style={{ color: C.hint }}>
                    Try searching by name, category or suburb
                  </p>
                </div>
              : <>
                  <p className="text-[10px] tracking-[0.16em] uppercase px-4 pt-3 pb-1"
                    style={{ color: C.sub }}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.slice(0, 8).map(l => (
                    <div key={l.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderTop: `1px solid ${C.border}` }}
                      onClick={() => { onNavigate("detail", l.id); setQuery(""); }}>
                      <Avatar listing={l} size={38} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-normal"
                          style={{ fontFamily: SERIF, color: C.text }}>{l.name}</p>
                        <p className="text-[11px]" style={{ color: C.sub }}>
                          {l.category} · {l.suburb}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star size={10} color={C.bronze} strokeWidth={1.5} />
                        <span className="text-[12px] font-medium" style={{ color: C.text }}>
                          {l.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
            }
          </div>
        )}
      </div>

      {/* Main content — hidden while search is active */}
      {!isSearching && (
        <>
          {/* Category cards — built from live Airtable category values */}
          {catStats.length > 0 && (
            <>
              <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5 mt-5"
                style={{ color: C.sub }}>Browse by category</p>
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {catStats.map(cat => (
                  <CategoryCard key={cat.key} {...cat}
                    onClick={() => onNavigate("category", cat.label)} />
                ))}
              </div>
            </>
          )}

          {/* Featured — records with Featured checkbox ticked in Airtable */}
          {featuredListings.length > 0 && (
            <>
              <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5"
                style={{ color: C.sub }}>Featured this week</p>
              <div className="flex flex-col gap-3 pb-2">
                {featuredListings.map((biz, i) => (
                  <div key={biz.id}
                    onClick={() => onNavigate("detail", biz.id)}
                    className="rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: C.muted, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-3">
                      <Avatar listing={biz} size={56} />
                      <div className="flex-1 min-w-0">
                        {i === 0 && (
                          <span className="text-[9px] tracking-[0.18em] uppercase font-medium block mb-0.5"
                            style={{ color: C.sub }}>Editor's pick</span>
                        )}
                        <p className="text-[19px] font-normal leading-tight"
                          style={{ fontFamily: SERIF, color: C.text }}>{biz.name}</p>
                        <p className="text-[11px] font-light mt-0.5 tracking-wide"
                          style={{ color: C.sub }}>{biz.category} · {biz.suburb}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star size={11} color={C.sub} strokeWidth={1.5} />
                          <span className="text-[13px] font-medium" style={{ color: C.text }}>
                            {biz.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: C.sub }}>
                          {biz.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <div className="h-px my-3" style={{ background: C.divider }} />
                    <div className="flex flex-wrap gap-2">
                      {biz.tags.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {listings.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Leaf size={28} color={C.border} strokeWidth={1} />
              <p className="text-[14px]" style={{ color: C.hint }}>No listings yet.</p>
              <p className="text-[12px] text-center" style={{ color: C.hint }}>
                Add businesses in Airtable with the Active checkbox ticked.
              </p>
            </div>
          )}
        </>
      )}

      {/* Location sheet */}
      {showLoc && (
        <Sheet title="Choose location" onClose={() => setShowLoc(false)}>
          {suburbs.map(s => (
            <button key={s} onClick={() => { setSuburb(s); setShowLoc(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background: suburb === s ? C.muted : "transparent",
                border: `1px solid ${suburb === s ? C.border : "transparent"}`,
                marginBottom: 4 }}>
              <span className="text-[14px]" style={{ color: C.text }}>{s}</span>
              {suburb === s && <Check size={15} color={C.bronze} strokeWidth={2} />}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ─── Category screen ──────────────────────────────────────────────
function ServiceRow({ listing, onTap, onBook, savedIds, onToggleSave }) {
  const saved = savedIds.has(listing.id);
  return (
    <div className="rounded-[18px] p-4 cursor-pointer transition-all duration-150 hover:scale-[1.005] active:scale-[0.99]"
      style={{ background: C.muted, border: `1px solid ${C.border}` }}
      onClick={() => onTap(listing.id)}>
      <div className="flex items-start gap-3">
        <Avatar listing={listing} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-normal leading-tight"
                style={{ fontFamily: SERIF, color: C.text }}>{listing.name}</p>
              <p className="text-[11px] font-light mt-0.5 leading-snug"
                style={{ color: C.sub }}>{listing.tagline}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onToggleSave(listing.id); }}
              className="mt-0.5 bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
              <Heart size={15} strokeWidth={1.5}
                color={saved ? "#B5916A" : C.hint}
                fill={saved ? "#B5916A" : "none"} />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin size={10} color={C.sub} strokeWidth={1.5} />
              <span className="text-[11px]" style={{ color: C.sub }}>{listing.suburb}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={10} color={C.bronze} strokeWidth={1.5} />
              <span className="text-[12px] font-medium" style={{ color: C.text }}>
                {listing.rating.toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color: C.sub }}>({listing.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} color={C.sub} strokeWidth={1.5} />
              <span className="text-[11px]" style={{ color: C.sub }}>{listing.wait}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px my-3" style={{ background: C.divider }} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {listing.tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}
          <span className="text-[11px] rounded-full px-3 py-1"
            style={{ border: `1px solid ${C.divider}`, color: C.bronze }}>
            {listing.price}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onBook(listing); }}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium tracking-wide flex-shrink-0 hover:opacity-80 active:opacity-60"
          style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer" }}>
          Book <ArrowUpRight size={11} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function CategoryScreen({ catLabel, listings, onBack, onBook, onDetail, savedIds, onToggleSave }) {
  // FIX 4: Filter by category using case-insensitive trimmed comparison
  const items = useMemo(() =>
    listings.filter(l =>
      (l.category || "").toLowerCase().trim() === (catLabel || "").toLowerCase().trim()
    ),
    [listings, catLabel]
  );

  const cfg = getCatCfg(catLabel);

  const [filter,   setFilter]   = useState("All");
  const [query,    setQuery]    = useState("");
  const [sort,     setSort]     = useState("Recommended");
  const [showSort, setShowSort] = useState(false);
  const [suburb,   setSuburb]   = useState("All suburbs");
  const [showSub,  setShowSub]  = useState(false);

  const suburbs = useMemo(() => {
    const s = [...new Set(items.map(l => l.suburb).filter(Boolean))].sort();
    return ["All suburbs", ...s];
  }, [items]);

  const filtered = useMemo(() => {
    let r = items.filter(l => {
      // FIX 5: "Available today" is case-insensitive
      const mf = filter === "Top rated"
        ? l.rating >= 4.8
        : filter === "Available today"
          ? (l.wait || "").toLowerCase() === "today"
          : true;

      // FIX: search inside category screen includes tagline + category
      const q = query.trim().toLowerCase();
      const mq = !q
        || (l.name    || "").toLowerCase().includes(q)
        || (l.suburb  || "").toLowerCase().includes(q)
        || (l.tagline || "").toLowerCase().includes(q)
        || (l.tags || []).some(t => (t || "").toLowerCase().includes(q));

      const ms = suburb === "All suburbs" || l.suburb === suburb;
      return mf && mq && ms;
    });

    if (sort === "Top rated")
      r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sort === "Name A–Z")
      r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "Price: Low–High")
      r = [...r].sort((a, b) => (PRICE_ORDER[a.price] || 2) - (PRICE_ORDER[b.price] || 2));

    return r;
  }, [items, filter, query, sort, suburb]);

  const FILTERS = ["All", "Top rated", "Available today"];

  return (
    <div className="flex-1 overflow-y-auto aura-scroll pb-4 relative">
      {/* Coloured hero */}
      <div className="px-6 pt-5 pb-7" style={{ background: cfg.bg }}>
        <button onClick={onBack}
          className="flex items-center gap-1 mb-5 bg-transparent border-none cursor-pointer p-0"
          style={{ color: "rgba(253,251,247,0.8)" }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-[12px] tracking-[0.1em] uppercase">Back</span>
        </button>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "rgba(253,251,247,0.6)" }}>Category</p>
            <h2 className="text-[46px] font-light leading-none"
              style={{ fontFamily: SERIF, color: "#FDFBF7" }}>{catLabel}</h2>
            <p className="text-[12px] mt-1.5" style={{ color: "rgba(253,251,247,0.65)" }}>
              {items.length} listing{items.length !== 1 ? "s" : ""} in Adelaide
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "rgba(253,251,247,0.18)" }}>
            <cfg.Icon size={22} color="rgba(253,251,247,0.85)" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-6 pt-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="rounded-full px-4 py-1.5 text-[11px] tracking-wide whitespace-nowrap"
            style={{ border: `1px solid ${filter === f ? C.text : C.border}`,
              background: filter === f ? C.text : "transparent",
              color: filter === f ? C.cream : C.dark, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Search + suburb button */}
      <div className="mx-6 mb-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 rounded-[14px] px-4 py-3"
          style={{ background: C.surface,
            border: `1px solid ${query ? C.bronze : C.border}`,
            transition: "border-color 0.2s" }}>
          <Search size={14} color={query ? C.bronze : C.hint} strokeWidth={1.5} />
          <input
            className="flex-1 text-[13px] font-light bg-transparent border-none outline-none"
            style={{ color: C.text, caretColor: C.bronze }}
            placeholder={`Search ${(catLabel || "").toLowerCase()}…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")}
              className="bg-transparent border-none cursor-pointer p-0">
              <X size={13} color={C.hint} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <button onClick={() => setShowSub(true)}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center border-none cursor-pointer hover:opacity-80"
          style={{ background: suburb !== "All suburbs" ? C.text : C.surface,
            border: `1px solid ${C.border}`, flexShrink: 0 }}>
          <MapPin size={15}
            color={suburb !== "All suburbs" ? C.cream : C.sub}
            strokeWidth={1.5} />
        </button>
      </div>

      {/* Result count + sort */}
      <div className="px-6 mb-3 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.sub }}>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </p>
        <button onClick={() => setShowSort(true)}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 hover:opacity-70">
          <SlidersHorizontal size={12} color={C.bronze} strokeWidth={1.5} />
          <span className="text-[11px]" style={{ color: C.bronze }}>Sort: {sort}</span>
          <ChevronRight size={11} color={C.bronze} strokeWidth={1.5} />
        </button>
      </div>

      {/* Listings */}
      <div className="flex flex-col gap-3 px-6 pb-2">
        {filtered.length > 0
          ? filtered.map(l => (
              <ServiceRow key={l.id} listing={l} onTap={onDetail} onBook={onBook}
                savedIds={savedIds} onToggleSave={onToggleSave} />
            ))
          : <div className="text-center py-10">
              <p className="text-[13px]" style={{ color: C.hint }}>No results.</p>
              <p className="text-[11px] mt-1" style={{ color: C.hint }}>
                Try clearing your filters.
              </p>
            </div>
        }
      </div>

      {showSort && (
        <Sheet title="Sort by" onClose={() => setShowSort(false)}>
          {SORT_OPTS.map(o => (
            <button key={o} onClick={() => { setSort(o); setShowSort(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background: sort === o ? C.muted : "transparent",
                border: `1px solid ${sort === o ? C.border : "transparent"}`,
                marginBottom: 4 }}>
              <span className="text-[14px]" style={{ color: C.text }}>{o}</span>
              {sort === o && <Check size={15} color={C.bronze} strokeWidth={2} />}
            </button>
          ))}
        </Sheet>
      )}

      {showSub && (
        <Sheet title="Filter by suburb" onClose={() => setShowSub(false)}>
          {suburbs.map(s => (
            <button key={s} onClick={() => { setSuburb(s); setShowSub(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background: suburb === s ? C.muted : "transparent",
                border: `1px solid ${suburb === s ? C.border : "transparent"}`,
                marginBottom: 4 }}>
              <span className="text-[14px]" style={{ color: C.text }}>{s}</span>
              {suburb === s && <Check size={15} color={C.bronze} strokeWidth={2} />}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ─── Detail screen ────────────────────────────────────────────────
function DetailScreen({ listingId, listings, onBack, onBook, savedIds, onToggleSave }) {
  const l = listings.find(x => x.id === listingId);
  if (!l) return null;
  const cfg   = getCatCfg(l.category);
  const saved = savedIds.has(l.id);

  return (
    <div className="flex-1 overflow-y-auto aura-scroll pb-4">
      <div className="px-6 pt-5 pb-8" style={{ background: cfg.bg }}>
        <button onClick={onBack}
          className="flex items-center gap-1 mb-5 bg-transparent border-none cursor-pointer p-0"
          style={{ color: "rgba(253,251,247,0.8)" }}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="text-[12px] tracking-[0.1em] uppercase">Back</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-[34px] font-light leading-tight"
              style={{ fontFamily: SERIF, color: "#FDFBF7" }}>{l.name}</h2>
            <p className="text-[13px] font-light mt-1"
              style={{ color: "rgba(253,251,247,0.7)" }}>{l.tagline}</p>
            <div className="flex items-center gap-2 mt-3">
              <Star size={12} color="rgba(253,251,247,0.9)" strokeWidth={1.5}
                fill="rgba(253,251,247,0.4)" />
              <span className="text-[13px] font-medium" style={{ color: "#FDFBF7" }}>
                {l.rating.toFixed(1)}
              </span>
              <span className="text-[12px]" style={{ color: "rgba(253,251,247,0.6)" }}>
                ({l.reviews} reviews)
              </span>
            </div>
          </div>
          <button onClick={() => onToggleSave(l.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer"
            style={{ background: "rgba(253,251,247,0.18)" }}>
            <Heart size={17} strokeWidth={1.5} color="#FDFBF7"
              fill={saved ? "#FDFBF7" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-6">
        <div className="flex gap-3 py-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { Icon: MapPin,   text: l.suburb },
            { Icon: Clock,    text: `Next: ${l.wait}` },
            { Icon: BookOpen, text: l.price },
          ].map(({ Icon, text }) => (
            <div key={text}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
              style={{ background: C.muted, border: `1px solid ${C.border}` }}>
              <Icon size={12} color={C.bronze} strokeWidth={1.5} />
              <span className="text-[11px]" style={{ color: C.dark }}>{text}</span>
            </div>
          ))}
        </div>

        {l.about && (
          <>
            <div className="h-px" style={{ background: C.divider }} />
            <div className="py-5">
              <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: C.sub }}>
                About
              </p>
              <p className="text-[14px] font-light leading-relaxed" style={{ color: C.text }}>
                {l.about}
              </p>
            </div>
          </>
        )}

        {l.tags.length > 0 && (
          <>
            <div className="h-px" style={{ background: C.divider }} />
            <div className="py-5">
              <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: C.sub }}>
                Specialities
              </p>
              <div className="flex flex-wrap gap-2">
                {l.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </>
        )}

        <div className="h-px" style={{ background: C.divider }} />
        <div className="py-5">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: C.sub }}>
            Contact
          </p>
          <div className="flex flex-col gap-3">
            {l.phone && (
              <button onClick={() => window.open(`tel:${l.phone}`)}
                className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer p-0 hover:opacity-70">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.muted }}>
                  <Phone size={14} color={C.bronze} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] flex-1" style={{ color: C.text }}>{l.phone}</span>
                <ChevronRight size={14} color={C.hint} strokeWidth={1.5} />
              </button>
            )}
            {l.bookingUrl && l.bookingUrl !== "#" && (
              <button onClick={() => window.open(l.bookingUrl, "_blank")}
                className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer p-0 hover:opacity-70">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.muted }}>
                  <Globe size={14} color={C.bronze} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] truncate flex-1" style={{ color: C.text }}>
                  {l.bookingUrl.replace("https://", "").replace("www.", "")}
                </span>
                <ChevronRight size={14} color={C.hint} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        <button onClick={() => onBook(l)}
          className="w-full rounded-[16px] py-4 text-[14px] font-medium flex items-center justify-center gap-2 hover:opacity-85 active:opacity-70 mb-2"
          style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer",
            letterSpacing: "0.14em" }}>
          Book an appointment <ArrowUpRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Saved screen ─────────────────────────────────────────────────
function SavedScreen({ listings, savedIds, onDetail, onToggleSave, onNavigate }) {
  const saved = listings.filter(l => savedIds.has(l.id));
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: C.sub }}>
          Your collection
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily: SERIF, color: C.text }}>Saved</h2>
      </div>
      {saved.length === 0
        ? <div className="flex flex-col items-center py-14 gap-3">
            <Heart size={32} color={C.border} strokeWidth={1} />
            <p className="text-[14px]" style={{ color: C.hint }}>No saved businesses yet.</p>
            <button onClick={() => onNavigate("home")}
              className="mt-2 rounded-full px-5 py-2 text-[12px] hover:opacity-80"
              style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer" }}>
              Browse categories
            </button>
          </div>
        : <div className="flex flex-col gap-3">
            {saved.map(l => (
              <div key={l.id}
                className="rounded-[18px] p-4 cursor-pointer hover:scale-[1.005] transition-all"
                style={{ background: C.muted, border: `1px solid ${C.border}` }}
                onClick={() => onDetail(l.id)}>
                <div className="flex items-center gap-3">
                  <Avatar listing={l} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-normal"
                      style={{ fontFamily: SERIF, color: C.text }}>{l.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>
                      {l.suburb} · {l.category}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onToggleSave(l.id); }}
                    className="bg-transparent border-none cursor-pointer p-0">
                    <Heart size={15} strokeWidth={1.5} color="#B5916A" fill="#B5916A" />
                  </button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Bookings screen ──────────────────────────────────────────────
function BookScreen({ onNavigate }) {
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: C.sub }}>
          Your schedule
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily: SERIF, color: C.text }}>Bookings</h2>
      </div>
      <div className="flex flex-col items-center py-12 gap-3">
        <CalendarDays size={32} color={C.border} strokeWidth={1} />
        <p className="text-[14px]" style={{ color: C.hint }}>No upcoming bookings.</p>
        <button onClick={() => onNavigate("home")}
          className="mt-3 rounded-full px-5 py-2.5 text-[12px] hover:opacity-80"
          style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer" }}>
          Browse services
        </button>
      </div>
    </div>
  );
}

// ─── Profile screen ───────────────────────────────────────────────
function ProfileScreen({ savedCount }) {
  const [sheet,  setSheet]  = useState(null);
  const [notifs, setNotifs] = useState({ bookings: true, offers: false, reminders: true });
  const menu = [
    { id: "prefs",  Icon: Settings,   label: "Preferences"    },
    { id: "notifs", Icon: Bell,       label: "Notifications"  },
    { id: "help",   Icon: HelpCircle, label: "Help & support" },
    { id: "about",  Icon: Info,       label: "About Aura"     },
  ];
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: C.sub }}>
          Your account
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily: SERIF, color: C.text }}>Profile</h2>
      </div>
      <div className="flex flex-col items-center py-5 gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: C.muted, border: `1px solid ${C.border}` }}>
          <User size={32} color={C.sub} strokeWidth={1} />
        </div>
        <div className="text-center">
          <p className="text-[22px] font-light" style={{ fontFamily: SERIF, color: C.text }}>
            Guest User
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: C.sub }}>Adelaide, SA</p>
        </div>
        <button onClick={() => setSheet("signin")}
          className="rounded-full px-5 py-2 text-[12px] tracking-wide hover:opacity-80"
          style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer" }}>
          Sign in or create account
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: "Saved", value: savedCount }, { label: "Booked", value: "0" }, { label: "Reviews", value: "0" }]
          .map(s => (
            <div key={s.label} className="rounded-[14px] p-3 text-center"
              style={{ background: C.muted, border: `1px solid ${C.border}` }}>
              <p className="text-[22px] font-light" style={{ fontFamily: SERIF, color: C.text }}>
                {s.value}
              </p>
              <p className="text-[10px] tracking-[0.14em] uppercase mt-0.5" style={{ color: C.sub }}>
                {s.label}
              </p>
            </div>
          ))
        }
      </div>

      {menu.map(item => (
        <button key={item.id} onClick={() => setSheet(item.id)}
          className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70"
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <item.Icon size={16} color={C.sub} strokeWidth={1.5} />
            <span className="text-[14px]" style={{ color: C.text }}>{item.label}</span>
          </div>
          <ChevronRight size={15} color={C.hint} strokeWidth={1.5} />
        </button>
      ))}

      {sheet === "signin" && (
        <Sheet title="Sign in to Aura" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-4 pt-2">
            {["Email address", "Password"].map(p => (
              <div key={p}>
                <p className="text-[10px] tracking-[0.16em] uppercase mb-2" style={{ color: C.sub }}>{p}</p>
                <input type={p === "Password" ? "password" : "email"}
                  className="w-full rounded-[12px] px-4 py-3 text-[14px] bg-transparent border-none outline-none"
                  style={{ background: C.muted, border: `1px solid ${C.border}`, color: C.text }}
                  placeholder={p === "Password" ? "••••••••" : "you@example.com"} />
              </div>
            ))}
            <button onClick={() => setSheet(null)}
              className="w-full rounded-[14px] py-3.5 text-[13px] font-medium mt-1 hover:opacity-85"
              style={{ background: C.text, color: C.cream, border: "none", cursor: "pointer" }}>
              Sign in
            </button>
          </div>
        </Sheet>
      )}
      {sheet === "notifs" && (
        <Sheet title="Notifications" onClose={() => setSheet(null)}>
          {[
            { key: "bookings",  label: "Booking reminders", sub: "Remind me before appointments" },
            { key: "offers",    label: "Special offers",    sub: "Deals from saved businesses"   },
            { key: "reminders", label: "Review requests",   sub: "After your appointment"        },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-4"
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p className="text-[14px]" style={{ color: C.text }}>{n.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>{n.sub}</p>
              </div>
              <button
                onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                className="w-10 h-6 rounded-full flex items-center px-0.5 border-none cursor-pointer"
                style={{ background: notifs[n.key] ? C.sage : C.muted,
                  justifyContent: notifs[n.key] ? "flex-end" : "flex-start" }}>
                <div className="w-5 h-5 rounded-full"
                  style={{ background: notifs[n.key] ? "#FDFBF7" : C.hint }} />
              </button>
            </div>
          ))}
        </Sheet>
      )}
      {sheet === "prefs" && (
        <Sheet title="Preferences" onClose={() => setSheet(null)}>
          <p className="text-[13px]" style={{ color: C.sub }}>Preference settings coming soon.</p>
        </Sheet>
      )}
      {sheet === "help" && (
        <Sheet title="Help & support" onClose={() => setSheet(null)}>
          {["How do I book?", "How do I save a business?", "Contact support"].map(q => (
            <button key={q}
              className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70"
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <span className="text-[13px]" style={{ color: C.text }}>{q}</span>
              <ChevronRight size={14} color={C.hint} strokeWidth={1.5} />
            </button>
          ))}
        </Sheet>
      )}
      {sheet === "about" && (
        <Sheet title="About Aura" onClose={() => setSheet(null)}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-[32px] font-light" style={{ fontFamily: SERIF, color: C.text }}>Aura</p>
            <p className="text-[12px]" style={{ color: C.sub }}>Version 1.0.0 · Adelaide, SA</p>
            <p className="text-[13px] font-light leading-relaxed mt-2" style={{ color: C.text }}>
              Adelaide's premium beauty directory.
            </p>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────
export default function AuraApp() {
  // Single source of truth — ALL data from Airtable, zero fallback mock data
  const { listings, loading, error } = useAirtable();

  const [screen,     setScreen]     = useState("home");
  const [catLabel,   setCatLabel]   = useState(null);
  const [detailId,   setDetailId]   = useState(null);
  const [activeNav,  setActiveNav]  = useState("home");
  const [bookingBiz, setBookingBiz] = useState(null);
  const [savedIds,   setSavedIds]   = useState(new Set());

  function navigate(to, id = null) {
    setScreen(to);
    if (to === "category") { setCatLabel(id); setDetailId(null); }
    if (to === "detail")   { setDetailId(id); }
    if (to === "home")     { setCatLabel(null); setDetailId(null); setActiveNav("home"); }
  }

  function goBack() {
    if (screen === "detail" && catLabel) { setScreen("category"); setDetailId(null); }
    else navigate("home");
  }

  function handleBook(listing) {
    setBookingBiz(listing);
    setTimeout(() => setBookingBiz(null), 4000);
  }

  function toggleSave(id) {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleNavTap(id) {
    setActiveNav(id);
    setBookingBiz(null);
    if (id === "home") { navigate("home"); return; }
    setScreen(id === "book" ? "booking" : id);
    setCatLabel(null);
    setDetailId(null);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .aura-scroll::-webkit-scrollbar { display: none; }
        .aura-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="flex items-center justify-center min-h-screen w-full py-8"
        style={{ background: "#E8E2D8" }}>
        <div className="relative flex flex-col rounded-[44px] overflow-hidden"
          style={{ width: 390, maxHeight: 844, background: C.cream,
            border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.14)" }}>

          <StatusBar />

          {screen === "home" && (
            <HomeScreen listings={listings} loading={loading} error={error}
              onNavigate={navigate} savedIds={savedIds} onToggleSave={toggleSave} />
          )}
          {screen === "category" && catLabel && (
            <CategoryScreen catLabel={catLabel} listings={listings}
              onBack={() => navigate("home")} onBook={handleBook}
              onDetail={id => { setCatLabel(catLabel); navigate("detail", id); }}
              savedIds={savedIds} onToggleSave={toggleSave} />
          )}
          {screen === "detail" && detailId && (
            <DetailScreen listingId={detailId} listings={listings}
              onBack={goBack} onBook={handleBook}
              savedIds={savedIds} onToggleSave={toggleSave} />
          )}
          {screen === "saved" && (
            <SavedScreen listings={listings} savedIds={savedIds}
              onDetail={id => navigate("detail", id)}
              onToggleSave={toggleSave} onNavigate={navigate} />
          )}
          {screen === "booking" && <BookScreen onNavigate={navigate} />}
          {screen === "profile"  && <ProfileScreen savedCount={savedIds.size} />}

          <NavBar activeNav={activeNav} onNavTap={handleNavTap} />
          {bookingBiz && (
            <BookingToast business={bookingBiz} onClose={() => setBookingBiz(null)} />
          )}
        </div>
      </div>
    </>
  );
}
