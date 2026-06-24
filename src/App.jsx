import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// CONFIGURACIÓN — REEMPLAZA ESTOS DOS VALORES CON LOS TUYOS
// ============================================================
const SUPABASE_URL = "https://zjmqpylfpvawzrogycqi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbXFweWxmcHZhd3pyb2d5Y3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDIwNzQsImV4cCI6MjA5Njc3ODA3NH0.O0q9-k-dhuIXI0LEQ9WTvz2ekIkaALjrs_C-WDb3rRk";
// ============================================================

const WHATSAPP_NUMBER = "50375991408";
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
  try { await supabase.from("store").upsert({ key, value }); } catch (e) {}
}
async function storeDel(key) {
  try { await supabase.from("store").delete().eq("key", key); } catch (e) {}
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
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-font-smoothing:antialiased}
::selection{background:#E10600;color:#fff}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:#0B0B0C}
::-webkit-scrollbar-thumb{background:#27272A;border-radius:5px}
.pcard{transition:transform .3s cubic-bezier(.2,.8,.2,1),border-color .3s}
.pcard:hover{transform:translateY(-4px);border-color:#3F3F46}
.zoomhint{opacity:0;transition:opacity .25s}
.pcard:hover .zoomhint{opacity:1}
@media (hover:hover){.carbtn{opacity:0;transition:opacity .25s}.pcard:hover .carbtn{opacity:1}.lbnav{opacity:.7}.lbnav:hover{opacity:1}}
.navbtn{transition:color .2s}
.navbtn:hover{color:#fff !important}
.ditem{transition:background .15s,color .15s}
.ditem:hover{background:#19191C}
.btnp{transition:background .2s}
.btnp:hover{background:#C40500 !important}
.btng{transition:border-color .2s,color .2s}
.btng:hover{border-color:#52525B !important;color:#fff !important}
.btnwa{transition:filter .2s}
.btnwa:hover{filter:brightness(1.07)}
.faqq:hover .faqplus{color:#E10600}
.ftlink{transition:color .2s;cursor:pointer}
.ftlink:hover{color:#fff !important}
.statitem:not(:last-child){border-right:1px solid #1E1E22}
@media (max-width:767px){.statitem:not(:last-child){border-right:none}}
`;

const defaultContent = {
  brandName1: "PIT STOP", brandName2: "SV",
  topBarMessages: ["Envíos a todo El Salvador", "Síguenos en Instagram — @pitstopelsalvador", "Atención personalizada por WhatsApp"],
  heroBadge: "Merch oficial de Fórmula 1",
  heroTitle1: "Tu parada obligatoria para el mejor", heroTitleHighlight: "merch de F1",
  heroSubtitle: "Camisas, gorras, botellas, bolsones y más. Los mejores productos de la Fórmula 1 en El Salvador.",
  statsTitle1: "", statsTitleHighlight: "",
  navCatalog: "Catálogo", navTeams: "Escuderías", navDrivers: "Pilotos", navAbout: "Sobre Nosotros",
  teamsTitle1: "Compra por", teamsTitleHighlight: "Escudería",
  driversTitle1: "Compra por", driversTitleHighlight: "Piloto",
  newTitle1: "Nuevos en la", newTitleHighlight: "tienda",
  featuredTitle1: "Productos", featuredTitleHighlight: "destacados",
  catalogTitle1: "Nuestro", catalogTitleHighlight: "catálogo",
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
    <div style={{ height, background: "#101013", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2E2E33" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    </div>
  );
  return (
    <div style={{ position: "relative", height, background: "#101013", overflow: "hidden" }}>
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

function Lightbox({ images, startIdx, onClose }) {
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
        <button onClick={onClose} style={S.lightboxClose} aria-label="Cerrar">✕&nbsp;&nbsp;Cerrar</button>
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

function ProductCard({ p, waLink, onImageClick }) {
  const meta = [p.team, p.driver, p.gender && p.gender !== "Unisex" ? p.gender : null].filter(Boolean).join("  ·  ");
  return (
    <div className="pcard" style={S.productCard}>
      <div style={{ position: "relative" }}>
        <ImageCarousel images={p.images} height={230} onImageClick={onImageClick} />
        {!p.inStock && <div style={S.soldOut}>Agotado</div>}
        {p.featured && p.inStock && <div style={S.featuredBadge}>Destacado</div>}
      </div>
      <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={S.cardEyebrow}>{p.category}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <h3 style={S.cardTitle}>{p.name}</h3>
          <span style={S.cardPrice}>${p.price.toFixed(2)}</span>
        </div>
        <p style={S.cardDesc}>{p.description}</p>
        {meta && <div style={S.cardMeta}>{meta}</div>}
        {p.sizes && p.sizes.length > 0 && (
          <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
            {p.sizes.includes("Onesize")
              ? <span style={S.sizeChip}>Talla única</span>
              : p.sizes.map(sz => <span key={sz} style={S.sizeChip}>{sz}</span>)}
          </div>
        )}
        <div style={{ marginTop: "auto" }}>
          {p.inStock ? (
            <a className="btnwa" href={waLink(p)} target="_blank" rel="noopener noreferrer" style={S.btnWa}>
              <WaIcon size={15} /> Pedir por WhatsApp
            </a>
          ) : (
            <button disabled style={S.btnDisabled}>No disponible</button>
          )}
        </div>
      </div>
    </div>
  );
}

function TopBar({ messages }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, [messages]);
  if (!messages || messages.length === 0) return null;
  return <div style={S.topBar}>{messages[idx]}</div>;
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

function SectionTitle({ part1, highlight, align = "center" }) {
  return (
    <div style={{ textAlign: align, marginBottom: 40 }}>
      <div style={{ width: 32, height: 2, background: "#E10600", margin: align === "center" ? "0 auto 18px" : "0 0 18px" }} />
      <h2 style={{ ...S.sectionTitle, textAlign: align }}>
        {part1} <span style={{ color: "#E10600" }}>{highlight}</span>
      </h2>
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
  const [activeGender, setActiveGender] = useState("Todos");
  const [activeTeam, setActiveTeam] = useState("Todos");
  const [activeDriver, setActiveDriver] = useState("Todos");
  const [activeSize, setActiveSize] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "", description: "", inStock: true, images: [], gender: "Unisex", sizes: [], team: "", driver: "", featured: false });
  const [adminTab, setAdminTab] = useState("products");
  const fileRef = useRef(null);
  const logoRef = useRef(null);
  const aboutImgRef = useRef(null);
  const teamImgRef = useRef(null);
  const driverImgRef = useRef(null);
  const [uploadingTeamIdx, setUploadingTeamIdx] = useState(null);
  const [uploadingDriverIdx, setUploadingDriverIdx] = useState(null);
  const [notification, setNotification] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const openLightbox = (images, startIdx) => setLightbox({ images, startIdx });

  useEffect(() => { loadData(); }, []);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 2500); };

  const loadData = async () => {
    const safetyTimeout = setTimeout(() => setLoading(false), 8000);
    try {
      const [pRaw, lRaw, aRaw, cRaw, tRaw, dRaw, catRaw, gRaw, szRaw] = await Promise.all([
        storeGet("pitstop_products_v3"), storeGet("pitstop_logo"), storeGet("pitstop_about_image"),
        storeGet("pitstop_content"), storeGet("pitstop_teams_v2"), storeGet("pitstop_drivers_v2"),
        storeGet("pitstop_categories"), storeGet("pitstop_genders"), storeGet("pitstop_sizes"),
      ]);
      if (pRaw) {
        try { setProducts(JSON.parse(pRaw).map(p => ({ gender: "Unisex", sizes: [], team: "", driver: "", featured: false, ...p, images: p.images || (p.image ? [p.image] : []) }))); } catch(e) { setProducts(defaultProducts); }
      } else {
        setProducts(defaultProducts);
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

  const saveProducts = async (u) => { setProducts(u); storeSet("pitstop_products_v3", JSON.stringify(u)); };
  const saveContent = async (u) => { setContent(u); storeSet("pitstop_content", JSON.stringify(u)); };
  const saveTeams = async (u) => { setTeams(u); storeSet("pitstop_teams_v2", JSON.stringify(u)); };
  const saveDrivers = async (u) => { setDrivers(u); storeSet("pitstop_drivers_v2", JSON.stringify(u)); };
  const saveCategories = async (u) => { setCategories(u); storeSet("pitstop_categories", JSON.stringify(u)); };
  const saveGenders = async (u) => { setGenders(u); storeSet("pitstop_genders", JSON.stringify(u)); };
  const saveSizes = async (u) => { setSizes(u); storeSet("pitstop_sizes", JSON.stringify(u)); };

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
    const p = { ...form, price: parseFloat(form.price), id: editingProduct ? editingProduct.id : Date.now().toString() };
    await saveProducts(editingProduct ? products.map(x => x.id === editingProduct.id ? p : x) : [...products, p]);
    resetForm(); notify(editingProduct ? "Producto actualizado" : "Producto agregado");
  };
  const moveProduct = async (i, dir) => { const arr = [...products]; const n = i + dir; if (n < 0 || n >= arr.length) return; [arr[i]. arr[n]] = [arr[n] , arr[i]]; await saveProducts(arr); };
  const handleDelete = async (id) => { await saveProducts(products.filter(x => x.id !== id)); notify("Producto eliminado"); };
  const startEdit = (p) => { setForm({ name: p.name, category: p.category, price: p.price.toString(), description: p.description, inStock: p.inStock, images: p.images || [], gender: p.gender || "Unisex", sizes: p.sizes || [], team: p.team || "", driver: p.driver || "", featured: !!p.featured }); setEditingProduct(p); setShowForm(true); };
  const resetForm = () => { setForm({ name: "", category: categories[0] || "", price: "", description: "", inStock: true, images: [], gender: genders[0] || "Unisex", sizes: [], team: "", driver: "", featured: false }); setEditingProduct(null); setShowForm(false); };

  const updateStat = (i, key, val) => { const s = [...content.stats]; s[i] = { ...s[i], [key]: val }; saveContent({ ...content, stats: s }); };
  const updateWhy = (i, key, val) => { const w = [...content.whyCards]; w[i] = { ...w[i], [key]: val }; saveContent({ ...content, whyCards: w }); };
  const updateFaq = (i, key, val) => { const f = [...content.faq]; f[i] = { ...f[i], [key]: val }; saveContent({ ...content, faq: f }); };
  const addFaq = () => saveContent({ ...content, faq: [...content.faq, { q: "Nueva pregunta", a: "Respuesta..." }] });
  const removeFaq = (i) => saveContent({ ...content, faq: content.faq.filter((_, j) => j !== i) });
  const updateTopBar = (i, val) => { const t = [...content.topBarMessages]; t[i] = val; saveContent({ ...content, topBarMessages: t }); };
  const addTopBar = () => saveContent({ ...content, topBarMessages: [...content.topBarMessages, "Nuevo mensaje"] });
  const removeTopBar = (i) => saveContent({ ...content, topBarMessages: content.topBarMessages.filter((_, j) => j !== i) });

  const filterByTeam = (teamName) => {
    setActiveTeam(teamName); setActiveCategory("Todos");
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const filterByDriver = (driverName) => {
    setActiveDriver(driverName); setActiveCategory("Todos");
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }), 100);
  };
  const scrollToSection = (id) => {
    setOpenMenu(null);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const filterByCategory = (cat) => {
    setActiveCategory(cat); setOpenMenu(null);
    setTimeout(() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const usedTeamNames = [...new Set(products.map(p => p.team).filter(Boolean))].sort();
  const usedDriverNames = [...new Set(products.map(p => p.driver).filter(Boolean))].sort();
  const newestProducts = [...products].filter(p => p.inStock).sort((a, b) => (b.id || "").localeCompare(a.id || "")).slice(0, 4);
  const featuredProducts = products.filter(p => p.featured && p.inStock).slice(0, 4);

  const filtered = products.filter(p => {
    if (activeCategory !== "Todos" && p.category !== activeCategory) return false;
    if (activeGender !== "Todos" && p.gender !== activeGender) return false;
    if (activeTeam !== "Todos" && p.team !== activeTeam) return false;
    if (activeDriver !== "Todos" && p.driver !== activeDriver) return false;
    if (activeSize !== "Todos" && !(p.sizes || []).includes(activeSize)) return false;
    return true;
  });

  const activeFiltersCount = [activeGender, activeTeam, activeDriver, activeSize].filter(f => f !== "Todos").length;
  const clearFilters = () => { setActiveCategory("Todos"); setActiveGender("Todos"); setActiveTeam("Todos"); setActiveDriver("Todos"); setActiveSize("Todos"); };

  const waLink = (p) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Pit Stop, me interesa: " + p.name + " ($" + p.price + ")")}`;
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
              <div><EditField label="Menú Catálogo" value={content.navCatalog || "Catálogo"} onChange={v => saveContent({ ...content, navCatalog: v })} /></div>
              <div><EditField label="Menú Escuderías" value={content.navTeams || "Escuderías"} onChange={v => saveContent({ ...content, navTeams: v })} /></div>
              <div><EditField label="Menú Pilotos" value={content.navDrivers || "Pilotos"} onChange={v => saveContent({ ...content, navDrivers: v })} /></div>
              <div><EditField label="Menú Sobre Nosotros" value={content.navAbout || "Sobre Nosotros"} onChange={v => saveContent({ ...content, navAbout: v })} /></div>
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
            <h3 style={S.adminH3}>Sección Catálogo</h3>
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
            <button className="btnp" onClick={() => { resetForm(); setShowForm(true); }} style={S.btnRed}>Agregar producto</button>
          </div>

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
                  <EditField label="Precio (USD) *" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} />
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
            {products.map(p, pi) => (
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
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.startIdx} onClose={() => setLightbox(null)} />}

      {!lightbox && (
        <a href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.floatingWa}>
          <WaIcon size={24} />
        </a>
      )}

      <TopBar messages={content.topBarMessages} />

      <nav style={S.nav}><div style={S.navInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          {logo && <img src={logo} alt="Logo" style={{ height: isMobile ? 28 : 34, objectFit: "contain" }} />}
          <span style={{ color: "#fff", fontWeight: 800, fontSize: isMobile ? 15 : 17, fontFamily: F_HEAD, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {content.brandName1} <span style={{ color: "#E10600" }}>{content.brandName2}</span>
          </span>
        </div>

        {isMobile ? (
          <button onClick={() => setMobileMenuOpen(true)} style={S.hamburger} aria-label="Abrir menú">
            <span style={S.hamburgerBar} /><span style={S.hamburgerBar} /><span style={S.hamburgerBar} />
          </button>
        ) : (
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
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

      <section style={S.hero}>
        <div style={S.heroInner}>
          {logo && <img src={logo} alt="Logo" style={{ height: 72, marginBottom: 28, objectFit: "contain" }} />}
          <div style={S.heroBadge}>{content.heroBadge}</div>
          <h1 style={S.heroTitle}>{content.heroTitle1} <span style={{ color: "#E10600" }}>{content.heroTitleHighlight}</span></h1>
          <p style={S.heroSub}>{content.heroSubtitle}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btnp" href={waGeneral} target="_blank" rel="noopener noreferrer" style={S.btnPrimary}>
              <WaIcon size={15} /> Pedir por WhatsApp
            </a>
            <a className="btng" href="#catalogo" style={S.btnGhost}>Ver catálogo</a>
          </div>
        </div>
        <div style={S.heroLine} />
      </section>

      <section style={S.statsStrip}>
        <div style={S.statsInner}>
          {content.stats.map((s, i) => (
            <div key={i} className="statitem" style={S.statItem}>
              <div style={S.statVal}>{s.val}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {newestProducts.length > 0 && (
        <section style={S.section}>
          <SectionTitle part1={content.newTitle1} highlight={content.newTitleHighlight} />
          <div style={S.productGrid}>
            {newestProducts.map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a className="btng" href="#catalogo" style={S.btnGhost}>Ver catálogo completo</a>
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section style={{ ...S.section, borderTop: "1px solid #18181B" }}>
          <SectionTitle part1={content.featuredTitle1} highlight={content.featuredTitleHighlight} />
          <div style={S.productGrid}>
            {featuredProducts.map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} />)}
          </div>
        </section>
      )}

      <section id="catalogo" style={{ ...S.section, borderTop: "1px solid #18181B" }}>
        <SectionTitle part1={content.catalogTitle1} highlight={content.catalogTitleHighlight} />

        <div style={S.catTabs}>
          <FilterPill label="Todos" active={activeCategory === "Todos"} onClick={() => setActiveCategory("Todos")} />
          {categories.map(c => <FilterPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />)}
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

        <div style={S.productGrid}>
          {filtered.length === 0 && <p style={{ color: "#52525B", gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>No hay productos que coincidan con los filtros.</p>}
          {filtered.map(p => <ProductCard key={p.id} p={p} waLink={waLink} onImageClick={openLightbox} />)}
        </div>
      </section>

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
            <div className="ftlink" onClick={() => scrollToSection("catalogo")} style={S.footerLink}>Catálogo</div>
            <div className="ftlink" onClick={() => scrollToSection("about")} style={S.footerLink}>Nuestra historia</div>
            <div className="ftlink" onClick={() => scrollToSection("faq")} style={S.footerLink}>Preguntas frecuentes</div>
          </div>
          <div>
            <div style={S.footerColTitle}>Contacto</div>
            <a className="ftlink" href={waGeneral} target="_blank" rel="noopener noreferrer" style={{ ...S.footerLink, textDecoration: "none", display: "block" }}>WhatsApp — +503 7599 1408</a>
            <a className="ftlink" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ ...S.footerLink, textDecoration: "none", display: "block" }}>Instagram — @pitstopelsalvador</a>
            <div style={S.footerLink}>El Salvador</div>
          </div>
        </div>
        <div style={S.footerBottom}>
          <span style={{ color: "#3F3F46", fontSize: 12 }}>© 2026 Pit Stop El Salvador. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

const S = {
  loaderWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0B0B0C" },
  loader: { color: "#A1A1AA", fontSize: 13, fontWeight: 500, fontFamily: F_BODY, letterSpacing: "0.14em", textTransform: "uppercase", display: "flex", flexDirection: "column", alignItems: "center" },
  landing: { background: "#0B0B0C", fontFamily: F_BODY, minHeight: "100vh", position: "relative", color: "#FAFAFA" },
  notif: { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#141416", borderLeft: "2px solid #E10600", border: "1px solid #232328", color: "#fff", padding: "12px 22px", borderRadius: 8, fontWeight: 500, fontSize: 13, zIndex: 9999, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" },
  topBar: { background: "#000", color: "#A1A1AA", textAlign: "center", padding: "9px 16px", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "1px solid #18181B" },
  nav: { position: "sticky", top: 0, background: "rgba(11,11,12,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #18181B", zIndex: 100, padding: "0 24px" },
  navInner: { maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 62 },
  navDropdownBtn: { background: "none", border: "none", color: "#A1A1AA", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "8px 13px 14px", display: "flex", alignItems: "center", fontFamily: F_BODY },
  navLink: { color: "#A1A1AA", textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "8px 13px" },
  navCta: { background: "#E10600", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 6, marginLeft: 8 },
  dropdown: { position: "absolute", top: "calc(100% - 10px)", right: 0, marginTop: 0, background: "#141416", padingTop: 16 , border: "1px solid #232328", borderRadius: 10, minWidth: 230, boxShadow: "0 16px 50px rgba(0,0,0,0.6)", zIndex: 200, overflow: "hidden" },
  dropdownHeader: { padding: "11px 16px 9px", color: "#52525B", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: "1px solid #1E1E22" },
  dropdownList: { maxHeight: 340, overflowY: "auto" },
  dropdownItem: { display: "flex", alignItems: "center", width: "100%", background: "none", border: "none", color: "#D4D4D8", padding: "11px 16px", cursor: "pointer", fontSize: 13, fontWeight: 450, textAlign: "left", fontFamily: F_BODY },
  hero: { position: "relative", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,6,0,0.13), transparent), #0B0B0C", padding: "88px 24px 92px", textAlign: "center" },
  heroInner: { maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" },
  heroBadge: { display: "inline-block", border: "1px solid #2A2A2F", color: "#A1A1AA", padding: "7px 16px", borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 26 },
  heroTitle: { color: "#fff", fontSize: "clamp(32px, 5.6vw, 56px)", fontWeight: 800, lineHeight: 1.08, margin: "0 0 22px", letterSpacing: "-0.02em", fontFamily: F_HEAD },
  heroSub: { color: "#A1A1AA", fontSize: 16, lineHeight: 1.7, marginBottom: 34, maxWidth: 540 },
  heroLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #E10600 30%, #E10600 70%, transparent)" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 9, background: "#E10600", color: "#fff", padding: "13px 28px", borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: "none", border: "none", cursor: "pointer", fontFamily: F_BODY },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#D4D4D8", padding: "13px 28px", borderRadius: 6, fontWeight: 500, fontSize: 14, textDecoration: "none", border: "1px solid #2A2A2F", cursor: "pointer", fontFamily: F_BODY },
  btnWa: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1DA851", color: "#fff", padding: "11px 0", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none", width: "100%", fontFamily: F_BODY },
  btnDisabled: { background: "#19191C", color: "#52525B", padding: "11px 0", borderRadius: 6, fontWeight: 500, fontSize: 13, border: "1px solid #232328", cursor: "not-allowed", width: "100%", fontFamily: F_BODY },
  statsStrip: { borderBottom: "1px solid #18181B", background: "#0D0D0F" },
  statsInner: { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" },
  statItem: { padding: "34px 20px", textAlign: "center" },
  statVal: { color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: F_HEAD, letterSpacing: "-0.01em" },
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
  productCard: { background: "#121214", borderRadius: 12, overflow: "hidden", border: "1px solid #1E1E22", display: "flex", flexDirection: "column" },
  soldOut: { position: "absolute", top: 12, left: 12, background: "rgba(11,11,12,0.85)", backdropFilter: "blur(4px)", color: "#A1A1AA", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 600, zIndex: 5, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.08)" },
  featuredBadge: { position: "absolute", top: 12, left: 12, background: "rgba(225,6,0,0.92)", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, zIndex: 5, letterSpacing: "0.1em", textTransform: "uppercase" },
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
  lightboxClose: { background: "#fff", border: "none", color: "#0B0B0C", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", fontFamily: F_BODY },
  lightboxCounter: { color: "#A1A1AA", fontSize: 13, fontWeight: 500, padding: "8px 4px" },
  lightboxNav: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", width: 46, height: 46, borderRadius: "50%", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, lineHeight: 1, zIndex: 10001 },
  lightboxThumbs: { display: "flex", gap: 8, padding: "14px 8px 4px", justifyContent: "center", overflowX: "auto", maxWidth: "100%" },
  lightboxThumb: { width: 54, height: 54, objectFit: "cover", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 },

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
