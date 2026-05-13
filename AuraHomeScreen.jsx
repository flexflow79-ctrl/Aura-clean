import { useState, useMemo } from "react";
import {
  Scissors, Sparkles, Fingerprint, Palette, Search, MapPin, Star,
  Heart, CalendarDays, User, ArrowUpRight, Leaf, ChevronLeft, Clock,
  X, CheckCircle, Phone, Globe, BookOpen, ChevronRight, SlidersHorizontal,
  Bell, Settings, HelpCircle, Info, LogIn, ChevronDown, Check,
} from "lucide-react";

const C = {
  cream:"#FDFBF7", surface:"#F0EBE2", muted:"#EDE8DF",
  border:"#DDD6C8", divider:"#CBBFAE", text:"#3A3228",
  sub:"#9A8E7A", hint:"#B5A898", bronze:"#7D6E54", dark:"#6B6050", sage:"#8A9E8C",
};
const SERIF = "'Cormorant Garamond', Georgia, serif";

// ─── Data ────────────────────────────────────────────────────────────────────
const categories = [
  { id:"hair",   label:"Hair",   count:142, Icon:Scissors,    bg:"#8A9E8C", border:"#798D7B" },
  { id:"skin",   label:"Skin",   count:98,  Icon:Sparkles,    bg:"#A3B09A", border:"#92A08A" },
  { id:"nails",  label:"Nails",  count:74,  Icon:Fingerprint, bg:"#7A9188", border:"#6A8178" },
  { id:"makeup", label:"Makeup", count:61,  Icon:Palette,     bg:"#B5916A", border:"#A07D56" },
];

const listings = {
  hair:[
    {id:"h1",name:"Oscar Oscar Salons",tagline:"Award-winning colour & precision cuts",suburb:"Rundle Mall, CBD",rating:4.9,reviews:312,wait:"Today",price:"$$$",tags:["Balayage","Colour","Blowdry","Keratin"],bookingUrl:"https://www.oscaroscar.com.au",phone:"(08) 8231 0099",about:"One of Australia's most celebrated salon groups, Oscar Oscar brings international colour expertise to the heart of Adelaide's CBD."},
    {id:"h2",name:"Rokk Ebony",tagline:"Luxury editorial hair & styling",suburb:"North Adelaide",rating:4.8,reviews:214,wait:"Tomorrow",price:"$$$",tags:["Editorial","Balayage","Toning","Extensions"],bookingUrl:"https://www.rokkebony.com.au",phone:"(08) 8267 3373",about:"A premium North Adelaide destination known for creative colour and editorial styling, favoured by Adelaide's fashion-forward clientele."},
    {id:"h3",name:"Rixon Hair",tagline:"Bespoke colour in a boutique studio",suburb:"Hyde Park",rating:4.9,reviews:178,wait:"Wed",price:"$$$",tags:["Colour correction","Balayage","Organic tints"],bookingUrl:"https://www.rixonhair.com.au",phone:"(08) 8272 6644",about:"Hyde Park's most intimate colour studio, Rixon specialises in bespoke colour journeys using organic and ammonia-free formulas."},
    {id:"h4",name:"The Hair Project",tagline:"Creative cuts & lived-in colour",suburb:"Unley",rating:4.7,reviews:143,wait:"Thu",price:"$$",tags:["Cuts","Highlights","Treatments"],bookingUrl:"https://www.thehairproject.com.au",phone:"(08) 8271 8855",about:"A beloved Unley studio celebrating natural texture and effortless style."},
    {id:"h5",name:"Trademark Hair",tagline:"Precision styling since 2002",suburb:"Norwood",rating:4.8,reviews:96,wait:"Fri",price:"$$",tags:["Cuts","Colour","Bridal"],bookingUrl:"https://www.trademarkhair.com.au",phone:"(08) 8362 7722",about:"A Norwood institution with over two decades of precision cutting and colour expertise."},
  ],
  skin:[
    {id:"s1",name:"Elite Laser & Aesthetics",tagline:"Medical-grade skin & laser treatments",suburb:"North Adelaide",rating:4.9,reviews:287,wait:"Today",price:"$$$",tags:["Laser","IPL","Skin needling","Peels"],bookingUrl:"https://www.elitelaser.com.au",phone:"(08) 8267 1900",about:"Adelaide's leading medical aesthetics clinic, offering cutting-edge laser and skin rejuvenation treatments with clinically proven results."},
    {id:"s2",name:"The Cosmetic Lounge",tagline:"Luxury facials & injectables",suburb:"Hyde Park",rating:4.8,reviews:201,wait:"Tomorrow",price:"$$$",tags:["Hydrafacial","LED","Anti-ageing","Peels"],bookingUrl:"https://www.thecosmeticlounge.com.au",phone:"(08) 8373 0044",about:"A serene Hyde Park retreat offering luxury facial treatments, injectables, and bespoke skincare consultations."},
    {id:"s3",name:"Privée Clinic",tagline:"Boutique skin health & wellness",suburb:"Norwood",rating:4.9,reviews:163,wait:"Wed",price:"$$$",tags:["Microneedling","Dermaplaning","Facials"],bookingUrl:"https://www.priveeclinic.com.au",phone:"(08) 8362 9911",about:"Norwood's most exclusive skin clinic, combining science-backed treatments with an intimate boutique experience."},
    {id:"s4",name:"Naked Tan Adelaide",tagline:"Luxury spray tanning & glow treatments",suburb:"Glenelg",rating:4.7,reviews:118,wait:"Today",price:"$$",tags:["Spray tan","Express tan","Glow facial"],bookingUrl:"https://www.nakedtan.com.au",phone:"(08) 8294 5566",about:"Glenelg's go-to destination for flawless spray tans and body treatments, steps from the beach."},
    {id:"s5",name:"Skin Studio Adelaide",tagline:"Results-driven facials & skin therapy",suburb:"Unley",rating:4.6,reviews:89,wait:"Fri",price:"$$",tags:["Acne therapy","Hydration","LED"],bookingUrl:"https://www.skinstudioadelaide.com.au",phone:"(08) 8271 3344",about:"A clinical yet welcoming Unley skin studio focused on long-term skin health and personalised facial therapy."},
  ],
  nails:[
    {id:"n1",name:"Base Coat Nail Studio",tagline:"Minimalist nail art & gel artistry",suburb:"Adelaide CBD",rating:5.0,reviews:204,wait:"Today",price:"$$",tags:["Gel","Nail art","Extensions","Manicure"],bookingUrl:"https://www.basecoatnailstudio.com.au",phone:"(08) 8212 7788",about:"Adelaide's most Instagram-worthy nail studio, specialising in clean, minimalist gel artistry and intricate nail designs."},
    {id:"n2",name:"The Polish Bar",tagline:"Premium manicures in a calm studio",suburb:"Norwood",rating:4.8,reviews:157,wait:"Tomorrow",price:"$$",tags:["SNS","Shellac","Pedicure","French"],bookingUrl:"https://www.thepolishbar.com.au",phone:"(08) 8362 4411",about:"A serene Norwood nail bar offering premium manicure and pedicure experiences in a tranquil, minimalist space."},
    {id:"n3",name:"Posh Nails Adelaide",tagline:"Luxury nails & pampering treatments",suburb:"Hyde Park",rating:4.8,reviews:132,wait:"Wed",price:"$$",tags:["Gel extensions","Chrome","3D art"],bookingUrl:"https://www.poshnails.com.au",phone:"(08) 8373 6622",about:"Hyde Park's favourite luxury nail destination, renowned for creative extensions, chrome finishes and pampering spa pedicures."},
    {id:"n4",name:"La Bel Ongle",tagline:"French-inspired nail couture",suburb:"North Adelaide",rating:4.9,reviews:98,wait:"Thu",price:"$$$",tags:["Gel","Nail couture","Nail art","Spa mani"],bookingUrl:"https://www.labelongle.com.au",phone:"(08) 8267 8833",about:"Inspired by Parisian nail ateliers, La Bel Ongle elevates the manicure experience with couture nail art and luxe spa treatments."},
    {id:"n5",name:"Gloss Nail Bar",tagline:"Express & luxury nail treatments",suburb:"Glenelg",rating:4.6,reviews:74,wait:"Fri",price:"$",tags:["Express gel","Pedicure","Nail art"],bookingUrl:"https://www.glossnailbar.com.au",phone:"(08) 8294 3355",about:"A bright Glenelg nail bar offering everything from quick express gel sets to indulgent pedicure treatments."},
  ],
  makeup:[
    {id:"m1",name:"Makeup by Stef",tagline:"Bridal & editorial makeup artistry",suburb:"Adelaide CBD",rating:5.0,reviews:189,wait:"Today",price:"$$$",tags:["Bridal","Airbrush","Editorial","Trials"],bookingUrl:"https://www.makeupbystef.com.au",phone:"0412 345 678",about:"Adelaide's most sought-after bridal makeup artist, creating flawless, long-lasting looks for weddings and editorials."},
    {id:"m2",name:"The Brow & Beauty Bar",tagline:"Precision brows & flawless finish",suburb:"Norwood",rating:4.9,reviews:241,wait:"Today",price:"$$",tags:["Brow lamination","Lash lift","Makeup"],bookingUrl:"https://www.browandbeautybar.com.au",phone:"(08) 8362 5599",about:"Norwood's premier brow and beauty studio. Specialists in brow lamination, lash lifts, and effortless makeup application."},
    {id:"m3",name:"Faces by Tara",tagline:"Luxury wedding & occasion makeup",suburb:"Unley",rating:4.8,reviews:114,wait:"Thu",price:"$$$",tags:["Bridal","Party glam","Skin prep"],bookingUrl:"https://www.facesbytara.com.au",phone:"0422 876 543",about:"A highly regarded Unley-based makeup artist specialising in bridal and occasion looks."},
    {id:"m4",name:"Studio Glow Adelaide",tagline:"Everyday glam & transformation looks",suburb:"Hyde Park",rating:4.7,reviews:88,wait:"Fri",price:"$$",tags:["Full glam","Natural","Lashes","Events"],bookingUrl:"https://www.studioglowadelaide.com.au",phone:"(08) 8373 1122",about:"Hyde Park's go-to glam studio for everything from soft everyday looks to full transformation glamour."},
    {id:"m5",name:"Lure Beauty Lounge",tagline:"Beauty lessons, glam & brow shaping",suburb:"Glenelg",rating:4.6,reviews:67,wait:"Sat",price:"$$",tags:["Lessons","Brows","Lashes","Glam"],bookingUrl:"https://www.lurebeautylounge.com.au",phone:"(08) 8294 7766",about:"A welcoming Glenelg beauty lounge offering makeup lessons, brow shaping, lash services and glamour packages."},
  ],
};

const allListings = Object.values(listings).flat();

const featured = [
  {...listings.hair[0],   category:"Award-winning colour & cuts",  catId:"hair"  },
  {...listings.skin[0],   category:"Medical-grade skin & laser",    catId:"skin"  },
  {...listings.nails[0],  category:"Minimalist nail art & gel",     catId:"nails" },
];

const SORT_OPTS = ["Recommended","Top rated","Name A–Z","Price: Low–High"];
const SUBURBS   = ["All suburbs","Adelaide CBD","North Adelaide","Norwood","Hyde Park","Unley","Glenelg"];

// ─── Shared primitives ────────────────────────────────────────────────────────
const Tag = ({children}) => (
  <span className="text-[11px] rounded-full px-3 py-1 tracking-wide whitespace-nowrap"
    style={{border:`1px solid ${C.divider}`,color:C.dark,background:"transparent"}}>{children}</span>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3"  y="3"  width="7" height="7" rx="1"/><rect x="14" y="3"  width="7" height="7" rx="1"/>
    <rect x="3"  y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-7 pt-4 pb-0 flex-shrink-0">
      <span className="text-[12px] font-medium tracking-wide" style={{color:C.sub}}>9:41</span>
      <div className="flex items-center gap-1.5" style={{color:C.sub}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function NavBar({activeNav, onNavTap}) {
  const items=[{id:"home",Icon:GridIcon,label:null},{id:"saved",Icon:Heart,label:"Saved"},{id:"book",Icon:CalendarDays,label:"Book"},{id:"profile",Icon:User,label:"Profile"}];
  return (
    <div className="flex justify-around items-center px-4 pt-3 pb-7 flex-shrink-0" style={{borderTop:`1px solid ${C.border}`,background:C.cream}}>
      {items.map(({id,Icon,label})=>{
        const active=activeNav===id;
        return (
          <button key={id} onClick={()=>onNavTap(id)}
            className="flex flex-col items-center gap-1.5 min-w-[56px] bg-transparent border-none outline-none cursor-pointer">
            <span style={{color:active?C.text:"#C0B8AA"}}><Icon size={20} strokeWidth={1.5}/></span>
            {id==="home" ? (active?<span className="w-1 h-1 rounded-full" style={{background:C.text}}/>:<span className="w-1 h-1"/>) :
              <span className="text-[9px] tracking-[0.16em] uppercase" style={{color:active?C.text:"#B0A898"}}>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Bottom sheet wrapper ─────────────────────────────────────────────────────
function Sheet({onClose, title, children}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(58,50,40,0.4)"}}>
      <div className="rounded-t-[28px] overflow-hidden" style={{background:C.cream,maxHeight:"80%",display:"flex",flexDirection:"column"}}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0" style={{borderBottom:`1px solid ${C.border}`}}>
          <p className="text-[18px] font-normal" style={{fontFamily:SERIF,color:C.text}}>{title}</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0">
            <X size={18} color={C.sub} strokeWidth={1.5}/>
          </button>
        </div>
        <div className="overflow-y-auto aura-scroll flex-1 px-6 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function BookingToast({business, onClose}) {
  return (
    <div className="absolute inset-0 flex items-end justify-center z-50 pb-24 px-6" style={{pointerEvents:"none"}}>
      <div className="w-full rounded-[20px] p-5 flex items-start gap-3"
        style={{background:C.text,pointerEvents:"auto",boxShadow:"0 8px 32px rgba(58,50,40,0.3)"}}>
        <CheckCircle size={18} color="#8A9E8C" strokeWidth={1.5} style={{flexShrink:0,marginTop:2}}/>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-0.5" style={{color:"rgba(253,251,247,0.5)"}}>Redirecting to booking site</p>
          <p className="text-[17px] font-normal leading-tight" style={{fontFamily:SERIF,color:C.cream}}>{business.name}</p>
          <p className="text-[11px] mt-0.5 font-light" style={{color:"rgba(253,251,247,0.5)"}}>{business.bookingUrl}</p>
        </div>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0 mt-0.5">
          <X size={15} color="rgba(253,251,247,0.45)" strokeWidth={1.5}/>
        </button>
      </div>
    </div>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────
function CategoryCard({label,count,Icon,bg,border,onClick}) {
  const [h,setH]=useState(false); const [p,setP]=useState(false);
  const scale=p?"scale(0.95)":h?"scale(1.03)":"scale(1)";
  const shadow=p?"none":h?"0 8px 28px rgba(0,0,0,0.13)":"0 4px 18px rgba(0,0,0,0.08)";
  return (
    <div className="relative rounded-[20px] p-5 flex flex-col justify-between cursor-pointer select-none"
      style={{backgroundColor:bg,border:`1px solid ${border}`,minHeight:160,transform:scale,boxShadow:shadow,transition:"transform 0.18s cubic-bezier(.34,1.56,.64,1),box-shadow 0.18s ease"}}
      onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>{setH(false);setP(false);}}
      onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onTouchStart={()=>setP(true)} onTouchEnd={()=>setP(false)}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(253,251,247,0.18)"}}>
        <Icon size={18} color="rgba(253,251,247,0.82)" strokeWidth={1.5}/>
      </div>
      <div className="mt-8">
        <p className="text-[26px] font-light leading-tight" style={{fontFamily:SERIF,color:"#FDFBF7"}}>{label}</p>
        <p className="text-[10px] tracking-[0.18em] uppercase mt-1" style={{color:"rgba(253,251,247,0.6)"}}>{count} listings</p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.5} style={{position:"absolute",bottom:16,right:16,color:"rgba(253,251,247,0.38)"}}/>
    </div>
  );
}

function HomeScreen({onNavigate, savedIds, onToggleSave}) {
  const [query,setQuery]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [showLocation,setShowLocation]=useState(false);
  const [suburb,setSuburb]=useState("All suburbs");

  const results=useMemo(()=>{
    if(!query.trim()) return [];
    const q=query.toLowerCase();
    return allListings.filter(l=>l.name.toLowerCase().includes(q)||l.suburb.toLowerCase().includes(q)||l.tagline.toLowerCase().includes(q)||l.tags.some(t=>t.toLowerCase().includes(q)));
  },[query]);

  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      <div className="pt-6 pb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{color:C.sub}}>Your beauty directory</p>
        <h1 className="text-[52px] font-light leading-none tracking-tight" style={{fontFamily:SERIF,color:C.text}}>Au<em>ra</em></h1>
        <p className="text-[13px] font-light mt-2 tracking-widest" style={{color:C.sub}}>Discover · Book · Glow</p>
      </div>

      {/* Search */}
      <div className="mt-5 mb-2 relative">
        <div className="flex items-center gap-3 rounded-[14px] px-4 py-3.5"
          style={{background:C.surface,border:`1px solid ${showSearch?C.bronze:C.border}`,transition:"border-color 0.2s"}}>
          <Search size={15} color={showSearch?C.bronze:C.hint} strokeWidth={1.5}/>
          <input className="flex-1 text-[13px] font-light tracking-wide bg-transparent border-none outline-none"
            style={{color:C.text,caretColor:C.bronze}}
            placeholder="Salons, artists, treatments…"
            value={query} onFocus={()=>setShowSearch(true)} onChange={e=>setQuery(e.target.value)}/>
          {query
            ? <button onClick={()=>{setQuery("");setShowSearch(false);}} className="bg-transparent border-none cursor-pointer p-0"><X size={14} color={C.hint} strokeWidth={1.5}/></button>
            : <button onClick={()=>setShowLocation(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border-none cursor-pointer transition-opacity hover:opacity-80"
                style={{background:"#E0D8CC"}}>
                <MapPin size={11} color={C.bronze} strokeWidth={1.5}/>
                <span className="text-[10px] font-medium tracking-[0.12em] uppercase" style={{color:C.dark}}>{suburb==="All suburbs"?"Near me":suburb}</span>
              </button>
          }
        </div>
        {showSearch&&query&&(
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-[16px] overflow-hidden z-40"
            style={{background:C.cream,border:`1px solid ${C.border}`,boxShadow:"0 8px 24px rgba(0,0,0,0.1)"}}>
            {results.length===0
              ? <p className="text-[13px] text-center py-5" style={{color:C.hint}}>No results for "{query}"</p>
              : results.slice(0,5).map(l=>(
                <div key={l.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{borderBottom:`1px solid ${C.border}`}}
                  onClick={()=>{onNavigate("detail",l.id);setQuery("");setShowSearch(false);}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:C.muted}}>
                    <Leaf size={14} color={C.sub} strokeWidth={1.4}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-normal" style={{fontFamily:SERIF,color:C.text}}>{l.name}</p>
                    <p className="text-[11px]" style={{color:C.sub}}>{l.suburb}</p>
                  </div>
                  <Star size={10} color={C.bronze} strokeWidth={1.5}/>
                  <span className="text-[12px] font-medium" style={{color:C.text}}>{l.rating.toFixed(1)}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {(!showSearch||!query)&&(
        <>
          <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5 mt-5" style={{color:C.sub}}>Browse by category</p>
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            {categories.map(cat=>(
              <CategoryCard key={cat.id} {...cat} onClick={()=>onNavigate("category",cat.id)}/>
            ))}
          </div>
          <p className="text-[10px] tracking-[0.22em] uppercase mb-3.5" style={{color:C.sub}}>Featured this week</p>
          <div className="flex flex-col gap-3 pb-2">
            {featured.map((biz,i)=>(
              <div key={biz.id} onClick={()=>onNavigate("detail",biz.id)}
                className="rounded-[18px] p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{background:C.muted,border:`1px solid ${C.border}`}}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:"#D4C9B8",border:`1px solid ${C.divider}`}}>
                    <Leaf size={22} color={C.sub} strokeWidth={1.4}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    {i===0&&<span className="text-[9px] tracking-[0.18em] uppercase font-medium block mb-0.5" style={{color:C.sub}}>Editor's pick</span>}
                    <p className="text-[19px] font-normal leading-tight" style={{fontFamily:SERIF,color:C.text}}>{biz.name}</p>
                    <p className="text-[11px] font-light mt-0.5 tracking-wide" style={{color:C.sub}}>{biz.category} · {biz.suburb}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end"><Star size={11} color={C.sub} strokeWidth={1.5}/><span className="text-[13px] font-medium" style={{color:C.text}}>{biz.rating.toFixed(1)}</span></div>
                    <p className="text-[10px] mt-0.5" style={{color:C.sub}}>{biz.reviews} reviews</p>
                  </div>
                </div>
                <div className="h-px my-3" style={{background:C.divider}}/>
                <div className="flex flex-wrap gap-2">{biz.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Location sheet */}
      {showLocation&&(
        <Sheet title="Choose location" onClose={()=>setShowLocation(false)}>
          <div className="flex flex-col gap-1">
            {SUBURBS.map(s=>(
              <button key={s} onClick={()=>{setSuburb(s);setShowLocation(false);}}
                className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer transition-colors"
                style={{background:suburb===s?C.muted:"transparent",border:`1px solid ${suburb===s?C.border:"transparent"}`}}>
                <span className="text-[14px]" style={{color:C.text}}>{s}</span>
                {suburb===s&&<Check size={15} color={C.bronze} strokeWidth={2}/>}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── Category screen ──────────────────────────────────────────────────────────
function ServiceRow({listing,onTap,onBook,savedIds,onToggleSave}) {
  const saved=savedIds.has(listing.id);
  return (
    <div className="rounded-[18px] p-4 cursor-pointer transition-all duration-150 hover:scale-[1.005] active:scale-[0.99]"
      style={{background:C.muted,border:`1px solid ${C.border}`}} onClick={()=>onTap(listing.id)}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#D4C9B8",border:`1px solid ${C.divider}`}}>
          <Leaf size={18} color={C.sub} strokeWidth={1.4}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-normal leading-tight" style={{fontFamily:SERIF,color:C.text}}>{listing.name}</p>
              <p className="text-[11px] font-light mt-0.5 leading-snug" style={{color:C.sub}}>{listing.tagline}</p>
            </div>
            <button onClick={e=>{e.stopPropagation();onToggleSave(listing.id);}} className="mt-0.5 bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
              <Heart size={15} strokeWidth={1.5} color={saved?"#B5916A":C.hint} fill={saved?"#B5916A":"none"}/>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1"><MapPin size={10} color={C.sub} strokeWidth={1.5}/><span className="text-[11px]" style={{color:C.sub}}>{listing.suburb}</span></div>
            <div className="flex items-center gap-1"><Star size={10} color={C.bronze} strokeWidth={1.5}/><span className="text-[12px] font-medium" style={{color:C.text}}>{listing.rating.toFixed(1)}</span><span className="text-[11px]" style={{color:C.sub}}>({listing.reviews})</span></div>
            <div className="flex items-center gap-1"><Clock size={10} color={C.sub} strokeWidth={1.5}/><span className="text-[11px]" style={{color:C.sub}}>{listing.wait}</span></div>
          </div>
        </div>
      </div>
      <div className="h-px my-3" style={{background:C.divider}}/>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {listing.tags.slice(0,2).map(t=><Tag key={t}>{t}</Tag>)}
          <span className="text-[11px] rounded-full px-3 py-1" style={{border:`1px solid ${C.divider}`,color:C.bronze}}>{listing.price}</span>
        </div>
        <button onClick={e=>{e.stopPropagation();onBook(listing);}}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium tracking-wide flex-shrink-0 hover:opacity-80 active:opacity-60 transition-opacity"
          style={{background:C.text,color:C.cream,border:"none",cursor:"pointer"}}>
          Book <ArrowUpRight size={11} strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

function CategoryScreen({catId,onBack,onBook,onDetail,savedIds,onToggleSave}) {
  const cat=categories.find(c=>c.id===catId);
  const items=listings[catId]||[];
  const [filter,setFilter]=useState("All");
  const [query,setQuery]=useState("");
  const [sort,setSort]=useState("Recommended");
  const [showSort,setShowSort]=useState(false);
  const [showLocation,setShowLocation]=useState(false);
  const [suburb,setSuburb]=useState("All suburbs");
  const FILTERS=["All","Top rated","Available today"];

  const filtered=useMemo(()=>{
    let r=items.filter(l=>{
      const mf=filter==="Top rated"?l.rating>=4.8:filter==="Available today"?l.wait==="Today":true;
      const mq=!query.trim()||l.name.toLowerCase().includes(query.toLowerCase())||l.suburb.toLowerCase().includes(query.toLowerCase());
      const ms=suburb==="All suburbs"||l.suburb.toLowerCase().includes(suburb.toLowerCase());
      return mf&&mq&&ms;
    });
    if(sort==="Top rated") r=[...r].sort((a,b)=>b.rating-a.rating);
    else if(sort==="Name A–Z") r=[...r].sort((a,b)=>a.name.localeCompare(b.name));
    else if(sort==="Price: Low–High") r=[...r].sort((a,b)=>a.price.length-b.price.length);
    return r;
  },[items,filter,query,sort,suburb]);

  return (
    <div className="flex-1 overflow-y-auto aura-scroll pb-4 relative">
      <div className="px-6 pt-5 pb-7" style={{background:cat.bg}}>
        <button onClick={onBack} className="flex items-center gap-1 mb-5 bg-transparent border-none cursor-pointer p-0" style={{color:"rgba(253,251,247,0.8)"}}>
          <ChevronLeft size={18} strokeWidth={1.5}/><span className="text-[12px] tracking-[0.1em] uppercase">Back</span>
        </button>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-1" style={{color:"rgba(253,251,247,0.6)"}}>Category</p>
            <h2 className="text-[46px] font-light leading-none" style={{fontFamily:SERIF,color:"#FDFBF7"}}>{cat.label}</h2>
            <p className="text-[12px] mt-1.5" style={{color:"rgba(253,251,247,0.65)"}}>{cat.count} listings in Adelaide</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{background:"rgba(253,251,247,0.18)"}}>
            <cat.Icon size={22} color="rgba(253,251,247,0.85)" strokeWidth={1.5}/>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-6 pt-4 pb-3 overflow-x-auto" style={{scrollbarWidth:"none"}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className="rounded-full px-4 py-1.5 text-[11px] tracking-wide whitespace-nowrap transition-colors"
            style={{border:`1px solid ${filter===f?C.text:C.border}`,background:filter===f?C.text:"transparent",color:filter===f?C.cream:C.dark,cursor:"pointer"}}>
            {f}
          </button>
        ))}
      </div>

      {/* Search + location */}
      <div className="mx-6 mb-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 rounded-[14px] px-4 py-3"
          style={{background:C.surface,border:`1px solid ${query?C.bronze:C.border}`,transition:"border-color 0.2s"}}>
          <Search size={14} color={query?C.bronze:C.hint} strokeWidth={1.5}/>
          <input className="flex-1 text-[13px] font-light bg-transparent border-none outline-none"
            style={{color:C.text,caretColor:C.bronze}}
            placeholder={`Search ${cat.label.toLowerCase()}…`}
            value={query} onChange={e=>setQuery(e.target.value)}/>
          {query&&<button onClick={()=>setQuery("")} className="bg-transparent border-none cursor-pointer p-0"><X size={13} color={C.hint} strokeWidth={1.5}/></button>}
        </div>
        <button onClick={()=>setShowLocation(true)}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center border-none cursor-pointer transition-colors hover:opacity-80"
          style={{background:suburb!=="All suburbs"?C.text:C.surface,border:`1px solid ${C.border}`,flexShrink:0}}>
          <MapPin size={15} color={suburb!=="All suburbs"?C.cream:C.sub} strokeWidth={1.5}/>
        </button>
      </div>

      {/* Sort row */}
      <div className="px-6 mb-3 flex items-center justify-between">
        <p className="text-[10px] tracking-[0.2em] uppercase" style={{color:C.sub}}>{filtered.length} {filtered.length===1?"result":"results"}</p>
        <button onClick={()=>setShowSort(true)}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity">
          <SlidersHorizontal size={12} color={C.bronze} strokeWidth={1.5}/>
          <span className="text-[11px]" style={{color:C.bronze}}>Sort: {sort}</span>
          <ChevronDown size={11} color={C.bronze} strokeWidth={1.5}/>
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-2">
        {filtered.length>0
          ? filtered.map(l=><ServiceRow key={l.id} listing={l} onTap={onDetail} onBook={onBook} savedIds={savedIds} onToggleSave={onToggleSave}/>)
          : <p className="text-[13px] text-center py-10" style={{color:C.hint}}>No results. Try adjusting your filters.</p>
        }
      </div>

      {showSort&&(
        <Sheet title="Sort by" onClose={()=>setShowSort(false)}>
          {SORT_OPTS.map(o=>(
            <button key={o} onClick={()=>{setSort(o);setShowSort(false);}}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{background:sort===o?C.muted:"transparent",border:`1px solid ${sort===o?C.border:"transparent"}`,marginBottom:4}}>
              <span className="text-[14px]" style={{color:C.text}}>{o}</span>
              {sort===o&&<Check size={15} color={C.bronze} strokeWidth={2}/>}
            </button>
          ))}
        </Sheet>
      )}

      {showLocation&&(
        <Sheet title="Filter by suburb" onClose={()=>setShowLocation(false)}>
          {SUBURBS.map(s=>(
            <button key={s} onClick={()=>{setSuburb(s);setShowLocation(false);}}
              className="flex items-center justify-between w-full rounded-[12px] px-4 py-3.5 text-left border-none cursor-pointer"
              style={{background:suburb===s?C.muted:"transparent",border:`1px solid ${suburb===s?C.border:"transparent"}`,marginBottom:4}}>
              <span className="text-[14px]" style={{color:C.text}}>{s}</span>
              {suburb===s&&<Check size={15} color={C.bronze} strokeWidth={2}/>}
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

// ─── Detail screen ────────────────────────────────────────────────────────────
function DetailScreen({listingId,onBack,onBook,savedIds,onToggleSave}) {
  const l=allListings.find(x=>x.id===listingId);
  const cat=categories.find(c=>listings[c.id]?.some(x=>x.id===listingId));
  const saved=savedIds.has(l.id);
  if(!l) return null;
  return (
    <div className="flex-1 overflow-y-auto aura-scroll pb-4">
      <div className="px-6 pt-5 pb-8" style={{background:cat?.bg||C.sage}}>
        <button onClick={onBack} className="flex items-center gap-1 mb-5 bg-transparent border-none cursor-pointer p-0" style={{color:"rgba(253,251,247,0.8)"}}>
          <ChevronLeft size={18} strokeWidth={1.5}/><span className="text-[12px] tracking-[0.1em] uppercase">Back</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-[34px] font-light leading-tight" style={{fontFamily:SERIF,color:"#FDFBF7"}}>{l.name}</h2>
            <p className="text-[13px] font-light mt-1" style={{color:"rgba(253,251,247,0.7)"}}>{l.tagline}</p>
            <div className="flex items-center gap-2 mt-3">
              <Star size={12} color="rgba(253,251,247,0.9)" strokeWidth={1.5} fill="rgba(253,251,247,0.4)"/>
              <span className="text-[13px] font-medium" style={{color:"#FDFBF7"}}>{l.rating.toFixed(1)}</span>
              <span className="text-[12px]" style={{color:"rgba(253,251,247,0.6)"}}>({l.reviews} reviews)</span>
            </div>
          </div>
          <button onClick={()=>onToggleSave(l.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer"
            style={{background:"rgba(253,251,247,0.18)"}}>
            <Heart size={17} strokeWidth={1.5} color="#FDFBF7" fill={saved?"#FDFBF7":"none"}/>
          </button>
        </div>
      </div>
      <div className="px-6">
        <div className="flex gap-3 py-4 overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {[{Icon:MapPin,text:l.suburb},{Icon:Clock,text:`Next: ${l.wait}`},{Icon:BookOpen,text:l.price}].map(({Icon,text})=>(
            <div key={text} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0"
              style={{background:C.muted,border:`1px solid ${C.border}`}}>
              <Icon size={12} color={C.bronze} strokeWidth={1.5}/>
              <span className="text-[11px]" style={{color:C.dark}}>{text}</span>
            </div>
          ))}
        </div>
        <div className="h-px" style={{background:C.divider}}/>
        <div className="py-5">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{color:C.sub}}>About</p>
          <p className="text-[14px] font-light leading-relaxed" style={{color:C.text}}>{l.about}</p>
        </div>
        <div className="h-px" style={{background:C.divider}}/>
        <div className="py-5">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{color:C.sub}}>Specialities</p>
          <div className="flex flex-wrap gap-2">{l.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
        </div>
        <div className="h-px" style={{background:C.divider}}/>
        <div className="py-5">
          <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{color:C.sub}}>Contact</p>
          <div className="flex flex-col gap-3">
            <button onClick={()=>window.open(`tel:${l.phone}`)}
              className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:C.muted}}><Phone size={14} color={C.bronze} strokeWidth={1.5}/></div>
              <span className="text-[13px] flex-1" style={{color:C.text}}>{l.phone}</span>
              <ChevronRight size={14} color={C.hint} strokeWidth={1.5}/>
            </button>
            <button onClick={()=>window.open(l.bookingUrl,"_blank")}
              className="flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer p-0 hover:opacity-70 transition-opacity">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:C.muted}}><Globe size={14} color={C.bronze} strokeWidth={1.5}/></div>
              <span className="text-[13px] truncate flex-1" style={{color:C.text}}>{l.bookingUrl.replace("https://www.","")}</span>
              <ChevronRight size={14} color={C.hint} strokeWidth={1.5}/>
            </button>
          </div>
        </div>
        <button onClick={()=>onBook(l)}
          className="w-full rounded-[16px] py-4 text-[14px] font-medium flex items-center justify-center gap-2 hover:opacity-85 active:opacity-70 transition-opacity mb-2"
          style={{background:C.text,color:C.cream,border:"none",cursor:"pointer",letterSpacing:"0.14em"}}>
          Book an appointment <ArrowUpRight size={15} strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
}

// ─── Saved screen ─────────────────────────────────────────────────────────────
function SavedScreen({savedIds,onDetail,onToggleSave,onNavigate}) {
  const saved=allListings.filter(l=>savedIds.has(l.id));
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{color:C.sub}}>Your collection</p>
        <h2 className="text-[38px] font-light leading-none" style={{fontFamily:SERIF,color:C.text}}>Saved</h2>
      </div>
      {saved.length===0
        ? <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Heart size={32} color={C.border} strokeWidth={1}/>
            <p className="text-[14px]" style={{color:C.hint}}>No saved businesses yet.</p>
            <p className="text-[12px] text-center" style={{color:C.hint}}>Tap ♡ on any listing to save it here.</p>
            <button onClick={()=>onNavigate("home")}
              className="mt-2 rounded-full px-5 py-2 text-[12px] tracking-wide hover:opacity-80 transition-opacity"
              style={{background:C.text,color:C.cream,border:"none",cursor:"pointer"}}>
              Browse categories
            </button>
          </div>
        : <div className="flex flex-col gap-3">
            {saved.map(l=>(
              <div key={l.id} className="rounded-[18px] p-4 cursor-pointer hover:scale-[1.005] active:scale-[0.99] transition-all"
                style={{background:C.muted,border:`1px solid ${C.border}`}} onClick={()=>onDetail(l.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#D4C9B8",border:`1px solid ${C.divider}`}}>
                    <Leaf size={16} color={C.sub} strokeWidth={1.4}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-normal" style={{fontFamily:SERIF,color:C.text}}>{l.name}</p>
                    <p className="text-[11px] mt-0.5" style={{color:C.sub}}>{l.suburb} · {l.tagline}</p>
                  </div>
                  <button onClick={e=>{e.stopPropagation();onToggleSave(l.id);}} className="bg-transparent border-none cursor-pointer p-0 flex-shrink-0">
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

// ─── Book screen ──────────────────────────────────────────────────────────────
function BookScreen({onNavigate}) {
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{color:C.sub}}>Your schedule</p>
        <h2 className="text-[38px] font-light leading-none" style={{fontFamily:SERIF,color:C.text}}>Bookings</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <CalendarDays size={32} color={C.border} strokeWidth={1}/>
        <p className="text-[14px]" style={{color:C.hint}}>No upcoming bookings.</p>
        <p className="text-[12px] text-center" style={{color:C.hint}}>Browse a category and tap Book to get started.</p>
        <button onClick={()=>onNavigate("home")}
          className="mt-3 rounded-full px-5 py-2.5 text-[12px] tracking-wide hover:opacity-80 transition-opacity"
          style={{background:C.text,color:C.cream,border:"none",cursor:"pointer"}}>
          Browse services
        </button>
      </div>
    </div>
  );
}

// ─── Profile screen ───────────────────────────────────────────────────────────
function ProfileScreen({savedCount}) {
  const [sheet,setSheet]=useState(null);
  const [notifications,setNotifications]=useState({bookings:true,offers:false,reminders:true});
  const menuItems=[
    {id:"prefs",  Icon:Settings,   label:"Preferences",    desc:"Manage your app settings"},
    {id:"notifs", Icon:Bell,       label:"Notifications",  desc:"Control your alerts"},
    {id:"help",   Icon:HelpCircle, label:"Help & support", desc:"FAQs and contact us"},
    {id:"about",  Icon:Info,       label:"About Aura",     desc:"Version 1.0.0"},
  ];
  return (
    <div className="flex-1 overflow-y-auto aura-scroll px-6 pb-4 relative">
      <div className="pt-6 pb-5">
        <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{color:C.sub}}>Your account</p>
        <h2 className="text-[38px] font-light leading-none" style={{fontFamily:SERIF,color:C.text}}>Profile</h2>
      </div>
      <div className="flex flex-col items-center py-5 gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{background:C.muted,border:`1px solid ${C.border}`}}>
          <User size={32} color={C.sub} strokeWidth={1}/>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-light" style={{fontFamily:SERIF,color:C.text}}>Guest User</p>
          <p className="text-[12px] mt-0.5" style={{color:C.sub}}>Adelaide, SA</p>
        </div>
        <button onClick={()=>setSheet("signin")}
          className="rounded-full px-5 py-2 text-[12px] tracking-wide transition-opacity hover:opacity-80"
          style={{background:C.text,color:C.cream,border:"none",cursor:"pointer"}}>
          Sign in or create account
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{label:"Saved",value:savedCount},{label:"Booked",value:"0"},{label:"Reviews",value:"0"}].map(s=>(
          <div key={s.label} className="rounded-[14px] p-3 text-center" style={{background:C.muted,border:`1px solid ${C.border}`}}>
            <p className="text-[22px] font-light" style={{fontFamily:SERIF,color:C.text}}>{s.value}</p>
            <p className="text-[10px] tracking-[0.14em] uppercase mt-0.5" style={{color:C.sub}}>{s.label}</p>
          </div>
        ))}
      </div>
      {menuItems.map(item=>(
        <button key={item.id} onClick={()=>setSheet(item.id)}
          className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70 transition-opacity"
          style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-3">
            <item.Icon size={16} color={C.sub} strokeWidth={1.5}/>
            <span className="text-[14px]" style={{color:C.text}}>{item.label}</span>
          </div>
          <ChevronRight size={15} color={C.hint} strokeWidth={1.5}/>
        </button>
      ))}

      {sheet==="signin"&&(
        <Sheet title="Sign in to Aura" onClose={()=>setSheet(null)}>
          <div className="flex flex-col gap-4 pt-2">
            {["Email address","Password"].map(p=>(
              <div key={p}>
                <p className="text-[10px] tracking-[0.16em] uppercase mb-2" style={{color:C.sub}}>{p}</p>
                <input type={p==="Password"?"password":"email"}
                  className="w-full rounded-[12px] px-4 py-3 text-[14px] bg-transparent border-none outline-none"
                  style={{background:C.muted,border:`1px solid ${C.border}`,color:C.text}}
                  placeholder={p==="Password"?"••••••••":"you@example.com"}/>
              </div>
            ))}
            <button onClick={()=>setSheet(null)}
              className="w-full rounded-[14px] py-3.5 text-[13px] font-medium tracking-wide mt-1 hover:opacity-85 transition-opacity"
              style={{background:C.text,color:C.cream,border:"none",cursor:"pointer"}}>
              Sign in
            </button>
            <button onClick={()=>setSheet(null)}
              className="text-[12px] text-center bg-transparent border-none cursor-pointer hover:opacity-70"
              style={{color:C.sub}}>Create a new account</button>
          </div>
        </Sheet>
      )}
      {sheet==="prefs"&&(
        <Sheet title="Preferences" onClose={()=>setSheet(null)}>
          {[{label:"Dark mode",sub:"Use dark theme"},{label:"Location services",sub:"Allow location access"},{label:"Analytics",sub:"Help improve Aura"}].map(p=>(
            <div key={p.label} className="flex items-center justify-between py-4" style={{borderBottom:`1px solid ${C.border}`}}>
              <div><p className="text-[14px]" style={{color:C.text}}>{p.label}</p><p className="text-[11px] mt-0.5" style={{color:C.sub}}>{p.sub}</p></div>
              <div className="w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer" style={{background:C.muted,border:`1px solid ${C.border}`}}>
                <div className="w-5 h-5 rounded-full" style={{background:C.hint}}/>
              </div>
            </div>
          ))}
        </Sheet>
      )}
      {sheet==="notifs"&&(
        <Sheet title="Notifications" onClose={()=>setSheet(null)}>
          {[{key:"bookings",label:"Booking reminders",sub:"Remind me before appointments"},{key:"offers",label:"Special offers",sub:"Deals from saved businesses"},{key:"reminders",label:"Review requests",sub:"After your appointment"}].map(n=>(
            <div key={n.key} className="flex items-center justify-between py-4" style={{borderBottom:`1px solid ${C.border}`}}>
              <div><p className="text-[14px]" style={{color:C.text}}>{n.label}</p><p className="text-[11px] mt-0.5" style={{color:C.sub}}>{n.sub}</p></div>
              <button onClick={()=>setNotifications(p=>({...p,[n.key]:!p[n.key]}))}
                className="w-10 h-6 rounded-full flex items-center px-0.5 border-none cursor-pointer transition-colors"
                style={{background:notifications[n.key]?C.sage:C.muted,justifyContent:notifications[n.key]?"flex-end":"flex-start"}}>
                <div className="w-5 h-5 rounded-full" style={{background:notifications[n.key]?"#FDFBF7":C.hint}}/>
              </button>
            </div>
          ))}
        </Sheet>
      )}
      {sheet==="help"&&(
        <Sheet title="Help & support" onClose={()=>setSheet(null)}>
          {["How do I book an appointment?","How do I save a business?","Can I cancel a booking?","How do I leave a review?","Contact support"].map(q=>(
            <button key={q} onClick={()=>{}} className="flex items-center justify-between w-full py-4 bg-transparent border-none cursor-pointer text-left hover:opacity-70" style={{borderBottom:`1px solid ${C.border}`}}>
              <span className="text-[13px]" style={{color:C.text}}>{q}</span>
              <ChevronRight size={14} color={C.hint} strokeWidth={1.5}/>
            </button>
          ))}
        </Sheet>
      )}
      {sheet==="about"&&(
        <Sheet title="About Aura" onClose={()=>setSheet(null)}>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center" style={{background:C.muted,border:`1px solid ${C.border}`}}>
              <Sparkles size={28} color={C.sage} strokeWidth={1.2}/>
            </div>
            <p className="text-[32px] font-light" style={{fontFamily:SERIF,color:C.text}}>Aura</p>
            <p className="text-[12px]" style={{color:C.sub}}>Version 1.0.0 · Adelaide, SA</p>
            <p className="text-[13px] font-light leading-relaxed mt-2" style={{color:C.text}}>
              Aura is Adelaide's premium beauty directory — connecting you with the city's finest salons, spas, and beauty studios.
            </p>
            <div className="h-px w-full mt-2" style={{background:C.border}}/>
            {["Privacy policy","Terms of service","Licences"].map(l=>(
              <button key={l} className="text-[13px] bg-transparent border-none cursor-pointer hover:opacity-70" style={{color:C.bronze}}>{l}</button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AuraApp() {
  const [screen,     setScreen]     = useState("home");
  const [catId,      setCatId]      = useState(null);
  const [detailId,   setDetailId]   = useState(null);
  const [activeNav,  setActiveNav]  = useState("home");
  const [bookingBiz, setBookingBiz] = useState(null);
  const [savedIds,   setSavedIds]   = useState(new Set());

  function navigate(to, id=null) {
    setScreen(to);
    if(to==="category"){ setCatId(id); setDetailId(null); }
    if(to==="detail")  { setDetailId(id); }
    if(to==="home")    { setCatId(null); setDetailId(null); setActiveNav("home"); }
  }

  function goBack() {
    if(screen==="detail"&&catId){ setScreen("category"); setDetailId(null); }
    else { navigate("home"); }
  }

  function handleBook(listing) {
    setBookingBiz(listing);
    setTimeout(()=>setBookingBiz(null),4000);
  }

  function toggleSave(id) {
    setSavedIds(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function handleNavTap(id) {
    setActiveNav(id); setBookingBiz(null);
    if(id==="home")   { navigate("home"); }
    else if(id==="saved")   { setScreen("saved");   setCatId(null); setDetailId(null); }
    else if(id==="book")    { setScreen("booking"); setCatId(null); setDetailId(null); }
    else if(id==="profile") { setScreen("profile"); setCatId(null); setDetailId(null); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .aura-scroll::-webkit-scrollbar{display:none;}
        .aura-scroll{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>
      <div className="flex items-center justify-center min-h-screen w-full py-8" style={{background:"#E8E2D8"}}>
        <div className="relative flex flex-col rounded-[44px] overflow-hidden"
          style={{width:390,maxHeight:844,background:C.cream,border:`1px solid ${C.border}`,boxShadow:"0 24px 64px rgba(0,0,0,0.14)"}}>
          <StatusBar/>
          {screen==="home"     && <HomeScreen     onNavigate={navigate} savedIds={savedIds} onToggleSave={toggleSave}/>}
          {screen==="category" && catId && <CategoryScreen catId={catId} onBack={()=>navigate("home")} onBook={handleBook} onDetail={id=>{ setCatId(catId); navigate("detail",id); }} savedIds={savedIds} onToggleSave={toggleSave}/>}
          {screen==="detail"   && detailId && <DetailScreen listingId={detailId} onBack={goBack} onBook={handleBook} savedIds={savedIds} onToggleSave={toggleSave}/>}
          {screen==="saved"    && <SavedScreen savedIds={savedIds} onDetail={id=>{navigate("detail",id);}} onToggleSave={toggleSave} onNavigate={navigate}/>}
          {screen==="booking"  && <BookScreen onNavigate={navigate}/>}
          {screen==="profile"  && <ProfileScreen savedCount={savedIds.size}/>}
          <NavBar activeNav={activeNav} onNavTap={handleNavTap}/>
          {bookingBiz&&<BookingToast business={bookingBiz} onClose={()=>setBookingBiz(null)}/>}
        </div>
      </div>
    </>
  );
}
