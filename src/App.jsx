import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// CONFIGURACIÓN — REEMPLAZA ESTOS DOS VALORES CON LOS TUYOS
// ============================================================
const SUPABASE_URL = "https://zjmqpylfpvawzrogycqi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbXFweWxmcHZhd3pyb2d5Y3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDIwNzQsImV4cCI6MjA5Njc3ODA3NH0.O0q9-k-dhuIXI0LEQ9WTvz2ekIkaALjrs_C-WDb3rRk";
// ============================================================

const WHATSAPP_NUMBER = "50368496398";
const INSTAGRAM_URL = "https://instagram.com/pitstopelsalvador";
const ADMIN_PASSWORD = "Pitstopsv3110!";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function storeGet(key) {
  try {
    const { data } = await supabase.from("store").select("value").eq("key", key).maybeSingle();
    return data ? data.value : null;
  } catch (e) { return null; }
}
async function storeSet(key, value) {
  try {
    const { error } = await supabase.from("store").upsert({ key, value }, { onConflict: "key" });
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, msg: String(e && e.message ? e.message : e) };
  }
}
async function storeDel(key) {
  try { await supabase.from("store").delete().eq("key", key); } catch (e) {}
}

// Carga el catálogo desde los registros individuales (pitstop_prod_*),
// ordenados según pitstop_products_order. Si aún no existen (antes de la
// migración), devuelve null para que el sitio use el registro antiguo.
async function loadProductsSplit() {
  try {
    const { data: o } = await supabase.from("store").select("value").eq("key", "pitstop_products_order").maybeSingle();
    if (!o || !o.value) return null;
    let order = [];
    try { order = JSON.parse(o.value).map(String); } catch (e) { return null; }
    if (order.length === 0) return [];
    const keys = order.map(id => "pitstop_prod_" + id);
    const { data, error } = await supabase.from("store").select("key, value").in("key", keys);
    if (error || !data) return null;
    const byId = {};
    data.forEach(r => {
      try { const p = JSON.parse(r.value); byId[String(p.id)] = p; } catch (e) {}
    });
    return order.map(id => byId[id]).filter(Boolean);
  } catch (e) { return null; }
}

const compressImage = (file, maxW = 1000, type = "image/jpeg", quality = 0.82) => new Promise((resolve) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const scale = Math.min(1, maxW / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL(type, quality));
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    const r = new FileReader();
    r.onload = ev => resolve(ev.target.result);
    r.readAsDataURL(file);
  };
  img.src = url;
});

const DEFAULT_CATEGORIES = ["Camisas", "Gorras", "Botellas", "Bolsones", "Suéteres", "Accesorios"];
const DEFAULT_GENDERS = ["Hombre", "Mujer", "Unisex"];
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL", "Onesize"];
const DEFAULT_TEAMS = [
  { name: "Red Bull Racing", image: "" }, { name: "Ferrari", image: "" }, { name: "McLaren", image: "" },
  { name: "Mercedes-AMG", image: "" }, { name: "Aston Martin", image: "" }, { name: "Alpine", image: "" },
  { name: "Williams", image: "" }, { name: "Haas", image: "" }, { name: "RB", image: "" },
  { name: "Sauber", image: "" }, { name: "Cadillac", image: "" }
];
const DEFAULT_DRIVERS = [
  { name: "Max Verstappen", image: "" }, { name: "Charles Leclerc", image: "" }, { name: "Lewis Hamilton", image: "" },
  { name: "Lando Norris", image: "" }, { name: "Oscar Piastri", image: "" }, { name: "George Russell", image: "" },
  { name: "Sergio Pérez", image: "" }, { name: "Carlos Sainz", image: "" }, { name: "Fernando Alonso", image: "" }
];

const F_HEAD = "'Archivo', 'Inter', system-ui, sans-serif";
const F_BODY = "'Inter', system-ui, -apple-system, sans-serif";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,600;0,700;0,800;0,900;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-font-smoothing:antialiased}
html{scroll-behavior:smooth}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fadeup{animation:fadeUp .7s cubic-bezier(.2,.8,.2,1) both}
.fadeup.d1{animation-delay:.08s}.fadeup.d2{animation-delay:.18s}.fadeup.d3{animation-delay:.28s}.fadeup.d4{animation-delay:.38s}
::selection{background:#E10600;color:#fff}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:#0B0B0C}
::-webkit-scrollbar-thumb{background:#27272A;border-radius:5px}
.pcard{transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .3s,box-shadow .3s}
.pcard:hover{transform:translateY(-4px);border-color:#3F3F46;box-shadow:0 14px 30px -16px rgba(0,0,0,.6)}
.pcard img{transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.pcard:hover img{transform:scale(1.05)}
@media (max-width:640px){.pgrid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}}
.zoomhint{opacity:0;transition:opacity .25s}
.pcard:hover .zoomhint{opacity:1}
@media (hover:hover){.carbtn{opacity:0;transition:opacity .25s}.pcard:hover .carbtn{opacity:1}.lbnav{opacity:.7}.lbnav:hover{opacity:1}}
.navbtn{transition:color .2s}
.navbtn:hover{color:#fff !important}
.ditem{transition:background .15s,color .15s}
.ditem:hover{background:#19191C}
.btnp{transition:background .2s,transform .2s,box-shadow .2s}
.btnp:hover{background:#C40500 !important;transform:translateY(-1px)}
.btng{transition:border-color .2s,color .2s,transform .2s}
.btng:hover{border-color:#52525B !important;color:#fff !important;transform:translateY(-1px)}
.btnwa{transition:filter .2s}
.btnwa:hover{filter:brightness(1.07)}
.faqq:hover .faqplus{color:#E10600}
.ftlink{transition:color .2s;cursor:pointer}
.ftlink:hover{color:#fff !important}
.statitem:not(:last-child){border-right:1px solid #1E1E22}
.standrow{justify-content:center}
@media (max-width:860px){.standrow{justify-content:flex-start}}
.standitem{transition:border-color .2s,background .2s}
.standitem:hover{border-color:#E10600;background:#17171B}
.srch::placeholder{color:#52525B}
.srch:focus{border-color:#52525B !important}
.newsrow{transition:border-color .2s,transform .2s}
.newsrow:hover{border-color:#3F3F46;transform:translateY(-2px)}
.tickertrack{display:inline-flex;white-space:nowrap;will-change:transform;animation:ticker 40s linear infinite}
.prodtrack{display:flex;width:max-content;will-change:transform;animation:prodscroll linear infinite}
@keyframes prodscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.prodticker:hover .prodtrack,.prodticker:active .prodtrack{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.prodtrack{animation:none}.prodticker{overflow-x:auto}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.tickertrack{animation:none}}
@media (max-width:767px){.statitem:not(:last-child){border-right:none}}
`;

const defaultContent = {
  brandName1: "PIT STOP", brandName2: "SV",
  topBarMessages: ["Envíos a todo El Salvador", "Síguenos en Instagram — @pitstopelsalvador", "Atención personalizada por WhatsApp"],
  heroBadge: "Merch oficial de Fórmula 1",
  heroTitle1: "Tu parada obligatoria para el mejor", heroTitleHighlight: "merch de F1",
  heroSubtitle: "Camisas, gorras, botellas, bolsones y más. Los mejores productos de la Fórmula 1 en El Salvador.",
  trustItems: ["Productos 100% originales", "Envío 24–48 h a todo El Salvador", "Pedido directo por WhatsApp", "Atención personalizada"],
  statsTitle1: "", statsTitleHighlight: "",
  navCatalog: "Catálogo", navTeams: "Escuderías", navDrivers: "Pilotos", navAbout: "Sobre Nosotros",
  teamsTitle1: "Compra por", teamsTitleHighlight: "Escudería",
  driversTitle1: "Compra por", driversTitleHighlight: "Piloto",
  newTitle1: "Nuevos en la", newTitleHighlight: "tienda",
  featuredTitle1: "Productos", featuredTitleHighlight: "destacados",
  catalogTitle1: "Nuestro", catalogTitleHighlight: "catálogo",   saleTitle1: "En", saleTitleHighlight: "oferta",
  aboutTitle1: "Sobre", aboutTitleHighlight: "nosotros",
  aboutTagline: "Pasión por la Fórmula 1",
  aboutText: "Pit Stop El Salvador nació de la pasión que compartimos por la Fórmula 1 y el deseo de acercar el mejor merchandising a los fans salvadoreños. Lo que comenzó como una pequeña tienda en Instagram, hoy es una comunidad de más de 3,785 aficionados que confían en nosotros para vestir los colores de su escudería favorita.\n\nNos enorgullece ofrecer productos de calidad, atención personalizada y envíos a todo El Salvador. Cada pedido es atendido directamente por nosotros, porque sabemos que detrás de cada compra hay un fan que vive cada carrera con la misma intensidad que nosotros.",
  aboutHighlights: [
    { icon: "", val: "2023", label: "Año de fundación" },
    { icon: "", val: "500+", label: "Pedidos entregados" },
    { icon: "", val: "100%", label: "Salvadoreño" }
  ],
  stats: [
    { icon: "", val: "3,785+", label: "Seguidores en Instagram" },
    { icon: "", val: "100%", label: "Productos de calidad" },
    { icon: "", val: "Todo SV", label: "Cobertura de envíos" },
    { icon: "", val: "5/5", label: "Satisfacción del cliente" }
  ],
  whyTitle1: "¿Por qué", whyTitleHighlight: "elegirnos",
  whyCards: [
    { icon: "", title: "Productos de Calidad", desc: "Solo ofrecemos merch de la mejor calidad y diseño, seleccionado para verdaderos aficionados." },
    { icon: "", title: "Envíos Rápidos", desc: "Entregas a todo El Salvador de forma rápida y segura, directo hasta tu puerta." },
    { icon: "", title: "Atención Personalizada", desc: "Te atendemos por WhatsApp para resolver cualquier duda antes y después de tu compra." },
    { icon: "", title: "Pasión por la F1", desc: "Somos fans como tú. Entendemos lo que buscas porque vivimos cada carrera igual que tú." }
  ],
  faqTitle1: "Preguntas", faqTitleHighlight: "frecuentes",
  faq: [
    { q: "¿Hacen envíos a todo El Salvador?", a: "Sí. Realizamos envíos a todo el país. El costo y tiempo de entrega depende de tu ubicación. Pregúntanos por WhatsApp para más detalles." },
    { q: "¿Cuáles son los métodos de pago?", a: "Aceptamos transferencia bancaria, depósito y pago contra entrega en zonas seleccionadas. Confirmamos los detalles al momento del pedido." },
    { q: "¿Cómo hago un pedido?", a: "Solo da clic en 'Pedir por WhatsApp' en el producto que te interese, o escríbenos directamente al +503 7599-1408. Te responderemos a la brevedad." },
    { q: "¿Los productos son originales?", a: "Trabajamos con productos de excelente calidad y diseños inspirados en la Fórmula 1. Si tienes dudas sobre un producto específico, consúltanos antes de comprar." },
    { q: "¿Cuánto tarda el envío?", a: "Los envíos dentro de San Salvador típicamente tardan 1-2 días hábiles. Al resto del país, entre 2-4 días hábiles." }
  ],
  ctaTitle: "¿Listo para tu próximo merch?",
  ctaSubtitle: "Escríbenos por WhatsApp y haz tu pedido hoy"
};

const defaultProducts = [
  { id: "1", name: "Camisa Red Bull Racing 2026", category: "Camisas", price: 35, description: "Camisa oficial del equipo Red Bull Racing. Tallas S-XXL.", inStock: true, images: [], gender: "Unisex", sizes: ["S","M","L","XL"], team: "Red Bull Racing", driver: "Max Verstappen", featured: true },
  { id: "2", name: "Gorra Ferrari Scuderia", category: "Gorras", price: 25, description: "Gorra ajustable con logo bordado de Ferrari.", inStock: true, images: [], gender: "Unisex", sizes: ["Onesize"], team: "Ferrari", driver: "Charles Leclerc", featured: true },
  { id: "3", name: "Botella Térmica McLaren", category: "Botellas", price: 18, description: "Botella de acero inoxidable 500ml con diseño McLaren.", inStock: false, images: [], gender: "Unisex", sizes: ["Onesize"], team: "McLaren", driver: "", featured: false },
  { id: "4", name: "Bolsón Mercedes-AMG", category: "Bolsones", price: 30, description: "Bolsón deportivo con compartimentos múltiples.", inStock: true, images: [], gender: "Unisex", sizes: ["Onesize"], team: "Mercedes-AMG", driver: "", featured: false },
];

const WaIcon = ({ size = 16, color = "#fff" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.7-6.412-1.9l-.447-.298-2.97.995.995-2.97-.298-.447A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
);

function ImageCarousel({ images, height = 230, onImageClick }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return (
    <div style={{ height, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8C8CE" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    </div>
  );
  return (
    <div
      style={{ position: "relative", height, background: "#FFFFFF", overflow: "hidden" }}
      onMouseEnter={() => { if (images.length > 1 && idx === 0) setIdx(1); }}
      onMouseLeave={() => setIdx(0)}
    >
      <div onClick={() => onImageClick && onImageClick(images, idx)} style={{ width: "100%", height: "100%", cursor: onImageClick ? "zoom-in" : "default" }}>
        <img src={images[idx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
      </div>
      {onImageClick && (
        <div className="zoomhint" style={{ position: "absolute", top: 10, right: 10, background: "rgba(10,10,11,0.8)", backdropFilter: "blur(4px)", color: "#E4E4E7", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 500, pointerEvents: "none", letterSpacing: "0.02em", border: "1px solid rgba(255,255,255,0.08)" }}>
          Ampliar
        </div>
      )}
      {images.length > 1 && (<>
        <button className="carbtn" onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }} style={cbtn("left")}>‹</button>
        <button className="carbtn" onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }} style={cbtn("right")}>›</button>
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 2 }}>
          {images.map((_, i) => <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} style={{ width: 6, height: 6, borderRadius: "50%", cursor: "pointer", background: i === idx ? "#FFF" : "rgba(255,255,255,0.35)", transition: "background .2s" }} />)}
        </div>
      </>)}
    </div>
  );
}
const cbtn = (s) => ({ position: "absolute", top: "50%", [s]: 8, transform: "translateY(-50%)", background: "rgba(10,10,11,0.75)", backdropFilter: "blur(4px)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 30, height: 30, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, lineHeight: 1, zIndex: 2 });

function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return true; }
  } catch (e) {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    return true;
  } catch (e) { return false; }
}

function Lightbox({ images, startIdx, onClose, shareUrl, onShared }) {
  const [idx, setIdx] = useState(startIdx || 0);
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight" && images.length > 1) setIdx(i => (i + 1) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [images.length, onClose]);
  if (!images || images.length === 0) return null;
  return (
    <div onClick={onClose} style={S.lightboxOverlay}>
      <div onClick={e => e.stopPropagation()} style={S.lightboxTopBar}>
        {images.length > 1 ? <span style={S.lightboxCounter}>{idx + 1} / {images.length}</span> : <span />}
        <div style={{ display: "flex", gap: 8 }}>
          {shareUrl && (
            <button onClick={() => { if (copyText(shareUrl)) onShared && onShared(); }} style={S.lightboxShare} title="Copiar el enlace directo de este producto">
              🔗&nbsp;&nbsp;Copiar enlace
            </button>
          )}
          <button onClick={onClose} style={S.lightboxClose} aria-label="Cerrar">✕&nbsp;&nbsp;Cerrar</button>
        </div>
      </div>
      <div style={S.lightboxContent}>
        <img src={images[idx]} alt="" onClick={e => e.stopPropagation()} style={S.lightboxImg} />
        {images.length > 1 && (<>
          <button className="lbnav" onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }} style={{ ...S.lightboxNav, left: 16 }}>‹</button>
          <button className="lbnav" onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }} style={{ ...S.lightboxNav, right: 16 }}>›</button>
        </>)}
      </div>
      {images.length > 1 && (
        <div onClick={e => e.stopPropagation()} style={S.lightboxThumbs}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setIdx(i)} style={{ ...S.lightboxThumb, border: i === idx ? "2px solid #fff" : "2px solid transparent", opacity: i === idx ? 1 : 0.5 }} />
          ))}
        </div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={S.label}>{label}</label>
      <Tag value={value} onChange={e => onChange(e.target.value)} style={{ ...S.input, ...(textarea ? { height: 50, resize: "vertical" } : {}) }} />
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return <button onClick={onClick} style={active ? S.catTabActive : S.catTab}>{label}</button>;
}

/* ---------------- Carrito ---------------- */
const CART_KEY = "pitstop_cart_v1";
function useCart() {
  const [items, setItems] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(raw)) return raw.filter(i => i && i.key && i.name && typeof i.price === "number" && i.qty > 0);
    } catch (e) {}
    return [];
  });
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
  }, [items]);
  const add = (p, size) => {
    const key = p.id + "|" + (size || "");
    setItems(prev => {
      const found = prev.find(i => i.key === key);
      if (found) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, id: p.id, name: p.name, price: p.salePrice || p.price, size, qty: 1 }];
    });
  };
  const setQty = (key, qty) =>
    setItems(prev => qty <= 0 ? prev.filter(i => i.key !== key) : prev.map(i => i.key === key ? { ...i, qty } : i));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return { items, add, setQty, clear, count, total };
}

function cartWaLink(items, total) {
  const lines = items.map(i => `• ${i.name}${i.size ? " (Talla " + i.size + ")" : ""} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`);
  const msg = ["Hola Pit Stop, quiero hacer este pedido:", ...lines, `Total: $${total.toFixed(2)}`].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function CartDrawer({ open, onClose, cart }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 400, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, height: "100%", background: "#121214", borderLeft: "1px solid #27272A", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #27272A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#fff", fontFamily: F_HEAD, fontWeight: 800, fontSize: 19 }}>Tu pedido</div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #3F3F46", borderRadius: 8, color: "#A1A1AA", width: 34, height: 34, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 20px" }}>
          {cart.items.length === 0 && (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#71717A", fontSize: 14 }}>Todavía no agregaste productos.</div>
          )}
          {cart.items.map(i => (
            <div key={i.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "14px 0", borderBottom: "1px solid #1E1E22" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <div style={{ color: "#71717A", fontSize: 12, marginTop: 2 }}>{i.size ? "Talla " + i.size + " · " : ""}${i.price.toFixed(2)} c/u</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                <button onClick={() => cart.setQty(i.key, i.qty - 1)} style={S.cartQtyBtn}>−</button>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, width: 18, textAlign: "center" }}>{i.qty}</span>
                <button onClick={() => cart.setQty(i.key, i.qty + 1)} style={S.cartQtyBtn}>+</button>
              </div>
              <div style={{ color: "#fff", fontFamily: F_HEAD, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>${(i.price * i.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        {cart.items.length > 0 && (
          <div style={{ borderTop: "1px solid #27272A", padding: "16px 20px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontFamily: F_HEAD, fontWeight: 800, fontSize: 19, marginBottom: 4 }}>
              <span>Total</span><span>${cart.total.toFixed(2)}</span>
            </div>
            <div style={{ color: "#71717A", fontSize: 12, marginBottom: 14 }}>El costo de envío se coordina por WhatsApp.</div>
            <a className="btnwa" href={cartWaLink(cart.items, cart.total)} target="_blank" rel="noopener noreferrer" style={{ ...S.btnWa, padding: "14px 20px", fontSize: 14 }}>
              <WaIcon size={16} /> Enviar pedido por WhatsApp
            </a>
            <button onClick={cart.clear} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "#71717A", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Vaciar carrito</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, waLink, onImageClick, onAdd, highlight }) {
  const isNew = (() => { const n = Number(p.id); return isFinite(n) && n > 1e12 && (Date.now() - n) < 14 * 86400000; })();
  const meta = [p.team, p.driver, p.gender && p.gender !== "Unisex" ? p.gender : null].filter(Boolean).join("  ·  ");
  const sizes = (p.sizes || []).filter(Boolean);
  const needSize = sizes.length > 0 && !sizes.includes("Onesize");
  const [selSize, setSelSize] = useState("");
  const [hint, setHint] = useState(false);
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    if (needSize && !selSize) { setHint(true); setTimeout(() => setHint(false), 1800); return; }
    onAdd(p, needSize ? selSize : (sizes.includes("Onesize") ? "Única" : ""));
    setAdded(true); setTimeout(() => setAdded(false), 1200);
  };
  return (
    <div id={"prod-" + p.id} className="pcard" style={{ ...S.productCard, ...(highlight ? { borderColor: "#E10600", boxShadow: "0 0 0 2px rgba(225,6,0,0.65)" } : {}) }}>
      <div style={{ position: "relative" }}>
        <ImageCarousel images={p.images} height={230} onImageClick={onImageClick ? (imgs, i) => onImageClick(imgs, i, p.id) : undefined} />
        {!p.inStock && <div style={S.soldOut}>Agotado</div>}
        {p.inStock && (p.featured || isNew) && (
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 5, alignItems: "flex-start" }}>
            {p.featured && <div style={S.featuredBadgeIn}>Destacado</div>}
            {isNew && <div style={S.newBadge}>Nuevo</div>}
          </div>
        )}
        {p.salePrice && p.inStock && <div style={S.saleBadge}>Oferta</div>}
      </div>
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={S.cardEyebrow}>{p.category}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <h3 style={S.cardTitle}>{p.name}</h3>
          <span style={S.cardPrice}>{p.salePrice ? <><span style={{ textDecoration: "line-through", color: "#52525B", fontWeight: 500, marginRight: 8, fontSize: 13 }}>${p.price.toFixed(2)}</span>${p.salePrice.toFixed(2)}</> : `$${p.price.toFixed(2)}`}</span>
        </div>
        <p style={S.cardDesc}>{p.description}</p>
        {meta && <div style={S.cardMeta}>{meta}</div>}
        {sizes.length > 0 && (
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            {sizes.includes("Onesize")
              ? <span style={S.sizeChip}>Talla única</span>
              : sizes.map(sz => (
                  <button key={sz} onClick={() => setSelSize(selSize === sz ? "" : sz)} style={{ ...S.sizeChip, cursor: "pointer", border: selSize === sz ? "1px solid #E10600" : "1px solid #27272A", background: selSize === sz ? "#E10600" : "transparent", color: selSize === sz ? "#fff" : "#A1A1AA" }}>
                    {sz}
                  </button>
                ))}
            {hint && <span style={{ color: "#FF4438", fontSize: 11, fontWeight: 600 }}>← Elegí tu talla</span>}
          </div>
        )}
        <div style={{ marginTop: "auto" }}>
          {p.inStock ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btnp" onClick={handleAdd} style={{ ...S.btnCart, flex: 1 }}>
                {added ? "Agregado ✓" : "Agregar al carrito"}
              </button>
              <a className="btnwa" href={waLink(p)} target="_blank" rel="noopener noreferrer" title="Pedir solo este producto por WhatsApp" style={{ ...S.btnWa, width: 46, padding: "12px 0", flexShrink: 0 }}>
                <WaIcon size={16} />
              </a>
            </div>
          ) : (
            <button disabled style={S.btnDisabled}>No disponible</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Datos F1 automáticos (Jolpica, gratis, sin clave) ----------------
   Si la fuente falla, estas secciones simplemente no se muestran: la página
   sigue funcionando exactamente igual, sin errores visibles. */
/* ---------------- Rutas de página (portada / catálogo / ofertas) ---------------- */
function getRoute() {
  const h = window.location.hash;
  if (h.startsWith("#/ofertas")) return "sale";
  if (h.startsWith("#/juego")) return "game";
  if (h.startsWith("#/catalogo") || h.startsWith("#p/")) return "catalog";
  return "home";
}

const F1_CACHE_KEY = "pitstop_f1_data_v3";
function raceDateMs(r) {
  try { const t = new Date(r.date + "T" + (r.time || "12:00:00Z")).getTime(); return isNaN(t) ? NaN : t; } catch (e) { return NaN; }
}
function nextRaceFrom(races, nowMs) {
  const GRACE = 3 * 3600 * 1000; // la carrera "sigue vigente" hasta 3 h después de la largada
  return (races || []).find(r => { const t = raceDateMs(r); return !isNaN(t) && t + GRACE > nowMs; }) || null;
}
function raceDisplayName(raceName) {
  if (!raceName) return "";
  const m = raceName.match(/^(.*?)\s+Grand Prix$/i);
  return m ? "GP de " + m[1] : raceName;
}
function raceCountdownMsg(nextRace, nowMs) {
  if (!nextRace) return null;
  const t = raceDateMs(nextRace);
  if (isNaN(t)) return null;
  const diff = t - nowMs;
  const name = raceDisplayName(nextRace.raceName);
  if (diff <= 0) return "🏁 " + name + " — ¡Hoy es la carrera!";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const mnt = Math.floor((diff % 3600000) / 60000);
  const cuenta = d > 0 ? d + "d " + h + "h" : h > 0 ? h + "h " + mnt + "m" : mnt + "m";
  return "🏁 " + name + " — luces apagadas en " + cuenta;
}
function useF1Data() {
  const [data, setData] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cached = JSON.parse(localStorage.getItem(F1_CACHE_KEY) || "null");
        if (cached && Date.now() - cached.ts < 6 * 3600 * 1000 && nextRaceFrom(cached.races, Date.now())) {
          if (alive) setData(cached);
          return;
        }
      } catch (e) {}
      try {
        const j = (u) => fetch("https://api.jolpi.ca/ergast/f1/" + u).then(r => r.json()).catch(() => null);
        const [rs, ss, cs, lr] = await Promise.all([
          j("current.json"), j("current/driverStandings.json"),
          j("current/constructorStandings.json"), j("current/last/results.json"),
        ]);
        const races = (rs && rs.MRData && rs.MRData.RaceTable && rs.MRData.RaceTable.Races) || [];
        const dl = (ss && ss.MRData && ss.MRData.StandingsTable && ss.MRData.StandingsTable.StandingsLists) || [];
        const drivers = ((dl[0] && dl[0].DriverStandings) || []).slice(0, 8).map(d => ({
          pos: d.position,
          pts: d.points,
          name: (((d.Driver && d.Driver.givenName) || "") + " " + ((d.Driver && d.Driver.familyName) || "")).trim(),
          family: (d.Driver && d.Driver.familyName) || "",
        }));
        const driversAll = ((dl[0] && dl[0].DriverStandings) || []).map(d => ({
          name: (((d.Driver && d.Driver.givenName) || "") + " " + ((d.Driver && d.Driver.familyName) || "")).trim(),
        })).filter(d => d.name);
        const cl = (cs && cs.MRData && cs.MRData.StandingsTable && cs.MRData.StandingsTable.StandingsLists) || [];
        const constructors = ((cl[0] && cl[0].ConstructorStandings) || []).slice(0, 8).map(c => ({
          pos: c.position,
          pts: c.points,
          name: (c.Constructor && c.Constructor.name) || "",
        }));
        const lrr = (lr && lr.MRData && lr.MRData.RaceTable && lr.MRData.RaceTable.Races) || [];
        const lastRace = lrr[0] ? {
          name: lrr[0].raceName || "",
          podium: (lrr[0].Results || []).slice(0, 3).map(x => ({
            pos: x.position,
            name: (((x.Driver && x.Driver.givenName) || "") + " " + ((x.Driver && x.Driver.familyName) || "")).trim(),
            team: (x.Constructor && x.Constructor.name) || "",
          })),
        } : null;
        const season = (ss && ss.MRData && ss.MRData.StandingsTable && ss.MRData.StandingsTable.season) || "";
        if (races.length === 0 && drivers.length === 0) return;
        const fresh = { ts: Date.now(), races, drivers, driversAll, constructors, lastRace, season };
        if (alive) setData(fresh);
        try { localStorage.setItem(F1_CACHE_KEY, JSON.stringify(fresh)); } catch (e) {}
      } catch (e) { /* sin datos: la página sigue igual */ }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const nextRace = data ? nextRaceFrom(data.races, nowMs) : null;
  return {
    nextRace,
    races: data ? data.races : null,
    drivers: (data && data.drivers && data.drivers.length > 0) ? data.drivers : null,
    driversAll: (data && data.driversAll && data.driversAll.length > 2) ? data.driversAll : null,
    constructors: (data && data.constructors && data.constructors.length > 0) ? data.constructors : null,
    lastRace: (data && data.lastRace && data.lastRace.podium && data.lastRace.podium.length > 0) ? data.lastRace : null,
    season: (data && data.season) || "",
    nowMs,
  };
}

const FLAGS = { "bahrain": "🇧🇭", "saudi arabia": "🇸🇦", "australia": "🇦🇺", "japan": "🇯🇵", "china": "🇨🇳", "usa": "🇺🇸", "united states": "🇺🇸", "italy": "🇮🇹", "monaco": "🇲🇨", "canada": "🇨🇦", "spain": "🇪🇸", "austria": "🇦🇹", "uk": "🇬🇧", "united kingdom": "🇬🇧", "great britain": "🇬🇧", "hungary": "🇭🇺", "belgium": "🇧🇪", "netherlands": "🇳🇱", "azerbaijan": "🇦🇿", "singapore": "🇸🇬", "mexico": "🇲🇽", "brazil": "🇧🇷", "qatar": "🇶🇦", "uae": "🇦🇪", "united arab emirates": "🇦🇪", "abu dhabi": "🇦🇪", "france": "🇫🇷", "germany": "🇩🇪", "portugal": "🇵🇹", "south korea": "🇰🇷", "india": "🇮🇳", "turkey": "🇹🇷", "argentina": "🇦🇷", "south africa": "🇿🇦", "russia": "🇷🇺", "malaysia": "🇲🇾", "thailand": "🇹🇭", "vietnam": "🇻🇳", "rwanda": "🇷🇼" };
function countryFlag(r) {
  try {
    const c = ((r.Circuit && r.Circuit.Location && r.Circuit.Location.country) || "").toLowerCase().trim();
    return FLAGS[c] || "🏁";
  } catch (e) { return "🏁"; }
}
function fmtRaceDateShort(r) {
  const t = raceDateMs(r);
  if (isNaN(t)) return "";
  try { return new Date(t).toLocaleDateString("es-SV", { day: "numeric", month: "short" }).replace(".", ""); } catch (e) { return ""; }
}
function fmtNewsDate(d) {
  if (!d) return "";
  const t = new Date(d).getTime();
  if (isNaN(t)) return "";
  const h = Math.floor((Date.now() - t) / 3600000);
  if (h < 1) return "hace minutos";
  if (h < 24) return "hace " + h + " h";
  try { return new Date(t).toLocaleDateString("es-SV", { day: "numeric", month: "short" }).replace(".", ""); } catch (e) { return ""; }
}

// Titulares de F1 servidos por la función propia del sitio (/.netlify/functions/noticias).
// Si la función o las fuentes fallan, la sección no se muestra y nada se rompe.
function useF1News() {
  const [news, setNews] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const c = JSON.parse(localStorage.getItem("pitstop_f1_news_v1") || "null");
        if (c && Date.now() - c.ts < 3600 * 1000 && c.data && c.data.items && c.data.items.length > 0) {
          if (alive) setNews(c.data);
          return;
        }
      } catch (e) {}
      try {
        const r = await fetch("/.netlify/functions/noticias");
        if (!r.ok) return;
        const data = await r.json();
        if (data && data.items && data.items.length > 0) {
          if (alive) setNews(data);
          try { localStorage.setItem("pitstop_f1_news_v1", JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
        }
      } catch (e) {}
    })();
    return () => { alive = false; };
  }, []);
  return news;
}

function countdownShort(nextRace, nowMs) {
  const t = raceDateMs(nextRace);
  if (isNaN(t)) return "";
  const diff = t - nowMs;
  if (diff <= 0) return "¡Hoy!";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return d > 0 ? d + "d " + h + "h" : h > 0 ? h + "h " + m + "m" : m + "m";
}
function fmtRaceDate(r) {
  const t = raceDateMs(r);
  if (isNaN(t)) return r && r.date ? r.date : "";
  try {
    const str = new Date(t).toLocaleDateString("es-SV", { weekday: "long", day: "numeric", month: "long" });
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (e) { return r.date || ""; }
}

/* ---------------- Importador de Excel (inventario) ---------------- */
function impNorm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function impSim(a, b) {
  const A = new Set(impNorm(a).split(" ").filter(Boolean));
  const B = new Set(impNorm(b).split(" ").filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach(t => { if (B.has(t)) inter++; });
  return (2 * inter) / (A.size + B.size);
}
const IMP_CATS = { gorra: "Gorras", camisa: "Camisas", camiseta: "Camisas", accesorio: "Accesorios", chaqueta: "Chaquetas", sueter: "Suéteres", "sueteres": "Suéteres", botella: "Botellas", bolson: "Bolsones", lentes: "Lentes" };
function impCategory(c) {
  const n = impNorm(c);
  return IMP_CATS[n] || (String(c || "").trim() || "Accesorios");
}
function impSize(t) {
  const n = impNorm(t);
  if (!n) return null;
  if (n === "one size" || n === "onesize" || n === "unica" || n === "talla unica" || n === "u") return "Onesize";
  return String(t).trim().toUpperCase();
}

/* ---------------- Pit Lane: juegos ---------------- */
function LightsOutGame() {
  const [phase, setPhase] = useState("idle"); // idle | seq | go | result | foul
  const [lit, setLit] = useState(0);
  const [ms, setMs] = useState(null);
  const [best, setBest] = useState(() => {
    try { const b = Number(localStorage.getItem("pitstop_reaction_best")); return b > 0 ? b : null; } catch (e) { return null; }
  });
  const timers = useRef([]);
  const goAt = useRef(0);
  const clearTimers = () => { timers.current.forEach(t => clearTimeout(t)); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const start = () => {
    clearTimers(); setMs(null); setLit(0); setPhase("seq");
    for (let i = 1; i <= 5; i++) timers.current.push(setTimeout(() => setLit(i), i * 650));
    const hold = 5 * 650 + 500 + Math.random() * 2200;
    timers.current.push(setTimeout(() => { setLit(0); goAt.current = performance.now(); setPhase("go"); }, hold));
  };
  const tap = () => {
    if (phase === "seq") { clearTimers(); setLit(0); setPhase("foul"); return; }
    if (phase === "go") {
      const t = Math.round(performance.now() - goAt.current);
      setMs(t); setPhase("result");
      setBest(prev => {
        if (prev && prev <= t) return prev;
        try { localStorage.setItem("pitstop_reaction_best", String(t)); } catch (e) {}
        return t;
      });
      return;
    }
    start();
  };
  const verdict = (t) =>
    t < 180 ? "¡Reflejos de piloto! 🏆" :
    t < 250 ? "¡Nivel parrilla de salida!" :
    t < 350 ? "Nada mal… ¿otra vuelta?" :
    "Calentá motores y probá de nuevo";
  const shareHref = "https://wa.me/?text=" + encodeURIComponent(
    "⏱️ Mi tiempo de reacción en la salida estilo F1: " + ms + " ms 🚦 ¿Me ganás? Jugá aquí: https://pitstopelsalvador.netlify.app/#/juego"
  );
  const bgByPhase = phase === "go" ? "#10240F" : phase === "foul" ? "#2A0A08" : "#101013";
  return (
    <div style={S.seasonCard}>
      <div style={S.seasonCardTitle}>Juego 1 · Luces apagadas</div>
      <div style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.6, margin: "8px 0 14px" }}>
        Como en una salida real: se encienden las 5 luces, y cuando se apagan… ¡tocá lo más rápido que puedas! Los pilotos de F1 reaccionan en unos 200 ms.
      </div>
      <div
        onPointerDown={tap}
        role="button"
        style={{ background: bgByPhase, border: "1px solid #1E1E22", borderRadius: 12, padding: "26px 16px", textAlign: "center", cursor: "pointer", userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation", transition: "background .15s" }}
      >
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: lit >= i ? "#E10600" : "#1E1E22", border: "1px solid #2A2A2F", transition: "background .1s" }} />
          ))}
        </div>
        <div style={{ fontFamily: F_HEAD, fontWeight: 900, fontStyle: "italic", fontSize: phase === "result" ? 38 : 20, color: "#fff", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {phase === "idle" && "Tocá para empezar"}
          {phase === "seq" && "Esperá…"}
          {phase === "go" && "¡YA!"}
          {phase === "result" && ms + " ms"}
          {phase === "foul" && "🚫 ¡Salida en falso!"}
        </div>
        <div style={{ color: "#71717A", fontSize: 12, marginTop: 6 }}>
          {phase === "result" && verdict(ms)}
          {phase === "foul" && "Tocaste antes de que se apagaran. Tocá para reintentar."}
          {(phase === "idle") && (best ? "Tu mejor marca: " + best + " ms" : "¿Qué tan rápido sos?")}
          {phase === "seq" && "Cuando se apaguen las luces…"}
          {phase === "go" && "¡Tocá ahora!"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
        {(phase === "result" || phase === "foul") && (
          <button className="btnp" onClick={start} style={{ ...S.btnCart, width: "auto", padding: "10px 20px" }}>
            {phase === "foul" ? "🔄 Reintentar" : "🔄 Jugar de nuevo"}
          </button>
        )}
        {best && <span style={{ color: "#A1A1AA", fontSize: 12.5 }}>🏆 Mejor marca: <b style={{ color: "#fff" }}>{best} ms</b></span>}
        {phase === "result" && (
          <a className="btnwa" href={shareHref} target="_blank" rel="noopener noreferrer" style={{ ...S.btnWa, width: "auto", padding: "10px 18px", marginLeft: "auto" }}>
            <WaIcon size={14} /> Presumir mi tiempo
          </a>
        )}
      </div>
    </div>
  );
}

function PodiumGame({ nextRace, drivers }) {
  const [p, setP] = useState(["", "", ""]);
  if (!nextRace || !drivers || drivers.length < 3) return null;
  const raceName = raceDisplayName(nextRace.raceName);
  const ready = p[0] && p[1] && p[2];
  const text = "🏆 Mi podio para el " + raceName + ":\n🥇 " + p[0] + "\n🥈 " + p[1] + "\n🥉 " + p[2];
  const href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  const selStyle = { width: "100%", background: "#0B0B0C", border: "1px solid #2A2A2F", borderRadius: 8, color: "#E4E4E7", padding: "11px 12px", fontSize: 14, outline: "none", fontFamily: F_BODY, cursor: "pointer" };
  const medals = ["🥇 Ganador", "🥈 Segundo", "🥉 Tercero"];
  return (
    <div style={S.seasonCard}>
      <div style={S.seasonCardTitle}>Juego 2 · Armá tu podio</div>
      <div style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.6, margin: "8px 0 14px" }}>
        ¿Quiénes suben al podio en el <b style={{ color: "#fff" }}>{raceName}</b> ({fmtRaceDateShort(nextRace)})? Elegí tu trío y mandanos tu predicción por WhatsApp.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2].map(i => (
          <select key={i} value={p[i]} onChange={e => { const v = e.target.value; setP(prev => prev.map((x, j) => j === i ? v : x)); }} style={selStyle} aria-label={medals[i]}>
            <option value="">{medals[i]} — elegí piloto</option>
            {drivers.filter(d => p[i] === d.name || !p.includes(d.name)).map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        ))}
      </div>
      <a
        className="btnwa"
        href={ready ? href : undefined}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...S.btnWa, marginTop: 14, opacity: ready ? 1 : 0.45, pointerEvents: ready ? "auto" : "none" }}
      >
        <WaIcon size={15} /> {ready ? "Enviar mi podio por WhatsApp" : "Elegí tus 3 pilotos"}
      </a>
      <div style={{ color: "#52525B", fontSize: 11.5, marginTop: 10 }}>Tu predicción nos llega directo al WhatsApp de la tienda.</div>
    </div>
  );
}

function TopBar({ messages }) {
  const list = (messages || []).filter(Boolean);
  if (list.length === 0) return null;
  const line = list.join("  ·  ");
  return (
    <div style={S.topBar}>
      <div className="tickertrack">
        <span style={{ paddingRight: 80 }}>{line}</span>
        <span style={{ paddingRight: 80 }} aria-hidden="true">{line}</span>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={S.faqItem}>
      <button className="faqq" onClick={() => setOpen(!open)} style={S.faqQuestion}>
        <span>{q}</span>
        <span className="faqplus" style={{ color: "#71717A", fontSize: 18, fontWeight: 400, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.25s, color 0.2s", lineHeight: 1 }}>+</span>
      </button>
      {open && <div style={S.faqAnswer}>{a}</div>}
    </div>
  );
}

function SectionTitle({ part1, highlight, align = "center", meta }) {
  return (
    <div style={{ textAlign: align, marginBottom: 40 }}>
      <div style={{ width: 32, height: 2, background: "#E10600", margin: align === "center" ? "0 auto 18px" : "0 0 18px" }} />
      <div style={align === "left" ? { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" } : undefined}>
        <h2 style={{ ...S.sectionTitle, textAlign: align }}>
          {part1} <span style={{ color: "#E10600" }}>{highlight}</span>
        </h2>
        {meta && <span style={{ color: "#52525B", fontSize: 13, fontWeight: 500, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{meta}</span>}
      </div>
    </div>
  );
}

function migrateTeams(list) { return (list || []).map(t => typeof t === "string" ? { name: t, image: "" } : t); }
function migrateDrivers(list) { return (list || []).map(d => typeof d === "string" ? { name: d, image: "" } : d); }

export default function App() {
  const [page, setPage] = useState("landing");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [genders, setGenders] = useState(DEFAULT_GENDERS);
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newSize, setNewSize] = useState("");
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [drivers, setDrivers] = useState(DEFAULT_DRIVERS);
  const [newTeam, setNewTeam] = useState("");
  const [newDriver, setNewDriver] = useState("");
  const [content, setContent] = useState(defaultContent);
  const [logo, setLogo] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("rec");
  const [activeGender, setActiveGender] = useState("Todos");
  const [activeTeam, setActiveTeam] = useState("Todos");
  const [activeDriver, setActiveDriver] = useState("Todos");
  const [activeSize, setActiveSize] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "", description: "", inStock: true, images: [], gender: "Unisex", sizes: [], team: "", driver: "", featured: false, salePrice: "" });
  const [adminTab, setAdminTab] = useState("products");
  const [importPlan, setImportPlan] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const importFileRef = useRef(null);

  const handleImportFile = async (file) => {
    if (!file) return;
    setImportBusy(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      // hoja: "Inventario" o la primera cuyo encabezado tenga Producto + Estado
      let elegida = null, headerIdx = -1, headers = null, data = null;
      const nombres = [...wb.SheetNames].sort((a, b) => (impNorm(b) === "inventario") - (impNorm(a) === "inventario"));
      for (const nm of nombres) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1, defval: "" });
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
          const low = rows[i].map(c => impNorm(c));
          if (low.includes("producto") && low.includes("estado")) { elegida = nm; headerIdx = i; headers = low; data = rows; break; }
        }
        if (elegida) break;
      }
      if (!elegida) { notify("⚠️ No encontré una hoja con columnas Producto y Estado"); return; }
      const col = (name) => headers.indexOf(name);
      const cProd = col("producto"), cEstado = col("estado"), cCat = col("categoria"),
        cTeam = col("escuderia"), cDriver = col("corredor"), cTalla = col("talla"), cPrecio = col("precio venta");
      // unidades disponibles → agrupadas por producto
      const grupos = {};
      for (let i = headerIdx + 1; i < data.length; i++) {
        const r = data[i];
        if (!r || !r[cProd]) continue;
        if (impNorm(r[cEstado]) !== "disponible") continue;
        const key = impNorm(r[cProd]);
        if (!key) continue;
        if (!grupos[key]) grupos[key] = { name: String(r[cProd]).trim(), sizes: [], prices: [], cat: "", team: "", driver: "", units: 0 };
        const g = grupos[key];
        g.units++;
        const t = cTalla >= 0 ? impSize(r[cTalla]) : null;
        if (t && !g.sizes.includes(t)) g.sizes.push(t);
        const pr = cPrecio >= 0 ? Number(r[cPrecio]) : NaN;
        if (isFinite(pr) && pr > 0) g.prices.push(pr);
        if (!g.cat && cCat >= 0) g.cat = impCategory(r[cCat]);
        if (!g.team && cTeam >= 0) g.team = String(r[cTeam] || "").trim();
        if (!g.driver && cDriver >= 0) g.driver = String(r[cDriver] || "").trim();
      }
      const items = Object.values(grupos).map(g => {
        const candidatos = products
          .map(p => ({ id: p.id, name: p.name, score: impSim(g.name, p.name) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .filter(c => c.score >= 0.3);
        const auto = candidatos[0] && candidatos[0].score >= 0.85;
        return {
          ...g,
          price: g.prices.length ? Math.max(...g.prices) : 0,
          candidatos,
          choice: auto ? "match:" + candidatos[0].id : "new",
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
      if (items.length === 0) { notify("⚠️ El Excel no tiene productos con estado Disponible"); return; }
      setImportPlan({ items, markMissing: true, hoja: elegida });
    } catch (e) {
      notify("⚠️ No pude leer el Excel: " + (e && e.message ? e.message : e));
    } finally {
      setImportBusy(false);
      if (importFileRef.current) importFileRef.current.value = "";
    }
  };

  const applyImport = async () => {
    const plan = importPlan;
    if (!plan) return;
    const matchedIds = new Set(plan.items.filter(i => i.choice.startsWith("match:")).map(i => i.choice.slice(6)));
    let updated = 0, created = 0, agotados = 0;
    let final = products.map(p => {
      const item = plan.items.find(i => i.choice === "match:" + p.id);
      if (item) {
        updated++;
        return { ...p, name: item.name, inStock: true, price: item.price || p.price, sizes: item.sizes.length ? item.sizes : p.sizes };
      }
      if (plan.markMissing && p.inStock && !matchedIds.has(String(p.id))) {
        agotados++;
        return { ...p, inStock: false };
      }
      return p;
    });
    const base = Date.now();
    plan.items.forEach((item, i) => {
      if (item.choice !== "new") return;
      created++;
      final.push({
        id: String(base + i),
        name: item.name,
        category: item.cat || "Accesorios",
        price: item.price || 0,
        salePrice: null,
        description: "",
        inStock: true,
        images: [],
        gender: "Unisex",
        sizes: item.sizes,
        team: item.team,
        driver: item.driver,
        featured: false,
      });
    });
    const newCats = [...new Set(plan.items.filter(i => i.choice === "new").map(i => i.cat).filter(c => c && !categories.includes(c)))];
    if (newCats.length) await saveCategories([...categories, ...newCats]);
    const ok = await saveProducts(final);
    if (ok) notify(`Importado ✓ ${created} nuevos · ${updated} actualizados · ${agotados} marcados agotados`);
    setImportPlan(null);
  };
  const fileRef = useRef(null);
  const logoRef = useRef(null);
  const aboutImgRef = useRef(null);
  const teamImgRef = useRef(null);
  const driverImgRef = useRef(null);
  const [uploadingTeamIdx, setUploadingTeamIdx] = useState(null);
  const [uploadingDriverIdx, setUploadingDriverIdx] = useState(null);
  const [notification, setNotification] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useCart();
  const f1 = useF1Data();
  const news = useF1News();
  const upcomingRaces = (f1.races && f1.nextRace)
    ? f1.races.filter(r => { const t = raceDateMs(r); const tn = raceDateMs(f1.nextRace); return !isNaN(t) && !isNaN(tn) && t > tn; }).slice(0, 2)
    : [];
  const [route, setRoute] = useState(getRoute());
  useEffect(() => {
    const onHash = () => {
      setRoute(getRoute());
      if (!window.location.hash.startsWith("#p/")) window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const [cartOpen, setCartOpen] = useState(false);
  const addToCart = (p, size) => { cart.add(p, size); setCartOpen(true); };
  const [mobileSection, setMobileSection] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else { document.body.style.overflow = ""; setMobileSection(null); }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const openLightbox = (images, startIdx, productId) => setLightbox({ images, startIdx, pid: productId || null });

  useEffect(() => { loadData(); }, []);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 2500); };

  const loadData = async () => {
    const safetyTimeout = setTimeout(() => setLoading(false), 8000);
    try {
      const [pSplit, lRaw, aRaw, cRaw, tRaw, dRaw, catRaw, gRaw, szRaw] = await Promise.all([
        loadProductsSplit(), storeGet("pitstop_logo"), storeGet("pitstop_about_image"),
        storeGet("pitstop_content"), storeGet("pitstop_teams_v2"), storeGet("pitstop_drivers_v2"),
        storeGet("pitstop_categories"), storeGet("pitstop_genders"), storeGet("pitstop_sizes"),
      ]);
      const normalize = (arr) => arr.map(p => ({ gender: "Unisex", sizes: [], team: "", driver: "", featured: false, ...p, images: p.images || (p.image ? [p.image] : []) }));
      if (pSplit) {
        setProducts(normalize(pSplit));
      } else {
        const pRaw = await storeGet("pitstop_products_v3");
        if (pRaw) { try { setProducts(normalize(JSON.parse(pRaw))); } catch(e) { setProducts(defaultProducts); } }
        else setProducts(defaultProducts);
      }
      if (lRaw) setLogo(lRaw);
      if (aRaw) setAboutImage(aRaw);
      if (cRaw) { try { setContent({ ...defaultContent, ...JSON.parse(cRaw) }); } catch(e) {} }
      if (tRaw) { try { setTeams(migrateTeams(JSON.parse(tRaw))); } catch(e) {} }
      if (dRaw) { try { setDrivers(migrateDrivers(JSON.parse(dRaw))); } catch(e) {} }
      if (catRaw) { try { setCategories(JSON.parse(catRaw).map(c => typeof c === "string" ? c : c.name)); } catch(e) {} }
      if (gRaw) { try { setGenders(JSON.parse(gRaw)); } catch(e) {} }
      if (szRaw) { try { setSizes(JSON.parse(szRaw)); } catch(e) {} }
    } catch(e) {
      setProducts(defaultProducts);
    } finally {
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  const persist = async (key, u, setter) => {
    setter(u);
    const r = await storeSet(key, JSON.stringify(u));
    if (!r.ok) notify("⚠️ NO SE GUARDÓ: " + r.msg);
    return r.ok;
  };

  // Guardado granular: compara con el estado anterior y solo escribe los
  // productos que cambiaron, borra los eliminados y actualiza el orden.
  const prevProductsRef = useRef(null);
  useEffect(() => { if (prevProductsRef.current === null && products.length) prevProductsRef.current = products; }, [products]);
  const saveProducts = async (u) => {
    const prev = prevProductsRef.current || [];
    setProducts(u);
    prevProductsRef.current = u;
    const prevById = {}; prev.forEach(p => { prevById[String(p.id)] = JSON.stringify(p); });
    const newIds = u.map(p => String(p.id));
    let ok = true; let msg = "";
    for (const p of u) {
      const pid = String(p.id);
      const now = JSON.stringify(p);
      if (prevById[pid] !== now) {
        const r = await storeSet("pitstop_prod_" + pid, now);
        if (!r.ok) { ok = false; msg = r.msg; }
      }
    }
    for (const pid of Object.keys(prevById)) {
      if (!newIds.includes(pid)) await storeDel("pitstop_prod_" + pid);
    }
    const ro = await storeSet("pitstop_products_order", JSON.stringify(newIds));
    if (!ro.ok) { ok = false; msg = ro.msg; }
    if (!ok) notify("⚠️ NO SE GUARDÓ: " + msg);
    return ok;
  };
  const saveContent = (u) => persist("pitstop_content", u, setContent);
  const saveTeams = (u) => persist("pitstop_teams_v2", u, setTeams);
  const saveDrivers = (u) => persist("pitstop_drivers_v2", u, setDrivers);
  const saveCategories = (u) => persist("pitstop_categories", u, setCategories);
  const saveGenders = (u) => persist("pitstop_genders", u, setGenders);
  const saveSizes = (u) => persist("pitstop_sizes", u, setSizes);

  const addCategory = () => { const v = newCategoryName.trim(); if (!v) return; if (categories.includes(v)) return notify("Ya existe esa categoría"); saveCategories([...categories, v]); setNewCategoryName(""); notify("Categoría agregada"); };
  const removeCategory = (name) => { saveCategories(categories.filter(x => x !== name)); notify("Categoría eliminada"); };
  const moveCategory = (i, dir) => { const arr = [...categories]; const n = i + dir; if (n < 0 || n >= arr.length) return; [arr[i], arr[n]] = [arr[n], arr[i]]; saveCategories(arr); };
  const sortCategoriesAZ = () => saveCategories([...categories].sort((a, b) => a.localeCompare(b)));

  const addGender = () => { const v = newGender.trim(); if (!v) return; if (genders.includes(v)) return notify("Ya existe ese género"); saveGenders([...genders, v]); setNewGender(""); notify("Género agregado"); };
  const removeGender = (g) => { saveGenders(genders.filter(x => x !== g)); notify("Género eliminado"); };
  const moveGender = (i, dir) => { const arr = [...genders]; const n = i + dir; if (n < 0 || n >= arr.length) return; [arr[i], arr[n]] = [arr[n], arr[i]]; saveGenders(arr); };
  const sortGendersAZ = () => saveGenders([...genders].sort((a, b) => a.localeCompare(b)));

  const addSize = () => { const v = newSize.trim(); if (!v) return; if (sizes.includes(v)) return notify("Ya existe esa talla"); saveSizes([...sizes, v]); setNewSize(""); notify("Talla agregada"); };
  const removeSize = (s) => { saveSizes(sizes.filter(x => x !== s)); notify("Talla eliminada"); };
  const moveSize = (i, dir) => { const arr = [...sizes]; const n = i + dir; if (n < 0 || n >= arr.length) return; [arr[i], arr[n]] = [arr[n], arr[i]]; saveSizes(arr); };
  const sortSizesAZ = () => saveSizes([...sizes].sort((a, b) => a.localeCompare(b)));

  const addTeam = () => { const v = newTeam.trim(); if (!v) return; if (teams.find(t => t.name === v)) return notify("Ya existe esa escudería"); saveTeams([...teams, { name: v, image: "" }].sort((a,b) => a.name.localeCompare(b.name))); setNewTeam(""); notify("Escudería agregada"); };
  const removeTeam = (name) => { saveTeams(teams.filter(x => x.name !== name)); notify("Escudería eliminada"); };
  const addDriver = () => { const v = newDriver.trim(); if (!v) return; if (drivers.find(d => d.name === v)) return notify("Ya existe ese piloto"); saveDrivers([...drivers, { name: v, image: "" }].sort((a,b) => a.name.localeCompare(b.name))); setNewDriver(""); notify("Piloto agregado"); };
  const removeDriver = (name) => { saveDrivers(drivers.filter(x => x.name !== name)); notify("Piloto eliminado"); };

  const handleTeamImageUpload = async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f || uploadingTeamIdx === null) return;
    const data = await compressImage(f, 400, "image/png");
    const t = [...teams]; t[uploadingTeamIdx] = { ...t[uploadingTeamIdx], image: data };
    saveTeams(t); notify("Logo actualizado"); setUploadingTeamIdx(null);
  };
  const handleDriverImageUpload = async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f || uploadingDriverIdx === null) return;
    const data = await compressImage(f, 400, "image/jpeg");
    const d = [...drivers]; d[uploadingDriverIdx] = { ...d[uploadingDriverIdx], image: data };
    saveDrivers(d); notify("Foto actualizada"); setUploadingDriverIdx(null);
  };
  const removeTeamImage = (idx) => { const t = [...teams]; t[idx] = { ...t[idx], image: "" }; saveTeams(t); };
  const removeDriverImage = (idx) => { const d = [...drivers]; d[idx] = { ...d[idx], image: "" }; saveDrivers(d); };

  const handleLogoUpload = async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const data = await compressImage(f, 400, "image/png");
    setLogo(data); storeSet("pitstop_logo", data); notify("Logo actualizado");
  };
  const removeLogo = async () => { setLogo(""); storeDel("pitstop_logo"); notify("Logo eliminado"); };

  const handleAboutImageUpload = async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const data = await compressImage(f, 1200, "image/jpeg");
    setAboutImage(data); storeSet("pitstop_about_image", data); notify("Imagen actualizada");
  };
  const removeAboutImage = async () => { setAboutImage(""); storeDel("pitstop_about_image"); notify("Imagen eliminada"); };

  const updateAboutHighlight = (i, key, val) => { const h = [...(content.aboutHighlights || [])]; h[i] = { ...h[i], [key]: val }; saveContent({ ...content, aboutHighlights: h }); };

  const handleLogin = () => { if (adminPass === ADMIN_PASSWORD) { setAdminAuth(true); setPassError(false); } else setPassError(true); };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    for (const f of files) {
      const data = await compressImage(f, 1000, "image/jpeg");
      setForm(fm => ({ ...fm, images: [...fm.images, data] }));
    }
  };
  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }));
  const moveImage = (i, d) => setForm(f => { const imgs = [...f.images]; const n = i + d; if (n < 0 || n >= imgs.length) return f; [imgs[i], imgs[n]] = [imgs[n], imgs[i]]; return { ...f, images: imgs }; });
  const toggleSize = (sz) => setForm(f => ({ ...f, sizes: f.sizes.includes(sz) ? f.sizes.filter(s => s !== sz) : [...f.sizes, sz] }));

  const handleSave = async () => {
    if (!form.name || !form.price) return notify("Completa nombre y precio");
    const p = { ...form, price: parseFloat(form.price), salePrice: form.salePrice ? parseFloat(form.salePrice) : null, id: editingProduct ? editingProduct.id : Date.now().toString() };
    await saveProducts(editingProduct ? products.map(x => x.id === editingProduct.id ? p : x) : [...products, p]);
    resetForm(); notify(editingProduct ? "Producto actualizado" : "Producto agregado");
  };
  const moveProduct = async (i, dir) => { const arr = [...products]; const n = i + dir; if (n < 0 || n >= arr.length) return; [arr[i], arr[n]] = [arr[n], arr[i]]; const ok = await saveProducts(arr); if (ok) notify("Orden guardado ✓"); };
  const handleDelete = async (id) => { const ok = await saveProducts(products.filter(x => x.id !== id)); if (ok) notify("Producto eliminado ✓"); };
  const startEdit = (p) => { setForm({ name: p.name, category: p.category, price: p.price.toString(), description: p.description, inStock: p.inStock, images: p.images || [], gender: p.gender || "Unisex", sizes: p.sizes || [], team: p.team || "", driver: p.driver || "", featured: !!p.featured, salePrice: p.salePrice ? p.salePrice.toString() : "" }); setEditingProduct(p); setShowForm(true); };
  const resetForm = () => { setForm({ name: "", category: categories[0] || "", price: "", description: "", inStock: true, images: [], gender: genders[0] || "Unisex", sizes: [], team: "", driver: "", featured: false, salePrice: "" }); setEditingProduct(null); setShowForm(false); };

  const updateStat = (i, key, val) => { const s = [...content.stats]; s[i] = { ...s[i], [key]: val }; saveContent({ ...content, stats: s }); };
  const updateWhy = (i, key, val) => { const w = [...content.whyCards]; w[i] = { ...w[i], [key]: val }; saveContent({ ...content, whyCards: w }); };
  const updateFaq = (i, key, val) => { const f = [...content.faq]; f[i] = { ...f[i], [key]: val }; saveContent({ ...content, faq: f }); };
  const addFaq = () => saveContent({ ...content, faq: [...content.faq, { q: "Nueva pregunta", a: "Respuesta..." }] });
  const removeFaq = (i) => saveContent({ ...content, faq: content.faq.filter((_, j) => j !== i) });
  const updateTopBar = (i, val) => { const t = [...content.topBarMessages]; t[i] = val; saveContent({ ...content, topBarMessages: t }); };
  const addTopBar = () => saveContent({ ...content, topBarMessages: [...content.topBarMessages, "Nuevo mensaje"] });
  const removeTopBar = (i) => saveContent({ ...content, topBarMessages: content.topBarMessages.filter((_, j) => j !== i) });

  const goHome = () => {
    setOpenMenu(null);
    if (getRoute() === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.hash = "";
  };
  const goGame = () => {
    setOpenMenu(null);
    if (getRoute() === "game") window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.hash = "/juego";
  };
  const goCatalog = () => {
    setOpenMenu(null);
    if (getRoute() === "catalog") window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.hash = "/catalogo";
  };
  const goSale = () => {
    setOpenMenu(null);
    if (getRoute() === "sale") window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.hash = "/ofertas";
  };
  const filterByTeam = (teamName) => {
    setActiveTeam(teamName); setActiveCategory("Todos"); goCatalog();
  };
  const filterByDriver = (driverName) => {
    setActiveDriver(driverName); setActiveCategory("Todos"); goCatalog();
  };
  const filterByCategory = (cat) => {
    setActiveCategory(cat); goCatalog();
  };
  // Secciones que viven en la portada (sobre nosotros, preguntas frecuentes)
  const scrollToSection = (id) => {
    setOpenMenu(null);
    if (getRoute() !== "home") {
      window.location.hash = "";
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 400);
    } else {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const usedTeamNames = [...new Set(products.map(p => p.team).filter(Boolean))].sort();
  const saleProducts = products.filter(p => p.salePrice && p.inStock);
  const hasSaleProducts = saleProducts.length > 0;
  const usedDriverNames = [...new Set(products.map(p => p.driver).filter(Boolean))].sort();
  const newestProducts = [...products].filter(p => p.inStock).sort((a, b) => (b.id || "").localeCompare(a.id || "")).slice(0, 4);
  const featuredProducts = products.filter(p => p.featured && p.inStock).slice(0, 4);
  const stripProducts = (() => {
    const feat = products.filter(p => p.featured && p.inStock);
    const extra = newestProducts.filter(p => !feat.some(f => f.id === p.id));
    return [...feat, ...extra].slice(0, 10);
  })();

  const filtered = products.filter(p => {
    if (activeCategory !== "Todos" && p.category !== activeCategory) return false;
    if (activeGender !== "Todos" && p.gender !== activeGender) return false;
    if (activeTeam !== "Todos" && p.team !== activeTeam) return false;
    if (activeDriver !== "Todos" && p.driver !== activeDriver) return false;
    if (activeSize !== "Todos" && !(p.sizes || []).includes(activeSize)) return false;
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      const hay = [p.name, p.team, p.driver, p.category, p.description].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const shown = sortBy === "asc"
    ? [...filtered].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
    : sortBy === "desc"
      ? [...filtered].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
      : filtered;

  const activeFiltersCount = [activeGender, activeTeam, activeDriver, activeSize].filter(f => f !== "Todos").length;
  const clearFilters = () => { setActiveCategory("Todos"); setActiveGender("Todos"); setActiveTeam("Todos"); setActiveDriver("Todos"); setActiveSize("Todos"); setSearchQ(""); };

  // Enlace directo a un producto: pitstopelsalvador.netlify.app/#p/<id>
  // Al abrirlo, la página muestra el producto resaltado y hace scroll hasta él.
  useEffect(() => {
    const goToHash = () => {
      const m = window.location.hash.match(/^#p\/(.+)$/);
      if (!m) return;
      const id = decodeURIComponent(m[1]);
      if (!products.some(p => String(p.id) === id)) return;
      setActiveCategory("Todos"); setActiveGender("Todos"); setActiveTeam("Todos"); setActiveDriver("Todos"); setActiveSize("Todos"); setSearchQ("");
      setHighlightId(id);
      setTimeout(() => { const el = document.getElementById("prod-" + id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350);
      setTimeout(() => setHighlightId(null), 4000);
    };
    goToHash();
    window.addEventListener("hashchange", goToHash);
    return () => window.removeEventListener("hashchange", goToHash);
  }, [products]);

  const waLink = (p) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Pit Stop, me interesa: " + p.name + " ($" + (p.salePrice || p.price) + ")")}`;
  const waGeneral = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Pit Stop, me gustaría hacer un pedido.")}`;

  if (loading) return (
    <div style={S.loaderWrap}>
      <style>{GLOBAL_CSS}</style>
      <div style={S.loader}>
        <div style={{ width: 28, height: 2, background: "#E10600", marginBottom: 14 }} />
        Cargando
      </div>
    </div>
  );

  if (page === "admin" && !adminAuth) return (
    <div style={S.adminLoginWrap}>
      <style>{GLOBAL_CSS}</style>
      <div style={S.adminLoginCard}>
        <div style={{ width: 28, height: 2, background: "#E10600", margin: "0 auto 18px" }} />
        <h2 style={{ color: "#fff", margin: "0 0 20px", fontFamily: F_HEAD, fontSize: 20, fontWeight: 700 }}>Panel de Administración</h2>
        <input type="password" placeholder="Contraseña" value={adminPass} onChange={e => { setAdminPass(e.target.value); setPassError(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()} style={S.input} />
        {passError && <p style={{ color: "#E10600", fontSize: 13, margin: "8px 0 0" }}>Contraseña incorrecta</p>}
        <button className="btnp" onClick={handleLogin} style={{ ...S.btnRed, width: "100%", marginTop: 14 }}>Ingresar</button>
        <button onClick={() => setPage("landing")} style={{ ...S.btnOutline, width: "100%" }}>Volver al sitio</button>
      </div>
    </div>
  );

  if (page === "admin" && adminAuth) {
    const tabs = [{ id: "products", label: "Productos" }, { id: "roster", label: "Listas" }, { id: "content", label: "Contenido" }, { id: "branding", label: "Logo" }];
    return (
      <div style={S.adminWrap}>
        <style>{GLOBAL_CSS}</style>
        {notification && <div style={S.notif}>{notification}</div>}
        <div style={S.adminHeader}>
          <h2 style={{ color: "#fff", margin: 0, fontFamily: F_HEAD, fontSize: 19, fontWeight: 700 }}>Panel Admin — Pit Stop</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setPage("landing"); setAdminAuth(false); }} style={S.btnOutlineSm}>Ver sitio</button>
            <button onClick={() => { setAdminAuth(false); setPage("landing"); }} style={S.btnOutlineSm}>Cerrar sesión</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, margin: "18px 0", flexWrap: "wrap" }}>
          {tabs.map(t => <button key={t.id} onClick={() => setAdminTab(t.id)} style={adminTab === t.id ? S.catTabActive : S.catTab}>{t.label}</button>)}
        </div>

        {adminTab === "branding" && (
          <div style={S.formCard}>
            <h3 style={S.adminH3}>Logo de la tienda</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={S.logoPreview}>{logo ? <img src={logo} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span style={{ color: "#52525B", fontSize: 13 }}>Sin logo</span>}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btnp" onClick={() => logoRef.current?.click()} style={S.btnRed}>{logo ? "Cambiar" : "Subir"} logo</button>
                {logo && <button onClick={removeLogo} style={{ ...S.btnOutlineSm, borderColor: "#E10600", color: "#E10600" }}>Quitar logo</button>}
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </div>
            </div>
          </div>
        )}

        {adminTab === "roster" && (<>
          <div style={S.adminInfoBox}>
            <p style={{ color: "#fff", fontSize: 13, margin: 0, fontWeight: 600 }}>Configuración de listas</p>
            <p style={{ color: "#8A8A93", fontSize: 12, margin: "4px 0 0" }}>Administra todas las opciones disponibles para tus productos: categorías, géneros, tallas, escuderías y pilotos.</p>
          </div>

          <div style={S.formCard}>
            <div style={S.adminListHeader}>
              <h3 style={S.adminH3}>Categorías de productos ({categories.length})</h3>
              <button onClick={sortCategoriesAZ} style={S.btnOutlineSm}>Ordenar A-Z</button>
            </div>
            <p style={S.adminHint}>Usa las flechas para reordenar a tu gusto.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="Ej: Bucket Hats" style={S.input} />
              <button className="btnp" onClick={addCategory} style={S.btnRed}>Agregar</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {categories.map((c, i) => (
                <div key={c} style={S.listRow}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => moveCategory(i, -1)} disabled={i === 0} style={{ ...S.arrowBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} style={{ ...S.arrowBtn, opacity: i === categories.length - 1 ? 0.3 : 1 }}>↓</button>
                  </div>
                  <span style={{ color: "#52525B", fontSize: 11, width: 24 }}>{i + 1}</span>
                  <span style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 500 }}>{c}</span>
                  <button onClick={() => removeCategory(c)} style={{ ...S.btnOutlineSm, fontSize: 12, borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <div style={S.adminListHeader}>
              <h3 style={S.adminH3}>Géneros ({genders.length})</h3>
              <button onClick={sortGendersAZ} style={S.btnOutlineSm}>Ordenar A-Z</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={newGender} onChange={e => setNewGender(e.target.value)} onKeyDown={e => e.key === "Enter" && addGender()} placeholder="Ej: Kids" style={S.input} />
              <button className="btnp" onClick={addGender} style={S.btnRed}>Agregar</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {genders.map((g, i) => (
                <div key={g} style={S.listRow}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => moveGender(i, -1)} disabled={i === 0} style={{ ...S.arrowBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveGender(i, 1)} disabled={i === genders.length - 1} style={{ ...S.arrowBtn, opacity: i === genders.length - 1 ? 0.3 : 1 }}>↓</button>
                  </div>
                  <span style={{ color: "#52525B", fontSize: 11, width: 24 }}>{i + 1}</span>
                  <span style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 500 }}>{g}</span>
                  <button onClick={() => removeGender(g)} style={{ ...S.btnOutlineSm, fontSize: 12, borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <div style={S.adminListHeader}>
              <h3 style={S.adminH3}>Tallas ({sizes.length})</h3>
              <button onClick={sortSizesAZ} style={S.btnOutlineSm}>Ordenar A-Z</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => e.key === "Enter" && addSize()} placeholder="Ej: XS, 42, 6-12 meses" style={S.input} />
              <button className="btnp" onClick={addSize} style={S.btnRed}>Agregar</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sizes.map((s, i) => (
                <div key={s} style={S.listRow}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => moveSize(i, -1)} disabled={i === 0} style={{ ...S.arrowBtn, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => moveSize(i, 1)} disabled={i === sizes.length - 1} style={{ ...S.arrowBtn, opacity: i === sizes.length - 1 ? 0.3 : 1 }}>↓</button>
                  </div>
                  <span style={{ color: "#52525B", fontSize: 11, width: 24 }}>{i + 1}</span>
                  <span style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 500 }}>{s}</span>
                  <button onClick={() => removeSize(s)} style={{ ...S.btnOutlineSm, fontSize: 12, borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Escuderías ({teams.length})</h3>
            <p style={S.adminHint}>Sube el logo de cada escudería.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={newTeam} onChange={e => setNewTeam(e.target.value)} onKeyDown={e => e.key === "Enter" && addTeam()} placeholder="Ej: Cadillac" style={S.input} />
              <button className="btnp" onClick={addTeam} style={S.btnRed}>Agregar</button>
            </div>
            <input ref={teamImgRef} type="file" accept="image/*" onChange={handleTeamImageUpload} style={{ display: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
              {teams.map((t, i) => (
                <div key={t.name} style={S.rosterCard}>
                  <div style={S.rosterImgBox}>
                    {t.image ? <img src={t.image} alt={t.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <span style={{ color: "#3A3A40", fontSize: 11 }}>Sin logo</span>}
                  </div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "10px 0 8px", textAlign: "center" }}>{t.name}</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => { setUploadingTeamIdx(i); teamImgRef.current?.click(); }} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px" }}>{t.image ? "Cambiar" : "Logo"}</button>
                    {t.image && <button onClick={() => removeTeamImage(i)} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px", borderColor: "#52525B", color: "#52525B" }}>Quitar</button>}
                    <button onClick={() => removeTeam(t.name)} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px", borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Pilotos ({drivers.length})</h3>
            <p style={S.adminHint}>Sube la foto de cada piloto.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={newDriver} onChange={e => setNewDriver(e.target.value)} onKeyDown={e => e.key === "Enter" && addDriver()} placeholder="Ej: Sergio Pérez" style={S.input} />
              <button className="btnp" onClick={addDriver} style={S.btnRed}>Agregar</button>
            </div>
            <input ref={driverImgRef} type="file" accept="image/*" onChange={handleDriverImageUpload} style={{ display: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
              {drivers.map((d, i) => (
                <div key={d.name} style={S.rosterCard}>
                  <div style={{ ...S.rosterImgBox, borderRadius: "50%", width: 76, height: 76, margin: "0 auto" }}>
                    {d.image ? <img src={d.image} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <span style={{ color: "#3A3A40", fontSize: 11 }}>Sin foto</span>}
                  </div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: "10px 0 8px", textAlign: "center" }}>{d.name}</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => { setUploadingDriverIdx(i); driverImgRef.current?.click(); }} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px" }}>{d.image ? "Cambiar" : "Foto"}</button>
                    {d.image && <button onClick={() => removeDriverImage(i)} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px", borderColor: "#52525B", color: "#52525B" }}>Quitar</button>}
                    <button onClick={() => removeDriver(d.name)} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "4px 8px", borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {adminTab === "content" && (<>
          <div style={S.formCard}>
            <h3 style={S.adminH3}>Etiquetas del menú (navbar)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              <div><EditField label="Menú Ofertas" value={content.navSale || "Ofertas"} onChange={v => saveContent({ ...content, navSale: v })} /></div>
              <div><EditField label="Menú Catálogo" value={content.navCatalog || "Catálogo"} onChange={v => saveContent({ ...content, navCatalog: v })} /></div>
              <div><EditField label="Menú Escuderías" value={content.navTeams || "Escuderías"} onChange={v => saveContent({ ...content, navTeams: v })} /></div>
              <div><EditField label="Menú Pilotos" value={content.navDrivers || "Pilotos"} onChange={v => saveContent({ ...content, navDrivers: v })} /></div>
              <div><EditField label="Menú Sobre Nosotros" value={content.navAbout || "Sobre Nosotros"} onChange={v => saveContent({ ...content, navAbout: v })} /></div>
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Barra de confianza (bajo la portada)</h3>
            <p style={S.adminHint}>Cuatro textos cortos que responden las dudas del cliente de entrada. Dejá uno vacío para ocultarlo.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i}><EditField label={"Texto " + (i + 1)} value={(content.trustItems || [])[i] || ""} onChange={v => { const t = [...(content.trustItems || ["", "", "", ""])]; while (t.length < 4) t.push(""); t[i] = v; saveContent({ ...content, trustItems: t }); }} /></div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Barra superior (anuncios rotativos)</h3>
            {content.topBarMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={m} onChange={e => updateTopBar(i, e.target.value)} style={S.input} />
                <button onClick={() => removeTopBar(i)} style={{ ...S.btnOutlineSm, borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
              </div>
            ))}
            <button onClick={addTopBar} style={{ ...S.btnOutlineSm, marginTop: 4 }}>Agregar mensaje</button>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Nombre de la marca</h3>
            <EditField label="Parte 1 (blanco)" value={content.brandName1} onChange={v => saveContent({ ...content, brandName1: v })} />
            <EditField label="Parte 2 (rojo)" value={content.brandName2} onChange={v => saveContent({ ...content, brandName2: v })} />
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Sección Hero (Encabezado)</h3>
            <EditField label="Badge" value={content.heroBadge} onChange={v => saveContent({ ...content, heroBadge: v })} />
            <EditField label="Título (parte 1)" value={content.heroTitle1} onChange={v => saveContent({ ...content, heroTitle1: v })} />
            <EditField label="Título (rojo)" value={content.heroTitleHighlight} onChange={v => saveContent({ ...content, heroTitleHighlight: v })} />
            <EditField label="Subtítulo" value={content.heroSubtitle} onChange={v => saveContent({ ...content, heroSubtitle: v })} textarea />
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Sección Estadísticas</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {content.stats.map((s, i) => (
                <div key={i} style={S.adminSubCard}>
                  <EditField label="Valor" value={s.val} onChange={v => updateStat(i, "val", v)} />
                  <EditField label="Descripción" value={s.label} onChange={v => updateStat(i, "label", v)} />
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Sección "Nuevos en la Tienda"</h3>
            <EditField label="Título (parte 1)" value={content.newTitle1} onChange={v => saveContent({ ...content, newTitle1: v })} />
            <EditField label="Título (rojo)" value={content.newTitleHighlight} onChange={v => saveContent({ ...content, newTitleHighlight: v })} />
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Sección "Productos Destacados"</h3>
            <p style={S.adminHint}>Marca productos como "destacados" desde la pestaña Productos.</p>
            <EditField label="Título (parte 1)" value={content.featuredTitle1} onChange={v => saveContent({ ...content, featuredTitle1: v })} />
            <EditField label="Título (rojo)" value={content.featuredTitleHighlight} onChange={v => saveContent({ ...content, featuredTitleHighlight: v })} />
          </div>

          <div style={S.formCard}>
            </div>            <div style={S.formCard}>             <h3 style={S.adminH3}>Sección "En Oferta"</h3>             <p style={S.adminHint}>Aparece automáticamente cuando un producto tiene precio de oferta.</p>             <EditField label="Título (parte 1)" value={content.saleTitle1 || "En"} onChange={v => saveContent({ ...content, saleTitle1: v })} />             <EditField label="Título (rojo)" value={content.saleTitleHighlight || "oferta"} onChange={v => saveContent({ ...content, saleTitleHighlight: v })} />
            <EditField label="Título (parte 1)" value={content.catalogTitle1} onChange={v => saveContent({ ...content, catalogTitle1: v })} />
            <EditField label="Título (rojo)" value={content.catalogTitleHighlight} onChange={v => saveContent({ ...content, catalogTitleHighlight: v })} />
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Sección "Sobre Nosotros"</h3>
            <label style={S.label}>Imagen de la sección</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ ...S.logoPreview, width: 140, height: 100, borderRadius: 8 }}>
                {aboutImage ? <img src={aboutImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} /> : <span style={{ color: "#52525B", fontSize: 12 }}>Sin imagen</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btnp" onClick={() => aboutImgRef.current?.click()} style={S.btnRed}>{aboutImage ? "Cambiar" : "Subir"} imagen</button>
                {aboutImage && <button onClick={removeAboutImage} style={{ ...S.btnOutlineSm, borderColor: "#E10600", color: "#E10600" }}>Quitar imagen</button>}
                <input ref={aboutImgRef} type="file" accept="image/*" onChange={handleAboutImageUpload} style={{ display: "none" }} />
              </div>
            </div>
            <EditField label="Etiqueta superior (opcional)" value={content.aboutTagline || ""} onChange={v => saveContent({ ...content, aboutTagline: v })} />
            <EditField label="Título (parte 1)" value={content.aboutTitle1} onChange={v => saveContent({ ...content, aboutTitle1: v })} />
            <EditField label="Título (rojo)" value={content.aboutTitleHighlight} onChange={v => saveContent({ ...content, aboutTitleHighlight: v })} />
            <label style={S.label}>Texto principal</label>
            <textarea value={content.aboutText || ""} onChange={e => saveContent({ ...content, aboutText: e.target.value })} style={{ ...S.input, height: 180, resize: "vertical", lineHeight: 1.5 }} />
            <p style={S.adminHint}>Separa párrafos con una línea en blanco.</p>
            <label style={{ ...S.label, marginTop: 16 }}>Métricas destacadas (3)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {(content.aboutHighlights || []).map((h, i) => (
                <div key={i} style={S.adminSubCard}>
                  <EditField label="Valor" value={h.val} onChange={v => updateAboutHighlight(i, "val", v)} />
                  <EditField label="Descripción" value={h.label} onChange={v => updateAboutHighlight(i, "label", v)} />
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>¿Por qué elegirnos?</h3>
            <EditField label="Título (parte 1)" value={content.whyTitle1} onChange={v => saveContent({ ...content, whyTitle1: v })} />
            <EditField label="Título (rojo)" value={content.whyTitleHighlight} onChange={v => saveContent({ ...content, whyTitleHighlight: v })} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
              {content.whyCards.map((w, i) => (
                <div key={i} style={S.adminSubCard}>
                  <EditField label="Título" value={w.title} onChange={v => updateWhy(i, "title", v)} />
                  <EditField label="Descripción" value={w.desc} onChange={v => updateWhy(i, "desc", v)} textarea />
                </div>
              ))}
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Preguntas Frecuentes (FAQ)</h3>
            <EditField label="Título (parte 1)" value={content.faqTitle1} onChange={v => saveContent({ ...content, faqTitle1: v })} />
            <EditField label="Título (rojo)" value={content.faqTitleHighlight} onChange={v => saveContent({ ...content, faqTitleHighlight: v })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {content.faq.map((item, i) => (
                <div key={i} style={S.adminSubCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: "#71717A", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>PREGUNTA {i + 1}</span>
                    <button onClick={() => removeFaq(i)} style={{ ...S.btnOutlineSm, fontSize: 11, padding: "3px 8px", borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                  </div>
                  <EditField label="Pregunta" value={item.q} onChange={v => updateFaq(i, "q", v)} />
                  <EditField label="Respuesta" value={item.a} onChange={v => updateFaq(i, "a", v)} textarea />
                </div>
              ))}
              <button onClick={addFaq} style={{ ...S.btnOutlineSm, marginTop: 4 }}>Agregar pregunta</button>
            </div>
          </div>

          <div style={S.formCard}>
            <h3 style={S.adminH3}>Llamado a la Acción (CTA Final)</h3>
            <EditField label="Título" value={content.ctaTitle} onChange={v => saveContent({ ...content, ctaTitle: v })} />
            <EditField label="Subtítulo" value={content.ctaSubtitle} onChange={v => saveContent({ ...content, ctaSubtitle: v })} />
          </div>
        </>)}

        {adminTab === "products" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 12px", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#8A8A93", fontSize: 14 }}>{products.length} productos</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input ref={importFileRef} type="file" accept=".xlsx,.xlsm" style={{ display: "none" }} onChange={e => handleImportFile(e.target.files && e.target.files[0])} />
              <button onClick={() => importFileRef.current && importFileRef.current.click()} disabled={importBusy} style={{ ...S.btnRed, background: "transparent", border: "1px solid #3F3F46", color: "#D4D4D8", cursor: importBusy ? "wait" : "pointer" }}>
                {importBusy ? "Leyendo…" : "📥 Importar Excel"}
              </button>
              <button className="btnp" onClick={() => { resetForm(); setShowForm(true); }} style={S.btnRed}>Agregar producto</button>
            </div>
          </div>

          {importPlan && (() => {
            const matchedIds = new Set(importPlan.items.filter(i => i.choice.startsWith("match:")).map(i => i.choice.slice(6)));
            const nuevos = importPlan.items.filter(i => i.choice === "new").length;
            const actualizar = matchedIds.size;
            const omitidos = importPlan.items.filter(i => i.choice === "skip").length;
            const aAgotar = importPlan.markMissing ? products.filter(p => p.inStock && !matchedIds.has(String(p.id))) : [];
            const setChoice = (idx, v) => setImportPlan(pl => ({ ...pl, items: pl.items.map((it, j) => j === idx ? { ...it, choice: v } : it) }));
            return (
              <div style={{ ...S.formCard, border: "1px solid #E10600" }}>
                <h3 style={S.adminH3}>Vista previa de importación — hoja "{importPlan.hoja}"</h3>
                <p style={S.adminHint}>
                  {importPlan.items.length} productos con stock disponible en el Excel → <b style={{ color: "#8FE38F" }}>{nuevos} se crearán</b> · <b style={{ color: "#7EB8FF" }}>{actualizar} actualizarán uno existente</b>{omitidos > 0 && <> · {omitidos} no se importarán</>}. Revisá cada fila: el menú dice qué se hará. Al elegir "actualizar", el producto <b>toma el nombre del Excel</b> (el del proveedor actual) y conserva sus fotos. <b>Nada se guarda hasta que presiones Aplicar.</b>
                </p>
                <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                  {importPlan.items.map((it, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) minmax(220px, 1fr)", gap: 10, alignItems: "center", background: "#0D0D0F", border: "1px solid #1E1E22", borderRadius: 8, padding: "10px 12px" }}>
                      <div>
                        <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{it.name}</div>
                        <div style={{ color: "#71717A", fontSize: 11.5, marginTop: 3 }}>
                          {it.units} en stock · ${it.price} · {it.sizes.join(", ") || "sin talla"}{it.cat ? " · " + it.cat : ""}
                        </div>
                      </div>
                      <div>
                      {it.choice.startsWith("match:") && (() => {
                        const m = it.candidatos.find(c => "match:" + c.id === it.choice);
                        return m && m.name !== it.name ? <div style={{ color: "#D4A017", fontSize: 11, marginBottom: 5 }}>✏️ "{m.name.slice(0, 48)}{m.name.length > 48 ? "…" : ""}" pasará a llamarse como en el Excel</div> : null;
                      })()}
                      <select value={it.choice} onChange={e => setChoice(idx, e.target.value)} style={{ ...S.input, marginBottom: 0, fontSize: 12.5 }}>
                        <option value="new">➕ Crear como producto nuevo</option>
                        {it.candidatos.map(c => (
                          <option key={c.id} value={"match:" + c.id}>↻ {Math.round(c.score * 100)}% — actualizar: {c.name}</option>
                        ))}
                        <option value="skip">— No importar</option>
                      </select>
                      </div>
                    </div>
                  ))}
                </div>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "16px 0 6px", cursor: "pointer" }}>
                  <input type="checkbox" checked={importPlan.markMissing} onChange={e => setImportPlan(pl => ({ ...pl, markMissing: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#E10600", marginTop: 2 }} />
                  <span style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.5 }}>
                    Marcar como <b>Agotado</b> los productos del sitio que no quedaron emparejados con stock del Excel
                    {importPlan.markMissing && aAgotar.length > 0 && <> — afecta a <b style={{ color: "#FF4438" }}>{aAgotar.length}</b>: <span style={{ color: "#71717A" }}>{aAgotar.slice(0, 6).map(p => p.name).join(" · ")}{aAgotar.length > 6 ? " · …" : ""}</span></>}
                    {importPlan.markMissing && aAgotar.length === 0 && <> — ninguno se ve afectado</>}
                  </span>
                </label>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="btnp" onClick={applyImport} style={S.btnRed}>Aplicar importación</button>
                  <button onClick={() => setImportPlan(null)} style={{ ...S.btnRed, background: "transparent", border: "1px solid #3F3F46", color: "#A1A1AA" }}>Cancelar</button>
                </div>
              </div>
            );
          })()}

          {showForm && (
            <div style={S.formCard}>
              <h3 style={S.adminH3}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h3>
              <div style={S.formGrid}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <EditField label="Nombre *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={S.label}>Categoría</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={S.input}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Género</label>
                      <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={S.input}>
                        {genders.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <EditField label="Precio (USD) *" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />                   <EditField label="Precio de oferta (USD) — dejar vacío si no está en oferta" value={form.salePrice || ""} onChange={v => setForm(f => ({ ...f, salePrice: v }))} />
                  <label style={S.label}>Tallas disponibles</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {sizes.map(sz => (
                      <button key={sz} onClick={() => toggleSize(sz)} style={{ padding: "6px 12px", borderRadius: 6, border: form.sizes.includes(sz) ? "1px solid #E10600" : "1px solid #2A2A2F", background: form.sizes.includes(sz) ? "rgba(225,6,0,0.12)" : "#19191C", color: form.sizes.includes(sz) ? "#FF4438" : "#8A8A93", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F_BODY }}>{sz}</button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={S.label}>Escudería</label>
                      <select value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} style={S.input}>
                        <option value="">Sin escudería</option>
                        {teams.map(t => <option key={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Piloto</label>
                      <select value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} style={S.input}>
                        <option value="">Sin piloto</option>
                        {drivers.map(d => <option key={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <EditField label="Descripción" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} textarea />
                  <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 12 }}>
                    <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} /> En stock
                  </label>
                  <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 4 }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} /> Producto destacado
                  </label>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label style={S.label}>Imágenes ({form.images.length}/6)</label>
                  <div style={S.imgGrid}>
                    {form.images.map((img, i) => (
                      <div key={i} style={S.imgThumbWrap}>
                        <img src={img} alt="" style={S.imgThumb} />
                        {i === 0 && <span style={S.mainBadge}>Principal</span>}
                        <div style={S.imgActions}>
                          {i > 0 && <button onClick={() => moveImage(i, -1)} style={S.imgActBtn}>←</button>}
                          {i < form.images.length - 1 && <button onClick={() => moveImage(i, 1)} style={S.imgActBtn}>→</button>}
                          <button onClick={() => removeImage(i)} style={{ ...S.imgActBtn, color: "#FF4438" }}>✕</button>
                        </div>
                      </div>
                    ))}
                    {form.images.length < 6 && (
                      <div onClick={() => fileRef.current?.click()} style={S.imgAddBtn}>
                        <span style={{ fontSize: 22, color: "#52525B" }}>+</span><span style={{ fontSize: 11, color: "#52525B" }}>Agregar</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
                  <p style={S.adminHint}>La primera imagen es la portada. Se comprimen automáticamente.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btnp" onClick={handleSave} style={S.btnRed}>{editingProduct ? "Guardar cambios" : "Agregar"}</button>
                <button onClick={resetForm} style={S.btnOutlineSm}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.map((p, pi) => (
             <div key={p.id} style={S.adminRow}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button onClick={() => moveProduct(pi, -1)} disabled={pi === 0} style={{ ...S.arrowBtn, opacity: pi === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => moveProduct(pi, 1)} disabled={pi === products.length - 1} style={{ ...S.arrowBtn, opacity: pi === products.length - 1 ? 0.3 : 1 }}>↓</button>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 6, background: "#19191C", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.images && p.images.length > 0 ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#3A3A40", fontSize: 10 }}>—</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {p.name} {p.featured && <span style={{ border: "1px solid rgba(225,6,0,0.4)", color: "#FF4438", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Destacado</span>}
                  </div>
                  <div style={{ color: "#8A8A93", fontSize: 12 }}>{p.category} · ${p.price.toFixed(2)} · {p.gender || "Unisex"}{p.team ? (" · " + p.team) : ""}{p.driver ? (" · " + p.driver) : ""}</div>
                  <div style={{ color: "#52525B", fontSize: 11 }}>{p.inStock ? "En stock" : "Agotado"} · {p.images ? p.images.length : 0} foto{(p.images?.length || 0) !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(p)} style={{ ...S.btnOutlineSm, fontSize: 12 }}>Editar</button>
                  <button onClick={() => handleDelete(p.id)} style={{ ...S.btnOutlineSm, fontSize: 12, borderColor: "#E10600", color: "#E10600" }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>)}
        <p style={{ color: "#3A3A40", fontSize: 12, textAlign: "center", marginTop: 28 }}>Contraseña: {ADMIN_PASSWORD}</p>
      </div>
    );
  }

  return (
    <div style={S.landing}>
      <style>{GLOBAL_CSS}</style>
      {notification && <div style={S.notif}>{notification}</div>}
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.startIdx} onClose={() => setLightbox(null)} shareUrl={lightbox.pid ? window.location.origin + window.location.pathname + "#p/" + lightbox.pid : null} onShared={() => notify("Enlace del producto copiado ✓")} />}

      {!lightbox && (
        <a href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.floatingWa}>
          <WaIcon size={24} />
        </a>
      )}

      <TopBar messages={(() => { const rm = raceCountdownMsg(f1.nextRace, f1.nowMs); return rm ? [rm, ...(content.topBarMessages || [])] : content.topBarMessages; })()} />

      <nav style={S.nav}><div style={S.navInner}>
        <div onClick={goHome} title="Volver a la portada" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0, cursor: "pointer" }}>
          {logo && <img src={logo} alt="Logo" style={{ height: isMobile ? 28 : 34, objectFit: "contain" }} />}
          <span style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 15 : 17, fontFamily: F_HEAD, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {content.brandName1} <span style={{ color: "#E10600" }}>{content.brandName2}</span>
          </span>
        </div>

        {isMobile ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setCartOpen(true)} style={S.cartNavBtn} aria-label="Ver carrito">
              🛒{cart.count > 0 && <span style={S.cartBadge}>{cart.count}</span>}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} style={S.hamburger} aria-label="Abrir menú">
              <span style={S.hamburgerBar} /><span style={S.hamburgerBar} /><span style={S.hamburgerBar} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {route !== "home" && (
              <button className="navbtn" onClick={goHome} style={S.navDropdownBtn}>
                Inicio
              </button>
            )}
            <button className="navbtn" onClick={goGame} style={S.navDropdownBtn}>
              Juego 🚦
            </button>
            {hasSaleProducts && (
              <button className="navbtn" onClick={goSale} style={{ ...S.navDropdownBtn, color: "#FF4438", fontWeight: 600 }}>
                {content.navSale || "Ofertas"}
              </button>
            )}
            <div style={{ position: "relative" }} onMouseLeave={() => setOpenMenu(null)}>
              <button className="navbtn" onClick={() => setOpenMenu(openMenu === "catalog" ? null : "catalog")} onMouseEnter={() => setOpenMenu("catalog")} style={S.navDropdownBtn}>
                {content.navCatalog || "Catálogo"} <span style={{ fontSize: 9, marginLeft: 5, opacity: 0.6 }}>▾</span>
              </button>
              {openMenu === "catalog" && (
                <div style={S.dropdown}>
                  <div style={S.dropdownHeader}>Categorías</div>
                  <div style={S.dropdownList}>
                    <button className="ditem" onClick={() => filterByCategory("Todos")} style={{ ...S.dropdownItem, color: "#FF4438", fontWeight: 600 }}>Ver todo</button>
                    {categories.map(c => <button className="ditem" key={c} onClick={() => filterByCategory(c)} style={S.dropdownItem}>{c}</button>)}
                  </div>
                </div>
              )}
            </div>
            {teams.length > 0 && (
              <div style={{ position: "relative" }} onMouseLeave={() => setOpenMenu(null)}>
                <button className="navbtn" onClick={() => setOpenMenu(openMenu === "teams" ? null : "teams")} onMouseEnter={() => setOpenMenu("teams")} style={S.navDropdownBtn}>
                  {content.navTeams || "Escuderías"} <span style={{ fontSize: 9, marginLeft: 5, opacity: 0.6 }}>▾</span>
                </button>
                {openMenu === "teams" && (
                  <div style={S.dropdown}>
                    <div style={S.dropdownHeader}>Escuderías</div>
                    <div style={S.dropdownList}>
                      {teams.map(t => (
                        <button className="ditem" key={t.name} onClick={() => { filterByTeam(t.name); setOpenMenu(null); }} style={S.dropdownItem}>
                          {t.image && <img src={t.image} alt="" style={{ width: 22, height: 22, objectFit: "contain", marginRight: 10 }} />}
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {drivers.length > 0 && (
              <div style={{ position: "relative" }} onMouseLeave={() => setOpenMenu(null)}>
                <button className="navbtn" onClick={() => setOpenMenu(openMenu === "drivers" ? null : "drivers")} onMouseEnter={() => setOpenMenu("drivers")} style={S.navDropdownBtn}>
                  {content.navDrivers || "Pilotos"} <span style={{ fontSize: 9, marginLeft: 5, opacity: 0.6 }}>▾</span>
                </button>
                {openMenu === "drivers" && (
                  <div style={S.dropdown}>
                    <div style={S.dropdownHeader}>Pilotos</div>
                    <div style={S.dropdownList}>
                      {drivers.map(d => (
                        <button className="ditem" key={d.name} onClick={() => { filterByDriver(d.name); setOpenMenu(null); }} style={S.dropdownItem}>
                          {d.image ? <img src={d.image} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: "50%", marginRight: 10 }} /> : <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#222226", marginRight: 10, flexShrink: 0 }} />}
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div style={{ position: "relative" }} onMouseLeave={() => setOpenMenu(null)}>
              <button className="navbtn" onClick={() => setOpenMenu(openMenu === "about" ? null : "about")} onMouseEnter={() => setOpenMenu("about")} style={S.navDropdownBtn}>
                {content.navAbout || "Sobre Nosotros"} <span style={{ fontSize: 9, marginLeft: 5, opacity: 0.6 }}>▾</span>
              </button>
              {openMenu === "about" && (
                <div style={S.dropdown}>
                  <div style={S.dropdownHeader}>Información</div>
                  <div style={S.dropdownList}>
                    <button className="ditem" onClick={() => scrollToSection("about")} style={S.dropdownItem}>Nuestra historia</button>
                    <button className="ditem" onClick={() => scrollToSection("faq")} style={S.dropdownItem}>Preguntas frecuentes</button>
                    <a className="ditem" href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ ...S.dropdownItem, textDecoration: "none" }}>Contáctanos</a>
                  </div>
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 18, background: "#222226", margin: "0 10px" }} />
            <a className="navbtn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={S.navLink}>Instagram</a>
            <button onClick={() => setCartOpen(true)} style={{ ...S.cartNavBtn, marginLeft: 6 }}>
              🛒 Carrito{cart.count > 0 && <span style={S.cartBadge}>{cart.count}</span>}
            </button>
            <a className="btnp" href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.navCta}>WhatsApp</a>
            <button onClick={() => setPage("admin")} style={{ background: "none", border: "none", color: "#3A3A40", cursor: "pointer", fontSize: 13, padding: "4px 6px" }}>⚙</button>
          </div>
        )}
      </div></nav>

      {isMobile && mobileMenuOpen && (
        <div style={S.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div style={S.mobileDrawer} onClick={e => e.stopPropagation()}>
            <div style={S.mobileDrawerHeader}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: F_HEAD }}>{content.brandName1} <span style={{ color: "#E10600" }}>{content.brandName2}</span></span>
              <button onClick={() => setMobileMenuOpen(false)} style={S.mobileDrawerClose}>×</button>
            </div>
            <div style={S.mobileDrawerBody}>
              {mobileSection === null && (<>
                <button onClick={() => { setMobileMenuOpen(false); goHome(); }} style={S.mobileNavItem}><span>Inicio</span></button>
                <button onClick={() => { setMobileMenuOpen(false); goGame(); }} style={S.mobileNavItem}><span>Juego 🚦</span></button>
                {hasSaleProducts && <button onClick={() => { setMobileMenuOpen(false); goSale(); }} style={{ ...S.mobileNavItem, color: "#FF4438", fontWeight: 600 }}><span>{content.navSale || "Ofertas"}</span></button>}
                <button onClick={() => setMobileSection("catalog")} style={S.mobileNavItem}><span>{content.navCatalog || "Catálogo"}</span><span style={{ color: "#52525B" }}>›</span></button>
                {teams.length > 0 && <button onClick={() => setMobileSection("teams")} style={S.mobileNavItem}><span>{content.navTeams || "Escuderías"}</span><span style={{ color: "#52525B" }}>›</span></button>}
                {drivers.length > 0 && <button onClick={() => setMobileSection("drivers")} style={S.mobileNavItem}><span>{content.navDrivers || "Pilotos"}</span><span style={{ color: "#52525B" }}>›</span></button>}
                <button onClick={() => setMobileSection("about")} style={S.mobileNavItem}><span>{content.navAbout || "Sobre Nosotros"}</span><span style={{ color: "#52525B" }}>›</span></button>
                <div style={{ height: 1, background: "#1A1A1E", margin: "10px 0" }} />
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{ ...S.mobileNavItem, textDecoration: "none" }}><span>Instagram</span><span style={{ color: "#52525B" }}>↗</span></a>
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{ ...S.mobileNavItem, textDecoration: "none" }}><span>WhatsApp</span><span style={{ color: "#25D366" }}>↗</span></a>
                <button onClick={() => { setPage("admin"); setMobileMenuOpen(false); }} style={{ ...S.mobileNavItem, color: "#52525B", fontSize: 13 }}><span>Panel admin</span></button>
              </>)}
              {mobileSection === "catalog" && (<>
                <button onClick={() => setMobileSection(null)} style={S.mobileBackBtn}>‹ Volver</button>
                <div style={S.mobileSectionTitle}>Categorías</div>
                <button onClick={() => { filterByCategory("Todos"); setMobileMenuOpen(false); }} style={{ ...S.mobileNavItem, color: "#FF4438", fontWeight: 600 }}><span>Ver todo</span></button>
                {categories.map(c => <button key={c} onClick={() => { filterByCategory(c); setMobileMenuOpen(false); }} style={S.mobileNavItem}><span>{c}</span></button>)}
              </>)}
              {mobileSection === "teams" && (<>
                <button onClick={() => setMobileSection(null)} style={S.mobileBackBtn}>‹ Volver</button>
                <div style={S.mobileSectionTitle}>Escuderías</div>
                {teams.map(t => (
                  <button key={t.name} onClick={() => { filterByTeam(t.name); setMobileMenuOpen(false); }} style={S.mobileNavItem}>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {t.image ? <img src={t.image} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} /> : <span style={{ width: 26, height: 26, background: "#19191C", borderRadius: 4, flexShrink: 0 }} />}
                      {t.name}
                    </span>
                  </button>
                ))}
              </>)}
              {mobileSection === "drivers" && (<>
                <button onClick={() => setMobileSection(null)} style={S.mobileBackBtn}>‹ Volver</button>
                <div style={S.mobileSectionTitle}>Pilotos</div>
                {drivers.map(d => (
                  <button key={d.name} onClick={() => { filterByDriver(d.name); setMobileMenuOpen(false); }} style={S.mobileNavItem}>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {d.image ? <img src={d.image} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} /> : <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#19191C", flexShrink: 0 }} />}
                      {d.name}
                    </span>
                  </button>
                ))}
              </>)}
              {mobileSection === "about" && (<>
                <button onClick={() => setMobileSection(null)} style={S.mobileBackBtn}>‹ Volver</button>
                <div style={S.mobileSectionTitle}>Información</div>
                <button onClick={() => { setMobileMenuOpen(false); scrollToSection("about"); }} style={S.mobileNavItem}><span>Nuestra historia</span></button>
                <button onClick={() => { setMobileMenuOpen(false); scrollToSection("faq"); }} style={S.mobileNavItem}><span>Preguntas frecuentes</span></button>
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{ ...S.mobileNavItem, textDecoration: "none" }}><span>Contáctanos</span></a>
              </>)}
            </div>
          </div>
        </div>
      )}

      {route === "home" && (<>
      <section style={S.hero}>
        <div style={S.heroInner}>
          {logo && <img src={logo} alt="Logo" className="fadeup" style={{ height: 72, marginBottom: 28, objectFit: "contain" }} />}
          <div className="fadeup d1" style={S.heroBadge}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E10600", flexShrink: 0 }} />{content.heroBadge}</div>
          <h1 className="fadeup d2" style={S.heroTitle}>{content.heroTitle1} <span style={{ color: "#E10600" }}>{content.heroTitleHighlight}</span></h1>
          <p className="fadeup d3" style={S.heroSub}>{content.heroSubtitle}</p>
          <div className="fadeup d4" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btnp" href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.btnPrimary}>
              <WaIcon size={15} /> Pedir por WhatsApp
            </a>
            <a className="btng" href="#/catalogo" style={S.btnGhost}>Ver catálogo</a>
            <a className="btng" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={S.btnGhost}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginRight: 8, flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" /></svg>
              Instagram
            </a>
          </div>
        </div>
        <div style={S.heroLine} />
      </section>

      {(content.trustItems || []).filter(Boolean).length > 0 && (
        <div style={S.trustStrip}>
          <div style={S.trustInner}>
            {(content.trustItems || []).filter(Boolean).map((t, i) => (
              <div key={i} style={S.trustItem}><span style={S.trustDot} />{t}</div>
            ))}
          </div>
        </div>
      )}

      <section style={S.statsStrip}>
        <div style={S.statsInner}>
          {content.stats.map((s, i) => (
            <div key={i} className="statitem" style={S.statItem}>
              <div style={S.statVal}>{s.val}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
          {products.length > 0 && (
            <div className="statitem" style={S.statItem}>
              <div style={S.statVal}>{products.filter(p => p.inStock).length}</div>
              <div style={S.statLabel}>En stock ahora</div>
            </div>
          )}
        </div>
      </section>

      {(f1.drivers || f1.nextRace || f1.lastRace) && (
        <section style={S.seasonWrap}>
          <div style={S.seasonInner}>
            <SectionTitle part1="Así va la" highlight="temporada" align="left" meta={"Fórmula 1 en vivo" + (f1.season ? " · " + f1.season : "")} />
            <div style={S.seasonGrid}>
              {f1.lastRace && (
                <div style={S.seasonCard}>
                  <div style={S.seasonCardTitle}>Última carrera</div>
                  <div style={S.seasonCardBig}>{raceDisplayName(f1.lastRace.name)}</div>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                    {f1.lastRace.podium.map(r => (
                      <div key={r.pos} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                        <span style={{ ...S.standPos, width: 24 }}>P{r.pos}</span>
                        <span style={S.standName}>{r.name}</span>
                        <span style={S.standPts}>{r.team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {f1.nextRace && (
                <div style={S.seasonCard}>
                  <div style={S.seasonCardTitle}>Próxima carrera</div>
                  <div style={S.seasonCardBig}>{countryFlag(f1.nextRace)} {raceDisplayName(f1.nextRace.raceName)}</div>
                  <div style={{ color: "#A1A1AA", fontSize: 13, marginTop: 6 }}>{fmtRaceDate(f1.nextRace)}</div>
                  <div style={{ marginTop: 12, fontFamily: F_HEAD, fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.01em" }}>{countdownShort(f1.nextRace, f1.nowMs)}</div>
                  <div style={S.standPts}>para las luces apagadas</div>
                  {upcomingRaces.length > 0 && (
                    <div style={{ marginTop: 14, borderTop: "1px solid #1E1E22", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {upcomingRaces.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                          <span>{countryFlag(r)}</span>
                          <span style={{ ...S.standName, flex: 1 }}>{raceDisplayName(r.raceName)}</span>
                          <span style={S.standPts}>{fmtRaceDateShort(r)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {f1.drivers && (
                <div style={S.seasonCard}>
                  <div style={S.seasonCardTitle}>Líderes del campeonato</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                    <div>
                      <div style={S.standPts}>Pilotos</div>
                      <div style={S.seasonLeader}>{f1.drivers[0].name} <span style={{ color: "#E10600" }}>· {f1.drivers[0].pts} pts</span></div>
                    </div>
                    {f1.constructors && (
                      <div>
                        <div style={S.standPts}>Escuderías</div>
                        <div style={S.seasonLeader}>{f1.constructors[0].name} <span style={{ color: "#E10600" }}>· {f1.constructors[0].pts} pts</span></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {(f1.drivers || f1.constructors) && (
              <div style={S.seasonTables}>
                {f1.drivers && (
                  <div>
                    <div style={{ ...S.seasonCardTitle, marginBottom: 10 }}>Clasificación de pilotos</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {f1.drivers.map(st => {
                        const match = usedDriverNames.find(n => st.family && n.toLowerCase().includes(st.family.toLowerCase()));
                        const row = (<>
                          <span style={{ ...S.standPos, width: 26, flexShrink: 0 }}>P{st.pos}</span>
                          <span style={{ ...S.standName, flex: 1 }}>{st.name}</span>
                          {match && <span style={{ color: "#52525B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Ver merch</span>}
                          <span style={S.standPts}>{st.pts} pts</span>
                        </>);
                        return match ? (
                          <button key={st.pos} className="standitem" onClick={() => filterByDriver(match)} title={"Ver productos de " + st.name} style={{ ...S.seasonRow, cursor: "pointer" }}>{row}</button>
                        ) : (
                          <div key={st.pos} style={S.seasonRow}>{row}</div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {f1.constructors && (
                  <div>
                    <div style={{ ...S.seasonCardTitle, marginBottom: 10 }}>Clasificación de escuderías</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {f1.constructors.map(c => {
                        const cn = (c.name || "").toLowerCase();
                        const match = usedTeamNames.find(n => n.toLowerCase().includes(cn) || cn.includes(n.toLowerCase()));
                        const row = (<>
                          <span style={{ ...S.standPos, width: 26, flexShrink: 0 }}>P{c.pos}</span>
                          <span style={{ ...S.standName, flex: 1 }}>{c.name}</span>
                          {match && <span style={{ color: "#52525B", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Ver merch</span>}
                          <span style={S.standPts}>{c.pts} pts</span>
                        </>);
                        return match ? (
                          <button key={c.pos} className="standitem" onClick={() => filterByTeam(match)} title={"Ver productos de " + c.name} style={{ ...S.seasonRow, cursor: "pointer" }}>{row}</button>
                        ) : (
                          <div key={c.pos} style={S.seasonRow}>{row}</div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {news && news.items && news.items.length > 0 && (
        <section style={{ ...S.section, paddingBottom: 24 }}>
          <SectionTitle part1="Últimas de la" highlight="Fórmula 1" align="left" meta={"titulares de " + (news.source || "la prensa") + " · se actualizan solos"} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {news.items.slice(0, 4).map((n, i) => (
              <a key={i} className="newsrow" href={n.link} target="_blank" rel="noopener noreferrer" style={S.newsRow}>
                <span style={S.newsTitle}>{n.title}</span>
                <span style={S.newsMeta}>{(news.source || "Fuente")}{fmtNewsDate(n.date) ? " · " + fmtNewsDate(n.date) : ""} ↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {(featuredProducts.length > 0 || newestProducts.length > 0) && (
        <section style={S.section}>
          <SectionTitle
            part1={featuredProducts.length > 0 ? content.featuredTitle1 : content.newTitle1}
            highlight={featuredProducts.length > 0 ? content.featuredTitleHighlight : content.newTitleHighlight}
            align="left"
            meta={products.length > 0 ? products.length + " productos en la tienda" : null}
          />
          {stripProducts.length >= 4 ? (
            <div className="prodticker" style={S.prodTicker}>
              <div className="prodtrack" style={{ animationDuration: (stripProducts.length * 7) + "s" }}>
                {[0, 1].map(dup => (
                  <div key={dup} aria-hidden={dup === 1} style={S.prodTrackHalf}>
                    {stripProducts.map(p => (
                      <div key={p.id + "-" + dup} style={S.prodTickerItem}>
                        <ProductCard p={p} waLink={waLink} onImageClick={openLightbox} onAdd={addToCart} highlight={highlightId === p.id} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pgrid" style={S.productGrid}>
              {(featuredProducts.length > 0 ? featuredProducts : newestProducts).map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} onAdd={addToCart} highlight={highlightId === p.id} />)}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a className="btng" href="#/catalogo" style={S.btnGhost}>Ver catálogo completo →</a>
          </div>
        </section>
      )}

      {saleProducts.length > 0 && (
        <section style={{ ...S.section, borderTop: "1px solid #18181B" }}>
          <SectionTitle part1={content.saleTitle1 || "En"} highlight={content.saleTitleHighlight || "oferta"} align="left" meta={saleProducts.length + " productos rebajados"} />
          <div className="pgrid" style={S.productGrid}>
            {saleProducts.slice(0, 4).map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} onAdd={addToCart} highlight={highlightId === p.id} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a className="btng" href="#/ofertas" style={S.btnGhost}>Ver todas las ofertas →</a>
          </div>
        </section>
      )}
      </>)}

      {route === "sale" && (
        <section style={{ ...S.section, paddingTop: 48 }}>
          <button className="ftlink" onClick={goHome} style={S.backLink}>← Volver a la portada</button>
          <SectionTitle part1={content.saleTitle1 || "En"} highlight={content.saleTitleHighlight || "oferta"} align="left" meta={saleProducts.length + " productos rebajados"} />
          {saleProducts.length === 0 && (
            <p style={{ color: "#52525B", padding: "30px 0" }}>
              Por ahora no hay productos en oferta. Pasá por el <a href="#/catalogo" style={{ color: "#FF4438" }}>catálogo completo</a> — seguro encontrás algo.
            </p>
          )}
          <div className="pgrid" style={S.productGrid}>
            {saleProducts.map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} onAdd={addToCart} highlight={highlightId === p.id} />)}
          </div>
        </section>
      )}

      {route === "game" && (
        <section style={{ ...S.section, paddingTop: 48 }}>
          <button className="ftlink" onClick={goHome} style={S.backLink}>← Volver a la portada</button>
          <SectionTitle part1="Pit" highlight="Lane" align="left" meta="dos juegos rápidos · gratis" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <LightsOutGame />
            <PodiumGame nextRace={f1.nextRace} drivers={f1.driversAll || f1.drivers} />
          </div>
          <div style={{ color: "#52525B", fontSize: 12.5, marginTop: 24, maxWidth: "70ch" }}>
            Mientras esperás la próxima carrera… <a href="#/catalogo" style={{ color: "#FF4438", textDecoration: "none" }}>pasá por el catálogo</a> — tu escudería tiene merch nuevo.
          </div>
        </section>
      )}

      {route === "catalog" && (<>
      <section id="catalogo" style={{ ...S.section, paddingTop: 48 }}>
        <button className="ftlink" onClick={goHome} style={S.backLink}>← Volver a la portada</button>
        <SectionTitle part1={content.catalogTitle1} highlight={content.catalogTitleHighlight} align="left" meta={products.length > 0 ? shown.length + " de " + products.length + " productos" : null} />

        <div style={S.catTabs}>
          <FilterPill label="Todos" active={activeCategory === "Todos"} onClick={() => setActiveCategory("Todos")} />
          {categories.map(c => <FilterPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />)}
        </div>

        <div style={S.searchRow}>
          <input
            className="srch"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Buscar producto, escudería o piloto…"
            aria-label="Buscar en el catálogo"
            style={S.searchInput}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Ordenar productos" style={S.sortSelect}>
            <option value="rec">Orden: recomendados</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button onClick={() => setShowFilters(!showFilters)} style={S.filterToggle}>
            Filtros avanzados {activeFiltersCount > 0 && <span style={S.filterCount}>{activeFiltersCount}</span>}
          </button>
          {activeFiltersCount > 0 && <button onClick={clearFilters} style={{ background: "none", border: "none", color: "#E10600", cursor: "pointer", fontSize: 12, marginLeft: 10, fontFamily: F_BODY }}>Limpiar</button>}
        </div>

        {showFilters && (
          <div style={S.filterPanel}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
              <div>
                <label style={S.filterLabel}>Género</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <FilterPill label="Todos" active={activeGender === "Todos"} onClick={() => setActiveGender("Todos")} />
                  {genders.map(g => <FilterPill key={g} label={g} active={activeGender === g} onClick={() => setActiveGender(g)} />)}
                </div>
              </div>
              <div>
                <label style={S.filterLabel}>Talla</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <FilterPill label="Todos" active={activeSize === "Todos"} onClick={() => setActiveSize("Todos")} />
                  {sizes.map(sz => <FilterPill key={sz} label={sz} active={activeSize === sz} onClick={() => setActiveSize(sz)} />)}
                </div>
              </div>
              {usedTeamNames.length > 0 && (
                <div>
                  <label style={S.filterLabel}>Escudería</label>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <FilterPill label="Todos" active={activeTeam === "Todos"} onClick={() => setActiveTeam("Todos")} />
                    {usedTeamNames.map(t => <FilterPill key={t} label={t} active={activeTeam === t} onClick={() => setActiveTeam(t)} />)}
                  </div>
                </div>
              )}
              {usedDriverNames.length > 0 && (
                <div>
                  <label style={S.filterLabel}>Piloto</label>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <FilterPill label="Todos" active={activeDriver === "Todos"} onClick={() => setActiveDriver("Todos")} />
                    {usedDriverNames.map(d => <FilterPill key={d} label={d} active={activeDriver === d} onClick={() => setActiveDriver(d)} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pgrid" style={S.productGrid}>
          {shown.length === 0 && <p style={{ color: "#52525B", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No hay productos que coincidan con la búsqueda o los filtros.</p>}
          {shown.map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} onAdd={addToCart} highlight={highlightId === p.id} />)}
        </div>
      </section>
      </>)}

      {route === "home" && (<>
      <section style={{ ...S.section, borderTop: "1px solid #18181B" }}>
        <SectionTitle part1={content.whyTitle1} highlight={content.whyTitleHighlight + "?"} />
        <div style={S.whyGrid}>
          {content.whyCards.map((w, i) => (
            <div key={i} style={S.whyCard}>
              <div style={S.whyNumber}>{String(i + 1).padStart(2, "0")}</div>
              <h3 style={S.whyTitle}>{w.title}</h3>
              <p style={S.whyDesc}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" style={S.aboutSection}>
        <div style={S.aboutInner}>
          <div style={S.aboutImageBox}>
            {aboutImage ? (
              <img src={aboutImage} alt="Sobre nosotros" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
            ) : (
              <div style={S.aboutImagePlaceholder}>
                <div style={{ width: 32, height: 2, background: "#E10600" }} />
              </div>
            )}
          </div>
          <div>
            {content.aboutTagline && <div style={S.aboutEyebrow}>{content.aboutTagline}</div>}
            <h2 style={{ ...S.sectionTitle, textAlign: "left", marginBottom: 24 }}>
              {content.aboutTitle1} <span style={{ color: "#E10600" }}>{content.aboutTitleHighlight}</span>
            </h2>
            <div style={{ marginBottom: 28 }}>
              {(content.aboutText || "").split("\n\n").map((para, i) => (
                <p key={i} style={{ margin: "0 0 16px", color: "#A1A1AA", fontSize: 15, lineHeight: 1.75 }}>{para}</p>
              ))}
            </div>
            {content.aboutHighlights && content.aboutHighlights.length > 0 && (
              <div style={S.aboutHighlights}>
                {content.aboutHighlights.map((h, i) => (
                  <div key={i} style={S.aboutHighlightCard}>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: F_HEAD }}>{h.val}</div>
                    <div style={{ color: "#71717A", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>{h.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {content.faq && content.faq.length > 0 && (
        <section id="faq" style={{ ...S.section, borderTop: "1px solid #18181B" }}>
          <SectionTitle part1={content.faqTitle1} highlight={content.faqTitleHighlight} />
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {content.faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
          </div>
        </section>
      )}

      <section style={S.ctaSection}>
        <div style={S.ctaInner}>
          <div style={{ width: 32, height: 2, background: "#E10600", margin: "0 auto 22px" }} />
          <h2 style={S.ctaTitle}>{content.ctaTitle}</h2>
          <p style={{ color: "#A1A1AA", margin: "0 0 30px", fontSize: 15 }}>{content.ctaSubtitle}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btnp" href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.btnPrimary}>
              <WaIcon size={15} /> Escribir por WhatsApp
            </a>
            <a className="btng" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={S.btnGhost}>@pitstopelsalvador</a>
          </div>
        </div>
      </section>
      </>)}

      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              {logo && <img src={logo} alt="Logo" style={{ height: 26, objectFit: "contain" }} />}
              <span style={{ fontWeight: 800, color: "#fff", fontFamily: F_HEAD, fontSize: 15 }}>{content.brandName1} <span style={{ color: "#E10600" }}>{content.brandName2}</span></span>
            </div>
            <p style={{ color: "#71717A", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
              Merchandising de Fórmula 1 en El Salvador. Calidad, pasión y atención personalizada en cada pedido.
            </p>
          </div>
          <div>
            <div style={S.footerColTitle}>Navegación</div>
            <div className="ftlink" onClick={goHome} style={S.footerLink}>Inicio</div>
            {hasSaleProducts && <div className="ftlink" onClick={goSale} style={S.footerLink}>{content.navSale || "Ofertas"}</div>}
            <div className="ftlink" onClick={goCatalog} style={S.footerLink}>Catálogo</div>
            <div className="ftlink" onClick={goGame} style={S.footerLink}>Juego 🚦</div>
            <div className="ftlink" onClick={() => scrollToSection("about")} style={S.footerLink}>Nuestra historia</div>
            <div className="ftlink" onClick={() => scrollToSection("faq")} style={S.footerLink}>Preguntas frecuentes</div>
          </div>
          <div>
            <div style={S.footerColTitle}>Contacto</div>
            <a className="ftlink" href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ ...S.footerLink, textDecoration: "none", display: "block" }}>WhatsApp — +503 6849 6398</a>
            <a className="ftlink" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ ...S.footerLink, textDecoration: "none", display: "block" }}>Instagram — @pitstopelsalvador</a>
            <div style={S.footerLink}>El Salvador</div>
          </div>
        </div>
        <div style={S.footerBottom}>
          <span style={{ color: "#3F3F46", fontSize: 12 }}>© 2026 Pit Stop El Salvador. Todos los derechos reservados.</span>
        </div>
      </footer>

      {cart.count > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)} style={S.cartFab}>
          🛒 Ver pedido · {cart.count}
        </button>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
    </div>
  );
}

const S = {
  loaderWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0B0B0C" },
  loader: { color: "#A1A1AA", fontSize: 13, fontWeight: 500, fontFamily: F_BODY, letterSpacing: "0.14em", textTransform: "uppercase", display: "flex", flexDirection: "column", alignItems: "center" },
  landing: { background: "#0B0B0C", fontFamily: F_BODY, minHeight: "100vh", position: "relative", color: "#FAFAFA" },
  notif: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#141416", borderLeft: "2px solid #E10600", border: "1px solid #232328", color: "#fff", padding: "12px 22px", borderRadius: 8, fontWeight: 500, fontSize: 13, zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" },
  topBar: { background: "#000", color: "#A1A1AA", padding: "9px 0", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid #18181B", overflow: "hidden", whiteSpace: "nowrap" },
  nav: { position: "sticky", top: 0, background: "rgba(11,11,12,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #18181B", zIndex: 100, padding: "0 24px" },
  navInner: { maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 62 },
  navDropdownBtn: { background: "none", border: "none", color: "#A1A1AA", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "8px 13px 14px", display: "flex", alignItems: "center", fontFamily: F_BODY },
  navLink: { color: "#A1A1AA", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 13px" },
  navCta: { background: "#E10600", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 6, marginLeft: 8 },
  dropdown: { position: "absolute", top: "calc(100% - 10px)", right: 0, marginTop: 0, background: "#141416", paddingTop: 16, border: "1px solid #232328", borderRadius: 10, minWidth: 230, boxShadow: "0 16px 50px rgba(0,0,0,0.6)", zIndex: 200, overflow: "hidden" },
  dropdownHeader: { padding: "11px 16px 9px", color: "#52525B", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: "1px solid #1E1E22" },
  dropdownList: { maxHeight: 340, overflowY: "auto" },
  dropdownItem: { display: "flex", alignItems: "center", width: "100%", background: "none", border: "none", color: "#D4D4D8", padding: "11px 16px", cursor: "pointer", fontSize: 13, fontWeight: 450, textAlign: "left", fontFamily: F_BODY },
  hero: { position: "relative", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,6,0,0.07), transparent), repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 80px), #0B0B0C", padding: "100px 24px 104px", textAlign: "center" },
  heroInner: { maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid #2A2A2F", color: "#C4C4CC", padding: "8px 18px", borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 28 },
  heroTitle: { color: "#fff", fontSize: "clamp(32px, 5.6vw, 56px)", fontWeight: 900, fontStyle: "italic", lineHeight: 1.06, margin: "0 0 22px", letterSpacing: "-0.02em", fontFamily: F_HEAD, paddingRight: "0.08em" },
  heroSub: { color: "#A1A1AA", fontSize: 16, lineHeight: 1.7, marginBottom: 34, maxWidth: 540 },
  heroLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "#E10600" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 9, background: "#E10600", color: "#fff", padding: "13px 28px", borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: "none", border: "none", cursor: "pointer", fontFamily: F_BODY },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#D4D4D8", padding: "13px 28px", borderRadius: 6, fontWeight: 500, fontSize: 14, textDecoration: "none", border: "1px solid #2A2A2F", cursor: "pointer", fontFamily: F_BODY },
  btnWa: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1DA851", color: "#fff", padding: "11px 0", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none", width: "100%", fontFamily: F_BODY },
  btnDisabled: { background: "#19191C", color: "#52525B", padding: "11px 0", borderRadius: 6, fontWeight: 500, fontSize: 13, border: "1px solid #232328", cursor: "not-allowed", width: "100%", fontFamily: F_BODY },
  backLink: { background: "none", border: "none", color: "#71717A", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0, marginBottom: 22, fontFamily: F_BODY, display: "inline-flex", alignItems: "center", gap: 6 },
  searchRow: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 },
  searchInput: { background: "#101013", border: "1px solid #232328", borderRadius: 8, color: "#E4E4E7", padding: "11px 14px", fontSize: 13, width: "min(360px, 100%)", outline: "none", fontFamily: F_BODY },
  sortSelect: { background: "#101013", border: "1px solid #232328", borderRadius: 8, color: "#A1A1AA", padding: "11px 12px", fontSize: 13, outline: "none", fontFamily: F_BODY, cursor: "pointer" },
  trustStrip: { borderBottom: "1px solid #18181B", background: "#0B0B0C" },
  trustInner: { maxWidth: 1180, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: 28, flexWrap: "wrap" },
  trustItem: { display: "flex", alignItems: "center", gap: 8, color: "#A1A1AA", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" },
  trustDot: { width: 5, height: 5, background: "#E10600", borderRadius: "50%", flexShrink: 0 },
  standingsStrip: { borderBottom: "1px solid #18181B", background: "#0A0A0B" },
  standingsInner: { maxWidth: 1180, margin: "0 auto", padding: "18px 24px 20px" },
  standingsTitle: { color: "#52525B", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, textAlign: "center", fontFamily: F_BODY },
  standingsRow: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
  standItem: { display: "flex", alignItems: "center", gap: 8, border: "1px solid #1E1E22", background: "#101013", borderRadius: 8, padding: "8px 14px", whiteSpace: "nowrap", flexShrink: 0, fontFamily: F_BODY },
  standPos: { color: "#E10600", fontFamily: F_HEAD, fontWeight: 800, fontSize: 12 },
  standName: { color: "#D4D4D8", fontSize: 12.5, fontWeight: 600 },
  standPts: { color: "#71717A", fontSize: 11.5 },
  prodTicker: { overflow: "hidden", margin: "0 -24px", padding: "6px 0 10px", maskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)" },
  prodTrackHalf: { display: "flex", gap: 22, paddingRight: 22 },
  prodTickerItem: { width: 272, flexShrink: 0, display: "flex" },
  newsRow: { display: "flex", flexDirection: "column", gap: 6, padding: "15px 17px", border: "1px solid #1E1E22", borderRadius: 10, background: "#101013", textDecoration: "none" },
  newsTitle: { color: "#E4E4E7", fontSize: 14, fontWeight: 600, lineHeight: 1.45, fontFamily: F_BODY },
  newsMeta: { color: "#52525B", fontSize: 11.5, fontFamily: F_BODY },
  seasonWrap: { borderBottom: "1px solid #18181B", background: "#0D0D0F" },
  seasonInner: { maxWidth: 1180, margin: "0 auto", padding: "64px 24px 60px" },
  seasonGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 },
  seasonCard: { border: "1px solid #1E1E22", background: "#101013", borderRadius: 12, padding: "20px 22px" },
  seasonCardTitle: { color: "#52525B", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: F_BODY },
  seasonCardBig: { color: "#fff", fontFamily: F_HEAD, fontWeight: 800, fontSize: 20, marginTop: 8, letterSpacing: "-0.01em", lineHeight: 1.2 },
  seasonLeader: { color: "#D4D4D8", fontFamily: F_HEAD, fontWeight: 800, fontSize: 16, marginTop: 2 },
  seasonTables: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 28, marginTop: 30 },
  seasonRow: { display: "flex", alignItems: "baseline", gap: 10, border: "1px solid transparent", borderRadius: 8, padding: "7px 10px", background: "transparent", width: "100%", textAlign: "left", fontFamily: F_BODY },
  statsStrip: { borderBottom: "1px solid #18181B", background: "#0D0D0F" },
  statsInner: { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" },
  statItem: { padding: "34px 20px", textAlign: "center" },
  statVal: { color: "#fff", fontSize: 32, fontWeight: 800, fontFamily: F_HEAD, letterSpacing: "-0.01em" },
  statLabel: { color: "#71717A", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 },
  section: { padding: "84px 24px", maxWidth: 1180, margin: "0 auto" },
  sectionTitle: { color: "#fff", fontSize: "clamp(26px, 3.4vw, 34px)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontFamily: F_HEAD },
  catTabs: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 },
  catTab: { background: "transparent", color: "#8A8A93", border: "1px solid #232328", borderRadius: 100, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: F_BODY, transition: "all .2s" },
  catTabActive: { background: "#fff", color: "#0B0B0C", border: "1px solid #fff", borderRadius: 100, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: F_BODY },
  filterToggle: { background: "none", border: "1px solid #232328", color: "#8A8A93", padding: "9px 22px", borderRadius: 100, cursor: "pointer", fontSize: 13, fontFamily: F_BODY },
  filterCount: { background: "#E10600", color: "#fff", borderRadius: 100, padding: "2px 8px", fontSize: 11, marginLeft: 8, fontWeight: 600 },
  filterPanel: { background: "#101013", border: "1px solid #1E1E22", borderRadius: 12, padding: 26, marginBottom: 30 },
  filterLabel: { color: "#71717A", fontSize: 11, fontWeight: 600, marginBottom: 10, display: "block", letterSpacing: "0.1em", textTransform: "uppercase" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 22 },
  productCard: { background: "linear-gradient(180deg, #141417, #0F0F11)", borderRadius: 12, overflow: "hidden", border: "1px solid #1E1E22", display: "flex", flexDirection: "column" },
  soldOut: { position: "absolute", top: 12, left: 12, background: "rgba(11,11,12,0.85)", backdropFilter: "blur(4px)", color: "#A1A1AA", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 600, zIndex: 5, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.08)" },
  featuredBadgeIn: { background: "#E10600", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
  newBadge: { background: "rgba(11,11,12,0.9)", color: "#fff", border: "1px solid #E10600", padding: "4px 11px", borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
  featuredBadge: { position: "absolute", top: 12, left: 12, background: "#E10600", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, zIndex: 5, letterSpacing: "0.1em", textTransform: "uppercase" },
  saleBadge: { position: "absolute", top: 12, right: 12, background: "#fff", color: "#0B0B0C", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, zIndex: 5, letterSpacing: "0.1em", textTransform: "uppercase" },
  cardEyebrow: { color: "#71717A", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 },
  cardTitle: { color: "#fff", fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.35, fontFamily: F_HEAD, letterSpacing: "-0.01em" },
  cardPrice: { color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: F_HEAD, whiteSpace: "nowrap" },
  cardDesc: { color: "#8A8A93", fontSize: 13, lineHeight: 1.55, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { color: "#52525B", fontSize: 11.5, marginBottom: 12, letterSpacing: "0.01em" },
  sizeChip: { border: "1px solid #2A2A2F", color: "#A1A1AA", padding: "3px 9px", borderRadius: 4, fontSize: 10.5, fontWeight: 500 },
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 },
  whyCard: { background: "#101013", border: "1px solid #1E1E22", borderRadius: 12, padding: "28px 26px" },
  whyNumber: { color: "#E10600", fontSize: 13, fontWeight: 800, fontFamily: F_HEAD, marginBottom: 16, letterSpacing: "0.06em" },
  whyTitle: { color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 10px", fontFamily: F_HEAD, letterSpacing: "-0.01em" },
  whyDesc: { color: "#8A8A93", fontSize: 13.5, margin: 0, lineHeight: 1.65 },

  aboutSection: { padding: "84px 24px", borderTop: "1px solid #18181B", background: "#0D0D0F" },
  aboutInner: { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 56, alignItems: "center" },
  aboutImageBox: { position: "relative", aspectRatio: "4 / 3", borderRadius: 10, overflow: "hidden", minHeight: 240, border: "1px solid #1E1E22" },
  aboutImagePlaceholder: { width: "100%", height: "100%", background: "#101013", display: "flex", alignItems: "center", justifyContent: "center" },
  aboutEyebrow: { color: "#E10600", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 },
  aboutHighlights: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 14 },
  aboutHighlightCard: { borderLeft: "2px solid #232328", paddingLeft: 16 },

  faqItem: { borderBottom: "1px solid #1E1E22" },
  faqQuestion: { width: "100%", background: "none", border: "none", color: "#E4E4E7", padding: "20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 15, fontWeight: 500, textAlign: "left", fontFamily: F_BODY, gap: 16 },
  faqAnswer: { padding: "0 4px 20px", color: "#8A8A93", fontSize: 14, lineHeight: 1.7 },

  ctaSection: { borderTop: "1px solid #18181B", background: "radial-gradient(ellipse 70% 80% at 50% 110%, rgba(225,6,0,0.1), transparent), #0B0B0C", padding: "90px 24px", textAlign: "center" },
  ctaInner: { maxWidth: 600, margin: "0 auto" },
  ctaTitle: { color: "#fff", fontSize: "clamp(26px, 3.6vw, 36px)", fontWeight: 800, margin: "0 0 12px", fontFamily: F_HEAD, letterSpacing: "-0.02em" },

  footer: { borderTop: "1px solid #18181B", background: "#0A0A0B" },
  footerInner: { maxWidth: 1180, margin: "0 auto", padding: "56px 24px 44px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 44 },
  footerColTitle: { color: "#52525B", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 },
  footerLink: { color: "#8A8A93", fontSize: 13.5, marginBottom: 11, fontWeight: 450 },
  footerBottom: { borderTop: "1px solid #141416", padding: "20px 24px", textAlign: "center" },

  floatingWa: { position: "fixed", bottom: 24, right: 24, width: 52, height: 52, background: "#1DA851", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" },

  lightboxOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(8,8,9,0.96)", zIndex: 10000, display: "flex", flexDirection: "column", padding: "64px 20px 20px" },
  lightboxTopBar: { position: "fixed", top: 0, left: 0, right: 0, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent)", zIndex: 10002 },
  lightboxContent: { flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 },
  lightboxImg: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 6 },
  lightboxShare: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "10px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", fontFamily: F_BODY },
  lightboxClose: { background: "#fff", border: "none", color: "#0B0B0C", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", fontFamily: F_BODY },
  lightboxCounter: { color: "#A1A1AA", fontSize: 13, fontWeight: 500, padding: "8px 4px" },
  lightboxNav: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", width: 46, height: 46, borderRadius: "50%", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, lineHeight: 1, zIndex: 10001 },
  lightboxThumbs: { display: "flex", gap: 8, padding: "14px 8px 4px", justifyContent: "center", overflowX: "auto", maxWidth: "100%" },
  lightboxThumb: { width: 54, height: 54, objectFit: "cover", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 },

  btnCart: { background: "#E10600", color: "#fff", border: "none", borderRadius: 8, padding: "12px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: F_BODY },
  cartQtyBtn: { width: 26, height: 26, borderRadius: 6, border: "1px solid #3F3F46", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  cartNavBtn: { position: "relative", background: "none", border: "1px solid #3F3F46", borderRadius: 8, color: "#D4D4D8", padding: "8px 13px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" },
  cartBadge: { background: "#E10600", color: "#fff", borderRadius: 100, minWidth: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, padding: "0 5px" },
  cartFab: { position: "fixed", bottom: 24, right: 88, zIndex: 1001, background: "#E10600", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", color: "#fff", border: "none", borderRadius: 100, padding: "14px 22px", fontFamily: F_HEAD, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 9 },
  hamburger: { background: "none", border: "1px solid #232328", borderRadius: 8, width: 40, height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", padding: 0 },
  hamburgerBar: { display: "block", width: 17, height: 1.5, background: "#fff", borderRadius: 2 },
  mobileOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", zIndex: 9998, display: "flex", justifyContent: "flex-end" },
  mobileDrawer: { width: "85%", maxWidth: 340, height: "100%", background: "#0D0D0F", borderLeft: "1px solid #1E1E22", display: "flex", flexDirection: "column", overflowY: "auto" },
  mobileDrawerHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #18181B", position: "sticky", top: 0, background: "#0D0D0F", zIndex: 2 },
  mobileDrawerClose: { background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", padding: 0, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  mobileDrawerBody: { padding: "10px 0", flex: 1 },
  mobileNavItem: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", color: "#E4E4E7", padding: "15px 22px", fontSize: 15, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: F_BODY, borderBottom: "1px solid #121214" },
  mobileBackBtn: { background: "none", border: "none", color: "#71717A", padding: "13px 22px", fontSize: 13, cursor: "pointer", fontFamily: F_BODY, textAlign: "left", width: "100%" },
  mobileSectionTitle: { color: "#E10600", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 22px 14px", borderBottom: "1px solid #18181B" },

  adminLoginWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0B0B0C", padding: 20, fontFamily: F_BODY },
  adminLoginCard: { background: "#121214", border: "1px solid #1E1E22", borderRadius: 14, padding: 36, textAlign: "center", width: "100%", maxWidth: 360 },
  adminWrap: { background: "#0B0B0C", fontFamily: F_BODY, minHeight: "100vh", padding: 24, maxWidth: 920, margin: "0 auto", color: "#FAFAFA" },
  adminHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #1E1E22", paddingBottom: 18 },
  adminH3: { color: "#fff", margin: "0 0 12px", fontFamily: F_HEAD, fontSize: 16, fontWeight: 700 },
  adminHint: { color: "#52525B", fontSize: 12, margin: "0 0 12px" },
  adminInfoBox: { background: "#101013", border: "1px solid #1E1E22", borderLeft: "2px solid #E10600", borderRadius: 10, padding: 16, marginBottom: 16 },
  adminListHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 },
  adminSubCard: { background: "#19191C", borderRadius: 10, padding: 14, border: "1px solid #232328" },
  formCard: { background: "#121214", border: "1px solid #1E1E22", borderRadius: 12, padding: 26, marginBottom: 16 },
  formGrid: { display: "flex", gap: 26, flexWrap: "wrap" },
  label: { display: "block", color: "#8A8A93", fontSize: 12, fontWeight: 500, marginBottom: 5, marginTop: 8 },
  input: { width: "100%", padding: "10px 13px", background: "#19191C", border: "1px solid #2A2A2F", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: F_BODY },
  logoPreview: { width: 100, height: 100, background: "#19191C", border: "1px dashed #2A2A2F", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  imgGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  imgThumbWrap: { position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid #2A2A2F" },
  imgThumb: { width: "100%", height: "100%", objectFit: "cover" },
  mainBadge: { position: "absolute", top: 3, left: 3, background: "#E10600", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.04em" },
  imgActions: { position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 2, background: "rgba(0,0,0,0.75)", padding: "4px 0" },
  imgActBtn: { background: "none", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", padding: "0 5px" },
  imgAddBtn: { width: 80, height: 80, borderRadius: 8, border: "1px dashed #2A2A2F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#19191C" },
  btnRed: { background: "#E10600", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: F_BODY },
  btnOutline: { background: "transparent", color: "#8A8A93", border: "1px solid #2A2A2F", padding: "10px 22px", borderRadius: 7, fontWeight: 500, cursor: "pointer", fontSize: 13, marginTop: 8, fontFamily: F_BODY },
  btnOutlineSm: { background: "transparent", color: "#8A8A93", border: "1px solid #2A2A2F", padding: "6px 14px", borderRadius: 6, fontWeight: 500, cursor: "pointer", fontSize: 13, fontFamily: F_BODY },
  adminRow: { display: "flex", alignItems: "center", gap: 12, background: "#121214", border: "1px solid #1E1E22", borderRadius: 10, padding: 13 },
  listRow: { display: "flex", alignItems: "center", gap: 10, background: "#19191C", border: "1px solid #232328", borderRadius: 8, padding: "9px 13px" },
  arrowBtn: { background: "#1F1F23", border: "1px solid #2A2A2F", color: "#fff", width: 28, height: 28, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  rosterCard: { background: "#19191C", border: "1px solid #232328", borderRadius: 10, padding: 14 },
  rosterImgBox: { width: "100%", height: 76, background: "#101013", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
};
