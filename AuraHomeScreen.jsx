// AuraHomeScreen.jsx — Aura Beauty Directory (Adelaide)
// Data: Airtable via useAirtable() — zero hardcoded listings.
// Detail page upgraded: hero gallery, opening hours, Maps, Instagram, sticky CTA.

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Scissors, Sparkles, Fingerprint, Palette, Search, MapPin, Star,
  Heart, CalendarDays, User, ArrowUpRight, Leaf, ChevronLeft, Clock,
  X, CheckCircle, Phone, Globe, BookOpen, ChevronRight, SlidersHorizontal,
  Bell, Settings, HelpCircle, Info, Check, Loader2, AlertCircle,
  Instagram, Facebook,
} from "lucide-react";
import { useAirtable } from "./src/useAirtable.js";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cream:   "#FDFBF7",
  surface: "#F0EBE2",
  muted:   "#EDE8DF",
  border:  "#DDD6C8",
  divider: "#CBBFAE",
  text:    "#3A3228",
  sub:     "#9A8E7A",
  hint:    "#B5A898",
  bronze:  "#7D6E54",
  dark:    "#6B6050",
  sage:    "#8A9E8C",
};
const SERIF = "'Cormorant Garamond', Georgia, serif";

// Category visual config — keys are lowercase-trimmed for robust matching
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
const DEF_CFG  = { Icon: Sparkles, bg: "#9A9A8A", border: "#888878" };
const CAT_ORDER = [
  "hair","skin","nails","makeup",
  "brows & lashes","massage & wellness","tanning","waxing",
];
const SORT_OPTS   = ["Recommended","Top rated","Name A–Z","Price: Low–High"];
const PRICE_ORDER = { "$":1, "$$":2, "$$$":3 };

function getCatCfg(cat) {
  return CAT_CFG[(cat || "").toLowerCase().trim()] || DEF_CFG;
}

// ─── Shared primitives ─────────────────────────────────────────────────────────
const Tag = ({ children }) => (
  <span className="text-[11px] rounded-full px-3 py-1.5 tracking-wide whitespace-nowrap"
    style={{ border:`1px solid ${C.divider}`, color:C.dark, background:"transparent" }}>
    {children}
  </span>
);

// Section divider + label reused throughout detail page
const SectionLabel = ({ children }) => (
  <>
    <div className="h-px" style={{ background: C.divider }} />
    <p className="text-[10px] tracking-[0.22em] uppercase pt-5 pb-3" style={{ color: C.sub }}>
      {children}
    </p>
  </>
);

// Contact row — icon + label + chevron
const ContactRow = ({ icon: Icon, label, sublabel, onPress }) => (
  <button onClick={onPress}
    className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity">
    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
      style={{ background: C.muted, border:`1px solid ${C.border}` }}>
      <Icon size={15} color={C.bronze} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px]" style={{ color: C.text }}>{label}</p>
      {sublabel && <p className="text-[11px] mt-0.5" style={{ color: C.sub }}>{sublabel}</p>}
    </div>
    <ChevronRight size={14} color={C.hint} strokeWidth={1.5} />
  </button>
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

// Business photo or styled placeholder
function Avatar({ listing, size = 48 }) {
  if (listing.photo) {
    return (
      <img src={listing.photo} alt={listing.name}
        style={{ width:size, height:size, borderRadius:size * 0.3,
          objectFit:"cover", border:`1px solid ${C.divider}`, flexShrink:0 }} />
    );
  }
  return (
    <div style={{ width:size, height:size, borderRadius:size * 0.3, flexShrink:0,
      background:"#D4C9B8", border:`1px solid ${C.divider}`,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Leaf size={size * 0.38} color={C.sub} strokeWidth={1.4} />
    </div>
  );
}

// ─── Layout chrome ─────────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="flex justify-between items-center px-7 pt-4 pb-0 flex-shrink-0">
      <span className="text-[12px] font-medium tracking-wide" style={{ color:C.sub }}>9:41</span>
      <div className="flex items-center gap-1.5" style={{ color:C.sub }}>
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
    { id:"home",    Icon:GridIcon,     label:null      },
    { id:"saved",   Icon:Heart,        label:"Saved"   },
    { id:"book",    Icon:CalendarDays, label:"Book"    },
    { id:"profile", Icon:User,         label:"Profile" },
  ];
  return (
    <div className="flex justify-around items-center px-4 pt-3 pb-7 flex-shrink-0"
      style={{ borderTop:`1px solid ${C.border}`, background:C.cream }}>
      {items.map(({ id, Icon, label }) => {
        const on = activeNav === id;
        return (
          <button key={id} onClick={() => onNavTap(id)}
            className="flex flex-col items-center gap-1.5 min-w-[56px] bg-transparent border-none outline-none cursor-pointer">
            <span style={{ color:on ? C.text : "#C0B8AA" }}>
              <Icon size={20} strokeWidth={1.5} />
            </span>
            {id === "home"
              ? on ? <span className="w-1 h-1 rounded-full" style={{ background:C.text }}/> : <span className="w-1 h-1"/>
              : <span className="text-[9px] tracking-[0.16em] uppercase" style={{ color:on ? C.text : "#B0A898" }}>{label}</span>
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
      style={{ background:"rgba(58,50,40,0.4)" }}>
      <div className="rounded-t-[28px] overflow-hidden"
        style={{ background:C.cream, maxHeight:"80%", display:"flex", flexDirection:"column" }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom:`1px solid ${C.border}` }}>
          <p className="text-[18px] font-normal" style={{ fontFamily:SERIF, color:C.text }}>{title}</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0">
            <X size={18} color={C.sub} strokeWidth={1.5}/>
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
      style={{ pointerEvents:"none" }}>
      <div className="w-full rounded-[20px] p-5 flex items-start gap-3"
        style={{ background:C.text, pointerEvents:"auto", boxShadow:"0 8px 32px rgba(58,50,40,0.3)" }}>
        <CheckCircle size={18} color="#8A9E8C" strokeWidth={1.5} style={{ flexShrink:0, marginTop:2 }}/>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-0.5"
            style={{ color:"rgba(253,251,247,0.5)" }}>Redirecting to booking site</p>
          <p className="text-[17px] font-normal leading-tight"
            style={{ fontFamily:SERIF, color:C.cream }}>{business.name}</p>
          <p className="text-[11px] mt-0.5 font-light"
            style={{ color:"rgba(253,251,247,0.5)" }}>{business.bookingUrl}</p>
        </div>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0 mt-0.5">
          <X size={15} color="rgba(253,251,247,0.45)" strokeWidth={1.5}/>
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
      <Loader2 size={28} color={C.sage} strokeWidth={1.5} className="animate-spin"/>
      <p className="text-[14px] font-light" style={{ color:C.sub }}>Loading listings…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <AlertCircle size={28} color="#C87882" strokeWidth={1.5}/>
      <p className="text-[16px] font-normal" style={{ fontFamily:SERIF, color:C.text }}>
        Couldn't load listings
      </p>
      <p className="text-[12px] font-light leading-relaxed" style={{ color:C.sub }}>{message}</p>
      <p className="text-[11px] mt-1" style={{ color:C.hint }}>
        Check Vercel environment variables and redeploy.
      </p>
    </div>
  );
}

// ─── Home screen ───────────────────────────────────────────────────────────────
function CategoryCard({ label, count, Icon, bg, border, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const scale  = pressed ? "scale(0.95)" : hovered ? "scale(1.03)" : "scale(1)";
  const shadow = pressed ? "none" : hovered ? "0 8px 28px rgba(0,0,0,0.13)" : "0 4px 18px rgba(0,0,0,0.08)";
  return (
    <div className="relative rounded-[20px] p-5 flex flex-col justify-between cursor-pointer select-none"
      style={{ backgroundColor:bg, border:`1px solid ${border}`, minHeight:160,
        transform:scale, boxShadow:shadow,
        transition:"transform 0.18s cubic-bezier(.34,1.56,.64,1),box-shadow 0.18s ease" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background:"rgba(253,251,247,0.18)" }}>
        <Icon size={18} color="rgba(253,251,247,0.82)" strokeWidth={1.5}/>
      </div>
      <div className="mt-8">
        <p className="text-[26px] font-light leading-tight"
          style={{ fontFamily:SERIF, color:"#FDFBF7" }}>{label}</p>
        <p className="text-[10px] tracking-[0.18em] uppercase mt-1"
          style={{ color:"rgba(253,251,247,0.6)" }}>{count} listings</p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.5}
        style={{ position:"absolute", bottom:16, right:16, color:"rgba(253,251,247,0.38)" }}/>
    </div>
  );
}

function HomeScreen({ listings, loading, error, onNavigate, savedIds, onToggleSave }) {
  const [query,   setQuery]   = useState("");
  const [showLoc, setShowLoc] = useState(false);
  const [suburb,  setSuburb]  = useState("All suburbs");

  const catStats = useMemo(() => {
    const counts = {};
    listings.forEach(l => {
      const key = (l.category || "").toLowerCase().trim();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, count]) => {
        const cfg      = CAT_CFG[key] || DEF_CFG;
        const original = listings.find(l => (l.category||"").toLowerCase().trim() === key)?.category || key;
        return { label:original, key, count, ...cfg };
      })
      .sort((a,b) => {
        const ai = CAT_ORDER.indexOf(a.key);
        const bi = CAT_ORDER.indexOf(b.key);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      });
  }, [listings]);

  const suburbs = useMemo(() => {
    const s = [...new Set(listings.map(l => l.suburb).filter(Boolean))].sort();
    return ["All suburbs", ...s];
  }, [listings]);

  const featuredListings = useMemo(() => listings.filter(l => l.featured).slice(0,3), [listings]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return listings.filter(l =>
      (l.name     ||"").toLowerCase().includes(q) ||
      (l.tagline  ||"").toLowerCase().includes(q) ||
      (l.category ||"").toLowerCase().includes(q) ||
      (l.suburb   ||"").toLowerCase().includes(q) ||
      (l.tags||[]).some(t => (t||"").toLowerCase().includes(q))
    );
  }, [query, listings]);

  const isSearching = query.trim().length > 0;

  if (loading) return <LoadingState/>;
  if (error)   return <ErrorState message={error}/>;

  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      <div className="pt-6 pb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color:C.sub }}>
          Your beauty directory
        </p>
        <h1 className="text-[52px] font-light leading-none tracking-tight"
          style={{ fontFamily:SERIF, color:C.text }}>Au<em>ra</em></h1>
        <p className="text-[13px] font-light mt-2 tracking-widest" style={{ color:C.sub }}>
          Discover · Book · Glow
        </p>
      </div>

      {/* Search */}
      <div className="mt-5 mb-2 relative">
        <div className="flex items-center gap-3 rounded-[14px] px-4 py-3.5"
          style={{ background:C.surface, border:`1px solid ${isSearching ? C.bronze : C.border}`,
            transition:"border-color 0.2s" }}>
          <Search size={15} color={isSearching ? C.bronze : C.hint} strokeWidth={1.5}/>
          <input
            className="flex-1 text-[13px] font-light tracking-wide bg-transparent border-none outline-none"
            style={{ color:C.text, caretColor:C.bronze }}
            placeholder="Search salons, categories, suburbs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query
            ? <button onClick={() => setQuery("")}
                className="bg-transparent border-none cursor-pointer p-0">
                <X size={14} color={C.hint} strokeWidth={1.5}/>
              </button>
            : <button onClick={() => setShowLoc(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border-none cursor-pointer hover:opacity-80"
                style={{ background:"#E0D8CC" }}>
                <MapPin size={11} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase"
                  style={{ color:C.dark }}>
                  {suburb === "All suburbs" ? "Near me" : suburb}
                </span>
              </button>
          }
        </div>

        {/* Search results dropdown */}
        {isSearching && (
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-[16px] overflow-hidden z-40"
            style={{ background:C.cream, border:`1px solid ${C.border}`,
              boxShadow:"0 8px 24px rgba(0,0,0,0.1)" }}>
            {searchResults.length === 0
              ? <div className="py-6 flex flex-col items-center gap-1">
                  <p className="text-[13px]" style={{ color:C.hint }}>No results for "{query}"</p>
                  <p className="text-[11px]" style={{ color:C.hint }}>
                    Try a name, category or suburb
                  </p>
                </div>
              : <>
                  <p className="text-[10px] tracking-[0.16em] uppercase px-4 pt-3 pb-1"
                    style={{ color:C.sub }}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.slice(0,8).map(l => (
                    <div key={l.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80"
                      style={{ borderTop:`1px solid ${C.border}` }}
                      onClick={() => { onNavigate("detail", l.id); setQuery(""); }}>
                      <Avatar listing={l} size={38}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-normal"
                          style={{ fontFamily:SERIF, color:C.text }}>{l.name}</p>
                        <p className="text-[11px]" style={{ color:C.sub }}>
                          {l.category} · {l.suburb}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star size={10} color={C.bronze} strokeWidth={1.5}/>
                        <span className="text-[12px] font-medium" style={{ color:C.text }}>
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

      {!isSearching && (
        <>
          {catStats.length > 0 && (
            <>
              <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5 mt-5"
                style={{ color:C.sub }}>Browse by category</p>
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                {catStats.map(cat => (
                  <CategoryCard key={cat.key} {...cat}
                    onClick={() => onNavigate("category", cat.label)}/>
                ))}
              </div>
            </>
          )}

          {featuredListings.length > 0 && (
            <>
              <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5"
                style={{ color:C.sub }}>Featured this week</p>
              <div className="flex flex-col gap-3 pb-2">
                {featuredListings.map((biz,i) => (
                  <div key={biz.id} onClick={() => onNavigate("detail", biz.id)}
                    className="rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                    <div className="flex items-center gap-3">
                      <Avatar listing={biz} size={56}/>
                      <div className="flex-1 min-w-0">
                        {i === 0 && (
                          <span className="text-[9px] tracking-[0.18em] uppercase font-medium block mb-0.5"
                            style={{ color:C.sub }}>Editor's pick</span>
                        )}
                        <p className="text-[19px] font-normal leading-tight"
                          style={{ fontFamily:SERIF, color:C.text }}>{biz.name}</p>
                        <p className="text-[11px] font-light mt-0.5 tracking-wide"
                          style={{ color:C.sub }}>{biz.category} · {biz.suburb}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star size={11} color={C.sub} strokeWidth={1.5}/>
                          <span className="text-[13px] font-medium" style={{ color:C.text }}>
                            {biz.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color:C.sub }}>
                          {biz.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <div className="h-px my-3" style={{ background:C.divider }}/>
                    <div className="flex flex-wrap gap-2">
                      {biz.tags.slice(0,3).map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {listings.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Leaf size={28} color={C.border} strokeWidth={1}/>
              <p className="text-[14px]" style={{ color:C.hint }}>No listings yet.</p>
              <p className="text-[12px] text-center" style={{ color:C.hint }}>
                Add businesses in Airtable with Active ✓ ticked.
              </p>
            </div>
          )}
        </>
      )}

      {showLoc && (
        <Sheet title="Choose location" onClose={() => setShowLoc(false)}>
          {suburbs.map(s => (
            <button key={s} onClick={() => { setSuburb(s); setShowLoc(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background:suburb===s ? C.muted : "transparent",
                border:`1px solid ${suburb===s ? C.border : "transparent"}`, marginBottom:4 }}>
              <span className="text-[14px]" style={{ color:C.text }}>{s}</span>
              {suburb === s && <Check size={15} color={C.bronze} strokeWidth={2}/>}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ─── Category screen ───────────────────────────────────────────────────────────
function ServiceRow({ listing, onTap, onBook, savedIds, onToggleSave }) {
  const saved = savedIds.has(listing.id);
  return (
    <div className="rounded-[18px] p-4 cursor-pointer transition-all duration-150 hover:scale-[1.005] active:scale-[0.99]"
      style={{ background:C.muted, border:`1px solid ${C.border}` }}
      onClick={() => onTap(listing.id)}>
      <div className="flex items-start gap-3">
        <Avatar listing={listing} size={48}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-normal leading-tight"
                style={{ fontFamily:SERIF, color:C.text }}>{listing.name}</p>
              <p className="text-[11px] font-light mt-0.5 leading-snug"
                style={{ color:C.sub }}>{listing.tagline}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onToggleSave(listing.id); }}
              className="mt-0.5 bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
              <Heart size={15} strokeWidth={1.5}
                color={saved ? "#B5916A" : C.hint} fill={saved ? "#B5916A" : "none"}/>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin size={10} color={C.sub} strokeWidth={1.5}/>
              <span className="text-[11px]" style={{ color:C.sub }}>{listing.suburb}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={10} color={C.bronze} strokeWidth={1.5}/>
              <span className="text-[12px] font-medium" style={{ color:C.text }}>
                {listing.rating.toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color:C.sub }}>({listing.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} color={C.sub} strokeWidth={1.5}/>
              <span className="text-[11px]" style={{ color:C.sub }}>{listing.wait}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px my-3" style={{ background:C.divider }}/>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {listing.tags.slice(0,2).map(t => <Tag key={t}>{t}</Tag>)}
          <span className="text-[11px] rounded-full px-3 py-1"
            style={{ border:`1px solid ${C.divider}`, color:C.bronze }}>
            {listing.price}
          </span>
        </div>
        <button onClick={e => { e.stopPropagation(); onBook(listing); }}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium tracking-wide flex-shrink-0 hover:opacity-80 active:opacity-60"
          style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer" }}>
          Book <ArrowUpRight size={11} strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

function CategoryScreen({ catLabel, listings, onBack, onBook, onDetail, savedIds, onToggleSave }) {
  const cfg   = getCatCfg(catLabel);
  const items = useMemo(() =>
    listings.filter(l => (l.category||"").toLowerCase().trim() === (catLabel||"").toLowerCase().trim()),
    [listings, catLabel]
  );
  const [filter,   setFilter]   = useState("All");
  const [query,    setQuery]    = useState("");
  const [sort,     setSort]     = useState("Recommended");
  const [showSort, setShowSort] = useState(false);
  const [suburb,   setSuburb]   = useState("All suburbs");
  const [showSub,  setShowSub]  = useState(false);
  const FILTERS = ["All","Top rated","Available today"];

  const suburbs = useMemo(() => {
    const s = [...new Set(items.map(l => l.suburb).filter(Boolean))].sort();
    return ["All suburbs", ...s];
  }, [items]);

  const filtered = useMemo(() => {
    let r = items.filter(l => {
      const mf = filter === "Top rated"       ? l.rating >= 4.8
               : filter === "Available today" ? (l.wait||"").toLowerCase() === "today"
               : true;
      const q  = query.trim().toLowerCase();
      const mq = !q
        || (l.name   ||"").toLowerCase().includes(q)
        || (l.suburb ||"").toLowerCase().includes(q)
        || (l.tagline||"").toLowerCase().includes(q)
        || (l.tags||[]).some(t => (t||"").toLowerCase().includes(q));
      const ms = suburb === "All suburbs" || l.suburb === suburb;
      return mf && mq && ms;
    });
    if (sort === "Top rated")          r = [...r].sort((a,b) => b.rating - a.rating);
    else if (sort === "Name A–Z")      r = [...r].sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === "Price: Low–High") r = [...r].sort((a,b) => (PRICE_ORDER[a.price]||2)-(PRICE_ORDER[b.price]||2));
    return r;
  }, [items, filter, query, sort, suburb]);

  return (
    <div className="flex-1 overflow-y-auto aura-scroll pb-4 relative">
      <div className="px-6 pt-5 pb-7" style={{ background:cfg.bg }}>
        <button onClick={onBack}
          className="flex items-center gap-1 mb-5 bg-transparent border-none cursor-pointer p-0"
          style={{ color:"rgba(253,251,247,0.8)" }}>
          <ChevronLeft size={18} strokeWidth={1.5}/>
          <span className="text-[12px] tracking-[0.1em] uppercase">Back</span>
        </button>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color:"rgba(253,251,247,0.6)" }}>Category</p>
            <h2 className="text-[46px] font-light leading-none"
              style={{ fontFamily:SERIF, color:"#FDFBF7" }}>{catLabel}</h2>
            <p className="text-[12px] mt-1.5" style={{ color:"rgba(253,251,247,0.65)" }}>
              {items.length} listing{items.length !== 1 ? "s" : ""} in Adelaide
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background:"rgba(253,251,247,0.18)" }}>
            <cfg.Icon size={22} color="rgba(253,251,247,0.85)" strokeWidth={1.5}/>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-6 pt-4 pb-3 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="rounded-full px-4 py-1.5 text-[11px] tracking-wide whitespace-nowrap"
            style={{ border:`1px solid ${filter===f ? C.text : C.border}`,
              background:filter===f ? C.text : "transparent",
              color:filter===f ? C.cream : C.dark, cursor:"pointer" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="mx-6 mb-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 rounded-[14px] px-4 py-3"
          style={{ background:C.surface, border:`1px solid ${query ? C.bronze : C.border}`,
            transition:"border-color 0.2s" }}>
          <Search size={14} color={query ? C.bronze : C.hint} strokeWidth={1.5}/>
          <input className="flex-1 text-[13px] font-light bg-transparent border-none outline-none"
            style={{ color:C.text, caretColor:C.bronze }}
            placeholder={`Search ${(catLabel||"").toLowerCase()}…`}
            value={query} onChange={e => setQuery(e.target.value)}/>
          {query && (
            <button onClick={() => setQuery("")}
              className="bg-transparent border-none cursor-pointer p-0">
              <X size={13} color={C.hint} strokeWidth={1.5}/>
            </button>
          )}
        </div>
        <button onClick={() => setShowSub(true)}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center border-none cursor-pointer hover:opacity-80"
          style={{ background:suburb !== "All suburbs" ? C.text : C.surface,
            border:`1px solid ${C.border}`, flexShrink:0 }}>
          <MapPin size={15}
            color={suburb !== "All suburbs" ? C.cream : C.sub} strokeWidth={1.5}/>
        </button>
      </div>

      <div className="px-6 mb-3 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color:C.sub }}>
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </p>
        <button onClick={() => setShowSort(true)}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 hover:opacity-70">
          <SlidersHorizontal size={12} color={C.bronze} strokeWidth={1.5}/>
          <span className="text-[11px]" style={{ color:C.bronze }}>Sort: {sort}</span>
          <ChevronRight size={11} color={C.bronze} strokeWidth={1.5}/>
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-2">
        {filtered.length > 0
          ? filtered.map(l => (
              <ServiceRow key={l.id} listing={l} onTap={onDetail} onBook={onBook}
                savedIds={savedIds} onToggleSave={onToggleSave}/>
            ))
          : <div className="text-center py-10">
              <p className="text-[13px]" style={{ color:C.hint }}>No results.</p>
              <p className="text-[11px] mt-1" style={{ color:C.hint }}>Try clearing your filters.</p>
            </div>
        }
      </div>

      {showSort && (
        <Sheet title="Sort by" onClose={() => setShowSort(false)}>
          {SORT_OPTS.map(o => (
            <button key={o} onClick={() => { setSort(o); setShowSort(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background:sort===o ? C.muted : "transparent",
                border:`1px solid ${sort===o ? C.border : "transparent"}`, marginBottom:4 }}>
              <span className="text-[14px]" style={{ color:C.text }}>{o}</span>
              {sort === o && <Check size={15} color={C.bronze} strokeWidth={2}/>}
            </button>
          ))}
        </Sheet>
      )}

      {showSub && (
        <Sheet title="Filter by suburb" onClose={() => setShowSub(false)}>
          {suburbs.map(s => (
            <button key={s} onClick={() => { setSuburb(s); setShowSub(false); }}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{ background:suburb===s ? C.muted : "transparent",
                border:`1px solid ${suburb===s ? C.border : "transparent"}`, marginBottom:4 }}>
              <span className="text-[14px]" style={{ color:C.text }}>{s}</span>
              {suburb === s && <Check size={15} color={C.bronze} strokeWidth={2}/>}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ─── Detail screen — premium profile ──────────────────────────────────────────
function DetailScreen({ listingId, listings, onBack, onBook, savedIds, onToggleSave }) {
  const l = listings.find(x => x.id === listingId);
  if (!l) return null;

  const cfg    = getCatCfg(l.category);
  const saved  = savedIds.has(l.id);
  const photos = l.photos?.length ? l.photos : (l.photo ? [l.photo] : []);

  const [activeImg,  setActiveImg]  = useState(0);
  const [ctaVisible, setCtaVisible] = useState(false);
  const scrollRef = useRef(null);

  // Sticky CTA appears once user scrolls past the hero
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const THRESHOLD = photos.length > 0 ? 240 : 160;
    const onScroll = () => setCtaVisible(el.scrollTop > THRESHOLD);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  // Reset active image when a different listing is opened
  useEffect(() => { setActiveImg(0); }, [listingId]);

  // ── Derived display values ──────────────────────────────────────
  const hoursLines = (l.openingHours || "")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const idx  = line.indexOf(":");
      const day  = idx > 0 ? line.slice(0, idx).trim() : line;
      const time = idx > 0 ? line.slice(idx + 1).trim() : "";
      return { day, time };
    });

  // Detect today's day name so we can highlight it
  const TODAY = new Date().toLocaleDateString("en-AU", { weekday:"long" });

  const igHandle = l.instagram
    ? "@" + l.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
    : null;

  const priceLabel = { "$":"Budget-friendly", "$$":"Mid-range", "$$$":"Premium" }[l.price] || l.price;

  // Are there enough social/contact links to show a quick-action row?
  const hasSocial = l.instagram || l.facebook;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto aura-scroll">

        {/* ════════════════════════════════════════
            HERO — photo gallery OR colour banner
        ════════════════════════════════════════ */}
        {photos.length > 0 ? (
          <div className="relative w-full" style={{ height: 300 }}>
            {/* Main hero image */}
            <img
              key={activeImg}
              src={photos[activeImg]}
              alt={`${l.name} — photo ${activeImg + 1}`}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block",
                transition:"opacity 0.2s ease" }}
            />

            {/* Dual gradient: top for nav buttons, bottom for text */}
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 38%, transparent 52%, rgba(0,0,0,0.72) 100%)" }} />

            {/* Back + Save */}
            <div className="absolute flex items-center justify-between"
              style={{ top:20, left:20, right:20 }}>
              <button onClick={onBack}
                className="flex items-center gap-1.5 border-none cursor-pointer p-0"
                style={{ background:"rgba(0,0,0,0.22)", backdropFilter:"blur(8px)",
                  borderRadius:20, padding:"6px 12px 6px 8px", color:"rgba(255,255,255,0.93)" }}>
                <ChevronLeft size={18} strokeWidth={1.5}/>
                <span className="text-[11px] tracking-[0.12em] uppercase">Back</span>
              </button>
              <button onClick={() => onToggleSave(l.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background:"rgba(0,0,0,0.22)", backdropFilter:"blur(8px)" }}>
                <Heart size={16} strokeWidth={1.5} color="#fff" fill={saved ? "#fff" : "none"}/>
              </button>
            </div>

            {/* Name + category over photo */}
            <div className="absolute" style={{ bottom: photos.length > 1 ? 58 : 18, left:20, right:20 }}>
              <span className="inline-block text-[10px] tracking-[0.18em] uppercase mb-1.5 rounded-full px-2.5 py-1"
                style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(4px)",
                  color:"rgba(255,255,255,0.88)", border:"1px solid rgba(255,255,255,0.2)" }}>
                {l.category}
              </span>
              <h2 className="text-[32px] leading-tight"
                style={{ fontFamily:SERIF, fontWeight:300, color:"#FDFBF7",
                  textShadow:"0 2px 12px rgba(0,0,0,0.55)" }}>{l.name}</h2>
              {l.tagline && (
                <p className="text-[12px] font-light mt-1"
                  style={{ color:"rgba(255,255,255,0.78)", textShadow:"0 1px 6px rgba(0,0,0,0.4)" }}>
                  {l.tagline}
                </p>
              )}
            </div>

            {/* Thumbnail strip — only when >1 photo */}
            {photos.length > 1 && (
              <div className="absolute flex gap-2" style={{ bottom:14, left:20, right:20 }}>
                {photos.slice(0, 6).map((url, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="border-none cursor-pointer p-0 flex-shrink-0"
                    style={{ width:42, height:42, borderRadius:10, overflow:"hidden",
                      border:`2px solid ${i === activeImg ? "#FDFBF7" : "rgba(255,255,255,0.38)"}`,
                      opacity: i === activeImg ? 1 : 0.75,
                      transition:"border-color 0.15s, opacity 0.15s" }}>
                    <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </button>
                ))}
                {/* Photo count badge if >6 */}
                {photos.length > 6 && (
                  <div className="flex items-center justify-center flex-shrink-0 rounded-[10px]"
                    style={{ width:42, height:42, background:"rgba(0,0,0,0.4)",
                      border:"2px solid rgba(255,255,255,0.3)" }}>
                    <span className="text-[11px] font-medium" style={{ color:"#fff" }}>
                      +{photos.length - 6}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

        ) : (
          /* ── No photos: coloured category banner ── */
          <div style={{ background:cfg.bg, padding:"20px 24px 28px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom:20 }}>
              <button onClick={onBack}
                className="flex items-center gap-1 border-none cursor-pointer p-0"
                style={{ background:"rgba(253,251,247,0.15)", borderRadius:20,
                  padding:"6px 12px 6px 8px", color:"rgba(253,251,247,0.88)" }}>
                <ChevronLeft size={18} strokeWidth={1.5}/>
                <span className="text-[11px] tracking-[0.12em] uppercase">Back</span>
              </button>
              <button onClick={() => onToggleSave(l.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer"
                style={{ background:"rgba(253,251,247,0.18)" }}>
                <Heart size={17} strokeWidth={1.5} color="#FDFBF7" fill={saved ? "#FDFBF7" : "none"}/>
              </button>
            </div>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-1.5"
              style={{ color:"rgba(253,251,247,0.62)" }}>{l.category}</p>
            <h2 className="text-[36px] font-light leading-tight"
              style={{ fontFamily:SERIF, color:"#FDFBF7" }}>{l.name}</h2>
            {l.tagline && (
              <p className="text-[13px] font-light mt-1.5"
                style={{ color:"rgba(253,251,247,0.72)" }}>{l.tagline}</p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            IDENTITY STRIP — rating, price, suburb
        ════════════════════════════════════════ */}
        <div className="px-6 pt-5 pb-1">
          {/* Stars + numeric score */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13}
                  color={i < Math.round(l.rating) ? C.bronze : C.border}
                  fill={i < Math.round(l.rating)  ? C.bronze : "none"}
                  strokeWidth={1.5}/>
              ))}
            </div>
            <span className="text-[15px] font-medium" style={{ color:C.text }}>
              {l.rating.toFixed(1)}
            </span>
            <span className="text-[12px]" style={{ color:C.sub }}>
              {l.reviews > 0
                ? `(${l.reviews} review${l.reviews !== 1 ? "s" : ""})`
                : "No reviews yet"}
            </span>
          </div>

          {/* Quick-info pills: location · availability · price */}
          <div className="flex gap-2 pb-2 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
            {[
              { Icon:MapPin,   label:l.suburb,    show:!!l.suburb     },
              { Icon:Clock,    label:l.wait,       show:!!l.wait       },
              { Icon:BookOpen, label:priceLabel,   show:!!l.price      },
            ].filter(p => p.show).map(({ Icon, label }) => (
              <div key={label}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                <Icon size={11} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[11px]" style={{ color:C.dark }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            QUICK-ACTION ROW — Phone · Book · Social
        ════════════════════════════════════════ */}
        <div className="px-6 pt-3 pb-1">
          <div className="flex gap-2.5">
            {/* Call button */}
            {l.phone && (
              <button onClick={() => window.open(`tel:${l.phone}`)}
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 border-none cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                <Phone size={16} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[10px] tracking-[0.08em]" style={{ color:C.sub }}>Call</span>
              </button>
            )}

            {/* Book — primary action */}
            <button onClick={() => onBook(l)}
              className="flex-1 flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 border-none cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
              style={{ background:C.text }}>
              <Globe size={16} color={C.cream} strokeWidth={1.5}/>
              <span className="text-[10px] tracking-[0.08em]" style={{ color:C.cream }}>Book</span>
            </button>

            {/* Maps */}
            {l.mapsUrl && (
              <button onClick={() => window.open(l.mapsUrl, "_blank")}
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 border-none cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                <MapPin size={16} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[10px] tracking-[0.08em]" style={{ color:C.sub }}>Directions</span>
              </button>
            )}

            {/* Instagram */}
            {l.instagram && (
              <button onClick={() => window.open(l.instagram, "_blank")}
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-[16px] py-3 border-none cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                <Instagram size={16} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[10px] tracking-[0.08em]" style={{ color:C.sub }}>Instagram</span>
              </button>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            ABOUT
        ════════════════════════════════════════ */}
        {l.about && (
          <div className="px-6">
            <SectionLabel>About</SectionLabel>
            <p className="text-[14px] font-light leading-[1.75] pb-5" style={{ color:C.text }}>
              {l.about}
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════
            SERVICES — tags as chips
        ════════════════════════════════════════ */}
        {l.tags.length > 0 && (
          <div className="px-6">
            <SectionLabel>Services</SectionLabel>
            <div className="flex flex-wrap gap-2 pb-5">
              {l.tags.map(t => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            OPENING HOURS
        ════════════════════════════════════════ */}
        {hoursLines.length > 0 && (
          <div className="px-6">
            <SectionLabel>Opening hours</SectionLabel>
            <div className="rounded-[16px] overflow-hidden mb-5"
              style={{ border:`1px solid ${C.border}` }}>
              {hoursLines.map(({ day, time }, i) => {
                const isClosed  = (time||"").toLowerCase().includes("closed");
                const isToday   = day.toLowerCase() === TODAY.toLowerCase();
                return (
                  <div key={i}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      background: isToday ? C.surface : C.cream,
                      borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                    }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]"
                        style={{ color:C.text, fontWeight: isToday ? 500 : 400 }}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[9px] tracking-[0.12em] uppercase rounded-full px-2 py-0.5"
                          style={{ background:C.sage, color:"#FDFBF7" }}>Today</span>
                      )}
                    </div>
                    <span className="text-[13px] font-light"
                      style={{ color: isClosed ? C.hint : isToday ? C.bronze : C.sub }}>
                      {time || "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            LOCATION — address card with map link
        ════════════════════════════════════════ */}
        {(l.address || l.suburb) && (
          <div className="px-6">
            <SectionLabel>Location</SectionLabel>
            <button onClick={() => l.mapsUrl && window.open(l.mapsUrl, "_blank")}
              className="w-full rounded-[16px] p-4 text-left mb-5 border-none cursor-pointer hover:opacity-85 transition-opacity"
              style={{ background:C.surface, border:`1px solid ${C.border}` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                  <MapPin size={16} color={C.bronze} strokeWidth={1.5}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{ color:C.text }}>
                    {l.address || `${l.suburb}, Adelaide SA`}
                  </p>
                  {l.address && l.suburb && (
                    <p className="text-[11px] mt-0.5" style={{ color:C.sub }}>{l.suburb}</p>
                  )}
                  {l.mapsUrl && (
                    <p className="text-[11px] mt-1.5 flex items-center gap-1"
                      style={{ color:C.bronze }}>
                      Open in Google Maps
                      <ChevronRight size={11} strokeWidth={2}/>
                    </p>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════
            CONTACT DETAILS
        ════════════════════════════════════════ */}
        <div className="px-6">
          <SectionLabel>Contact</SectionLabel>
          <div className="flex flex-col gap-2.5 mb-5">
            {l.phone && (
              <ContactRow
                icon={Phone}
                label={l.phone}
                sublabel="Call to enquire or book"
                onPress={() => window.open(`tel:${l.phone}`)}
              />
            )}
            {l.bookingUrl && l.bookingUrl !== "#" && (
              <ContactRow
                icon={Globe}
                label={l.bookingUrl.replace("https://","").replace("www.","")}
                sublabel="Visit website & book online"
                onPress={() => window.open(l.bookingUrl, "_blank")}
              />
            )}
            {l.instagram && (
              <ContactRow
                icon={Instagram}
                label={igHandle || l.instagram}
                sublabel="Follow on Instagram"
                onPress={() => window.open(l.instagram, "_blank")}
              />
            )}
            {l.facebook && (
              <ContactRow
                icon={Facebook}
                label="Facebook page"
                sublabel="View on Facebook"
                onPress={() => window.open(l.facebook, "_blank")}
              />
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            INLINE CTA — Book + Call buttons
        ════════════════════════════════════════ */}
        <div className="px-6 pb-8 pt-2">
          <button onClick={() => onBook(l)}
            className="w-full rounded-[16px] py-4 text-[14px] flex items-center justify-center gap-2 hover:opacity-85 active:opacity-70 transition-opacity"
            style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer",
              fontWeight:500, letterSpacing:"0.1em" }}>
            Book an appointment
            <ArrowUpRight size={15} strokeWidth={2}/>
          </button>
          {l.phone && (
            <button onClick={() => window.open(`tel:${l.phone}`)}
              className="w-full rounded-[16px] py-3.5 text-[13px] flex items-center justify-center gap-2 mt-3 hover:opacity-80 transition-opacity"
              style={{ background:"transparent", color:C.bronze,
                border:`1px solid ${C.divider}`, cursor:"pointer" }}>
              <Phone size={14} strokeWidth={1.5}/>
              Call us
            </button>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════
          STICKY CTA BAR — slides up after hero scroll
      ════════════════════════════════════════ */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:C.cream,
        borderTop:`1px solid ${C.border}`,
        boxShadow:"0 -6px 20px rgba(58,50,40,0.08)",
        transform: ctaVisible ? "translateY(0)" : "translateY(110%)",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        paddingBottom:"max(14px, env(safe-area-inset-bottom))",
      }}>
        <div className="flex items-center gap-3 px-5 pt-3 pb-1">
          {/* Mini identity */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-normal truncate"
              style={{ fontFamily:SERIF, color:C.text }}>{l.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={10} color={C.bronze} fill={C.bronze} strokeWidth={0}/>
              <span className="text-[11px] font-medium" style={{ color:C.bronze }}>
                {l.rating.toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color:C.hint }}>
                · {l.category} · {l.price}
              </span>
            </div>
          </div>

          {/* Compact CTA pair */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {l.phone && (
              <button onClick={() => window.open(`tel:${l.phone}`)}
                className="w-10 h-10 rounded-[12px] flex items-center justify-center border-none cursor-pointer hover:opacity-80"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}>
                <Phone size={16} color={C.bronze} strokeWidth={1.5}/>
              </button>
            )}
            <button onClick={() => onBook(l)}
              className="flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 text-[13px] font-medium border-none cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
              style={{ background:C.text, color:C.cream }}>
              Book <ArrowUpRight size={13} strokeWidth={2}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Saved screen ──────────────────────────────────────────────────────────────
function SavedScreen({ listings, savedIds, onDetail, onToggleSave, onNavigate }) {
  const saved = listings.filter(l => savedIds.has(l.id));
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color:C.sub }}>
          Your collection
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily:SERIF, color:C.text }}>Saved</h2>
      </div>
      {saved.length === 0
        ? <div className="flex flex-col items-center py-14 gap-3">
            <Heart size={32} color={C.border} strokeWidth={1}/>
            <p className="text-[14px]" style={{ color:C.hint }}>No saved businesses yet.</p>
            <button onClick={() => onNavigate("home")}
              className="mt-2 rounded-full px-5 py-2 text-[12px] hover:opacity-80"
              style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer" }}>
              Browse categories
            </button>
          </div>
        : <div className="flex flex-col gap-3">
            {saved.map(l => (
              <div key={l.id}
                className="rounded-[18px] p-4 cursor-pointer hover:scale-[1.005] transition-all"
                style={{ background:C.muted, border:`1px solid ${C.border}` }}
                onClick={() => onDetail(l.id)}>
                <div className="flex items-center gap-3">
                  <Avatar listing={l} size={44}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-normal"
                      style={{ fontFamily:SERIF, color:C.text }}>{l.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color:C.sub }}>
                      {l.suburb} · {l.category}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onToggleSave(l.id); }}
                    className="bg-transparent border-none cursor-pointer p-0">
                    <Heart size={15} strokeWidth={1.5} color="#B5916A" fill="#B5916A"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Bookings screen ───────────────────────────────────────────────────────────
function BookScreen({ onNavigate }) {
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color:C.sub }}>
          Your schedule
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily:SERIF, color:C.text }}>Bookings</h2>
      </div>
      <div className="flex flex-col items-center py-12 gap-3">
        <CalendarDays size={32} color={C.border} strokeWidth={1}/>
        <p className="text-[14px]" style={{ color:C.hint }}>No upcoming bookings.</p>
        <button onClick={() => onNavigate("home")}
          className="mt-3 rounded-full px-5 py-2.5 text-[12px] hover:opacity-80"
          style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer" }}>
          Browse services
        </button>
      </div>
    </div>
  );
}

// ─── Profile screen ────────────────────────────────────────────────────────────
function ProfileScreen({ savedCount }) {
  const [sheet,  setSheet]  = useState(null);
  const [notifs, setNotifs] = useState({ bookings:true, offers:false, reminders:true });
  const menu = [
    { id:"prefs",  Icon:Settings,   label:"Preferences"    },
    { id:"notifs", Icon:Bell,       label:"Notifications"  },
    { id:"help",   Icon:HelpCircle, label:"Help & support" },
    { id:"about",  Icon:Info,       label:"About Aura"     },
  ];
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color:C.sub }}>
          Your account
        </p>
        <h2 className="text-[38px] font-light leading-none"
          style={{ fontFamily:SERIF, color:C.text }}>Profile</h2>
      </div>
      <div className="flex flex-col items-center py-5 gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background:C.muted, border:`1px solid ${C.border}` }}>
          <User size={32} color={C.sub} strokeWidth={1}/>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-light" style={{ fontFamily:SERIF, color:C.text }}>
            Guest User
          </p>
          <p className="text-[12px] mt-0.5" style={{ color:C.sub }}>Adelaide, SA</p>
        </div>
        <button onClick={() => setSheet("signin")}
          className="rounded-full px-5 py-2 text-[12px] tracking-wide hover:opacity-80"
          style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer" }}>
          Sign in or create account
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label:"Saved", value:savedCount }, { label:"Booked", value:"0" }, { label:"Reviews", value:"0" }].map(s => (
          <div key={s.label} className="rounded-[14px] p-3 text-center"
            style={{ background:C.muted, border:`1px solid ${C.border}` }}>
            <p className="text-[22px] font-light" style={{ fontFamily:SERIF, color:C.text }}>{s.value}</p>
            <p className="text-[10px] tracking-[0.14em] uppercase mt-0.5" style={{ color:C.sub }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {menu.map(item => (
        <button key={item.id} onClick={() => setSheet(item.id)}
          className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70"
          style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <item.Icon size={16} color={C.sub} strokeWidth={1.5}/>
            <span className="text-[14px]" style={{ color:C.text }}>{item.label}</span>
          </div>
          <ChevronRight size={15} color={C.hint} strokeWidth={1.5}/>
        </button>
      ))}

      {sheet === "signin" && (
        <Sheet title="Sign in to Aura" onClose={() => setSheet(null)}>
          <div className="flex flex-col gap-4 pt-2">
            {["Email address","Password"].map(p => (
              <div key={p}>
                <p className="text-[10px] tracking-[0.16em] uppercase mb-2" style={{ color:C.sub }}>{p}</p>
                <input type={p==="Password"?"password":"email"}
                  className="w-full rounded-[12px] px-4 py-3 text-[14px] bg-transparent border-none outline-none"
                  style={{ background:C.muted, border:`1px solid ${C.border}`, color:C.text }}
                  placeholder={p==="Password"?"••••••••":"you@example.com"}/>
              </div>
            ))}
            <button onClick={() => setSheet(null)}
              className="w-full rounded-[14px] py-3.5 text-[13px] font-medium mt-1 hover:opacity-85"
              style={{ background:C.text, color:C.cream, border:"none", cursor:"pointer" }}>
              Sign in
            </button>
          </div>
        </Sheet>
      )}
      {sheet === "notifs" && (
        <Sheet title="Notifications" onClose={() => setSheet(null)}>
          {[
            { key:"bookings",  label:"Booking reminders", sub:"Remind me before appointments" },
            { key:"offers",    label:"Special offers",    sub:"Deals from saved businesses"   },
            { key:"reminders", label:"Review requests",   sub:"After your appointment"        },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-4"
              style={{ borderBottom:`1px solid ${C.border}` }}>
              <div>
                <p className="text-[14px]" style={{ color:C.text }}>{n.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color:C.sub }}>{n.sub}</p>
              </div>
              <button onClick={() => setNotifs(p => ({ ...p, [n.key]:!p[n.key] }))}
                className="w-10 h-6 rounded-full flex items-center px-0.5 border-none cursor-pointer"
                style={{ background:notifs[n.key] ? C.sage : C.muted,
                  justifyContent:notifs[n.key] ? "flex-end" : "flex-start" }}>
                <div className="w-5 h-5 rounded-full"
                  style={{ background:notifs[n.key] ? "#FDFBF7" : C.hint }}/>
              </button>
            </div>
          ))}
        </Sheet>
      )}
      {sheet === "prefs" && (
        <Sheet title="Preferences" onClose={() => setSheet(null)}>
          <p className="text-[13px]" style={{ color:C.sub }}>Preference settings coming soon.</p>
        </Sheet>
      )}
      {sheet === "help" && (
        <Sheet title="Help & support" onClose={() => setSheet(null)}>
          {["How do I book?","How do I save a business?","Contact support"].map(q => (
            <button key={q}
              className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70"
              style={{ borderBottom:`1px solid ${C.border}` }}>
              <span className="text-[13px]" style={{ color:C.text }}>{q}</span>
              <ChevronRight size={14} color={C.hint} strokeWidth={1.5}/>
            </button>
          ))}
        </Sheet>
      )}
      {sheet === "about" && (
        <Sheet title="About Aura" onClose={() => setSheet(null)}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-[32px] font-light" style={{ fontFamily:SERIF, color:C.text }}>Aura</p>
            <p className="text-[12px]" style={{ color:C.sub }}>Version 1.0.0 · Adelaide, SA</p>
            <p className="text-[13px] font-light leading-relaxed mt-2" style={{ color:C.text }}>
              Adelaide's premium beauty directory.
            </p>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function AuraApp() {
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
        style={{ background:"#E8E2D8" }}>
        <div className="relative flex flex-col rounded-[44px] overflow-hidden"
          style={{ width:390, maxHeight:844, background:C.cream,
            border:`1px solid ${C.border}`, boxShadow:"0 24px 64px rgba(0,0,0,0.14)" }}>

          <StatusBar/>

          {screen === "home" && (
            <HomeScreen listings={listings} loading={loading} error={error}
              onNavigate={navigate} savedIds={savedIds} onToggleSave={toggleSave}/>
          )}
          {screen === "category" && catLabel && (
            <CategoryScreen catLabel={catLabel} listings={listings}
              onBack={() => navigate("home")} onBook={handleBook}
              onDetail={id => { setCatLabel(catLabel); navigate("detail", id); }}
              savedIds={savedIds} onToggleSave={toggleSave}/>
          )}
          {screen === "detail" && detailId && (
            <DetailScreen listingId={detailId} listings={listings}
              onBack={goBack} onBook={handleBook}
              savedIds={savedIds} onToggleSave={toggleSave}/>
          )}
          {screen === "saved" && (
            <SavedScreen listings={listings} savedIds={savedIds}
              onDetail={id => navigate("detail", id)}
              onToggleSave={toggleSave} onNavigate={navigate}/>
          )}
          {screen === "booking" && <BookScreen onNavigate={navigate}/>}
          {screen === "profile"  && <ProfileScreen savedCount={savedIds.size}/>}

          {/* Nav bar hidden on detail screen — sticky CTA takes priority */}
          {screen !== "detail" && (
            <NavBar activeNav={activeNav} onNavTap={handleNavTap}/>
          )}

          {bookingBiz && (
            <BookingToast business={bookingBiz} onClose={() => setBookingBiz(null)}/>
          )}
        </div>
      </div>
    </>
  );
}
