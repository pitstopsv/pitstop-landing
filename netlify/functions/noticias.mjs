// Función de servidor (gratis en Netlify): lee titulares de F1 desde los
// RSS públicos de medios y los devuelve como JSON para la portada.
// Prueba las fuentes en orden hasta que una responda; si ninguna responde,
// devuelve vacío y la portada simplemente no muestra la sección.

const FUENTES = [
  { nombre: "Motorsport.com", url: "https://es.motorsport.com/rss/f1/news/" },
  { nombre: "Motorsport.com", url: "https://www.motorsport.com/rss/f1/news/" },
  { nombre: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml" },
];

function limpiar(t) {
  return (t || "")
    .replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "").trim();
}

function parsear(xml) {
  const items = [];
  const bloques = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  for (const b of bloques.slice(0, 6)) {
    const t = b.match(/<title>([\s\S]*?)<\/title>/);
    const l = b.match(/<link>([\s\S]*?)<\/link>/);
    const d = b.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const title = t ? limpiar(t[1]) : "";
    const link = l ? limpiar(l[1]) : "";
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, date: d ? limpiar(d[1]) : "" });
    }
  }
  return items;
}

export const handler = async () => {
  for (const f of FUENTES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(f.url, {
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PitStopSV-News/1.0)" },
      });
      clearTimeout(timer);
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parsear(xml);
      if (items.length >= 2) {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            // la CDN de Netlify guarda la respuesta: casi ninguna visita
            // ejecuta la función de verdad, el consumo gratis ni se nota
            "Cache-Control": "public, max-age=900",
            "Netlify-CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          },
          body: JSON.stringify({ source: f.nombre, items: items.slice(0, 5) }),
        };
      }
    } catch (e) { /* probar la siguiente fuente */ }
  }
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=600" },
    body: JSON.stringify({ source: null, items: [] }),
  };
};
