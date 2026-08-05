/* Auditoría técnica — pegar cada bloque por separado en javascript_tool.
 *
 * Por qué está partido: devolver todo de una vez trunca la salida y se pierden
 * los campos finales. Y por qué no devuelve URLs completas: javascript_tool
 * responde [BLOCKED: Cookie/query string data] si el resultado contiene
 * cadenas de consulta. Devolvemos pathname, recuentos y booleanos.
 *
 * Son seis bloques independientes. Ajusta RUTAS al sitio que estés auditando
 * antes de correr el bloque 3, y lee references/cms.md si el bloque 2 detecta
 * WordPress, Webflow o Shopify: sirven los ficheros de raíz de otra forma.
 */

/* ---------- BLOQUE 1 · Metadatos y contenido de la página actual ---------- */
(() => {
  const d = document, g = s => [...d.querySelectorAll(s)];
  const meta = n => { const e = d.querySelector(`meta[name="${n}"]`); return e ? e.content : null; };
  const prop = p => { const e = d.querySelector(`meta[property="${p}"]`); return e ? e.content : null; };
  const t = d.title, de = meta('description');
  return JSON.stringify({
    title: t, titleLen: t ? t.length : 0,
    desc: de, descLen: de ? de.length : 0,
    canonical: (d.querySelector('link[rel=canonical]') || {}).href || null,
    lang: d.documentElement.lang || null,
    robots: meta('robots'),
    viewport: meta('viewport') ? 'yes' : 'no',
    ogCount: g('meta[property^="og:"]').length,
    ogImage: prop('og:image') ? 'yes' : 'no',
    twCount: g('meta[name^="twitter:"]').length,
    twCard: meta('twitter:card'),
    jsonldCount: g('script[type="application/ld+json"]').length,
    h1: g('h1').map(e => e.innerText.trim()),
    h2: g('h2').map(e => e.innerText.trim()),
    h3: g('h3').map(e => e.innerText.trim()),
    imgs: g('img').length,
    imgsNoAlt: g('img').filter(e => !e.alt || !e.alt.trim()).length,
    words: (d.body.innerText.trim().match(/\S+/g) || []).length,
    hreflangCount: g('link[rel=alternate]').length,
    internas: [...new Set(g('a').filter(a => a.host === location.host).map(a => a.pathname))],
    externas: [...new Set(g('a').filter(a => a.host && a.host !== location.host).map(a => a.host))]
  });
})()

/* ---------- BLOQUE 2 · Detección de plataforma ----------
 * Determina el CMS antes de interpretar el bloque 3: cada plataforma sirve
 * los ficheros de raíz en rutas distintas. Ver references/cms.md.        */
(() => {
  const gen = (document.querySelector('meta[name="generator"]') || {}).content || null;
  const html = document.documentElement.outerHTML;
  const pistas = {
    wordpress: /\/wp-content\/|\/wp-includes\/|wp-json/i.test(html),
    yoast:     /yoast|wpseo/i.test(html),
    rankmath:  /rank-math|rankmath/i.test(html),
    elementor: /elementor/i.test(html),
    shopify:   /cdn\.shopify\.com|Shopify\.theme/i.test(html),
    webflow:   /assets\.website-files\.com|assets-global\.website-files\.com|wf-/i.test(html),
    nextjs:    /\/_next\//i.test(html),
    astro:     /astro-island|data-astro/i.test(html),
    squarespace: /squarespace/i.test(html)
  };
  return JSON.stringify({
    generator: gen,
    detectado: Object.keys(pistas).filter(k => pistas[k]),
    nota: 'si no se detecta nada, tratar como sitio estatico: control total sobre las rutas de raiz'
  });
})()

/* ---------- BLOQUE 3 · Ficheros de raíz, sitemaps y códigos de respuesta ----------
 * Dos cosas que se hacen mal a menudo:
 *  1) Buscar el sitemap solo en /sitemap.xml. WordPress nativo lo pone en
 *     /wp-sitemap.xml y Yoast/Rank Math en /sitemap_index.xml. La fuente
 *     autorizada es la directiva Sitemap: del robots.txt: se lee primero.
 *  2) Pararse en el índice. Los tres son <sitemapindex>, no listas de páginas:
 *     hay que seguir los hijos o reportarás 6 URLs donde hay 300.
 * Incluye siempre una ruta inexistente: sin ella no distingues un 404 real
 * de un catch-all que devuelve 200 a todo.                                    */
(async () => {
  // Ajusta RUTAS a las páginas que esperas del sitio auditado
  const RUTAS = ['/robots.txt', '/llms.txt',
                 '/sobre-mi', '/servicios', '/proyectos', '/faq', '/blog', '/contacto',
                 '/ruta-inexistente-xyz123'];
  const CANDIDATOS = ['/sitemap.xml', '/sitemap_index.xml', '/wp-sitemap.xml',
                      '/sitemap-index.xml', '/sitemap/sitemap.xml'];

  const res = [];
  for (const p of RUTAS) {
    try {
      const r = await fetch(p); const x = await r.text();
      res.push({ p, status: r.status, len: x.length, ct: (r.headers.get('content-type') || '').split(';')[0] });
    }
    catch (e) { res.push({ p, status: 'ERR' }); }
  }

  // Muchos CMS con catch-all devuelven 200 a cualquier ruta. Si la ruta falsa
  // responde 200, el codigo de estado deja de ser informativo y hay que
  // validar por contenido, no por status.
  const falsa = res.find(x => x.p === '/ruta-inexistente-xyz123') || {};
  const catchAll = falsa.status === 200;

  let robots = '';
  try { robots = await (await fetch('/robots.txt')).text(); } catch (e) {}

  // Validacion por contenido para las tres rutas de raiz: un 200 que devuelve
  // el HTML de la home no es el fichero, es el catch-all.
  const valida = async (ruta, test) => {
    try {
      const r = await fetch(ruta); if (r.status !== 200) return { status: r.status, real: false };
      const t = await r.text();
      return { status: 200, real: test(t, (r.headers.get('content-type') || '')), bytes: t.length };
    } catch (e) { return { status: 'ERR', real: false }; }
  };
  const ficherosRaiz = {
    robots: await valida('/robots.txt', t => /User-?agent:/i.test(t) && !/<html/i.test(t)),
    llms:   await valida('/llms.txt',   (t, ct) => !/<html/i.test(t) && (/^#|^>/m.test(t.trim()) || ct.includes('text/plain')))
  };

  // La directiva Sitemap: manda; los candidatos son el plan B
  const declarados = [...robots.matchAll(/Sitemap:\s*(\S+)/gi)]
    .map(m => { try { return new URL(m[1]).pathname; } catch (e) { return m[1]; } });

  const probar = [...new Set([...declarados, ...CANDIDATOS])];
  const sitemaps = [];
  let paginas = [];
  for (const p of probar) {
    let r; try { r = await fetch(p); } catch (e) { continue; }
    if (r.status !== 200) { sitemaps.push({ p, status: r.status }); continue; }
    const xml = await r.text();
    const esIndice = /<sitemapindex/i.test(xml);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    sitemaps.push({ p, status: 200, indice: esIndice, entradas: locs.length });

    if (esIndice) {
      for (const hijo of locs.slice(0, 12)) {          // tope por prudencia
        let hp; try { hp = new URL(hijo).pathname; } catch (e) { continue; }
        try {
          const hr = await fetch(hp);
          if (hr.status !== 200) continue;
          const hx = await hr.text();
          paginas.push(...[...hx.matchAll(/<loc>([^<]+)<\/loc>/g)]
            .map(m => { try { return new URL(m[1]).pathname; } catch (e) { return m[1]; } }));
        } catch (e) {}
      }
    } else {
      paginas.push(...locs.map(u => { try { return new URL(u).pathname; } catch (e) { return u; } }));
    }
    if (paginas.length) break;   // ya tenemos el sitemap bueno
  }
  paginas = [...new Set(paginas)];

  const BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
                'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended',
                'Applebot-Extended', 'CCBot'];

  // URLs finas que WordPress genera solas: cuentan en el sitemap pero no aportan
  const finas = paginas.filter(p => /\/(category|tag|author|page)\/|\/\d{4}\/\d{2}\//i.test(p));

  return JSON.stringify({
    catchAll, ficherosRaiz,
    res, sitemapsDeclaradosEnRobots: declarados, sitemaps,
    paginasEnSitemap: paginas.length,
    muestraPaginas: paginas.slice(0, 25),
    posiblesArchivosFinos: finas.length,
    botsPermitidos: BOTS.filter(b => new RegExp('User-Agent:\\s*' + b, 'i').test(robots)),
    botsAusentes: BOTS.filter(b => !new RegExp('User-Agent:\\s*' + b, 'i').test(robots)),
    aviso: catchAll ? 'OJO: la ruta falsa devuelve 200. Ignora los status de res[] y usa ficherosRaiz.real' : null
  });
})()

/* ---------- BLOQUE 4 · Datos estructurados ----------
 * Si el bloque 2 detectó Yoast o Rank Math, espera encontrar ya un @graph
 * propio del plugin. En ese caso lo correcto es extenderlo, no añadir un
 * segundo Person: dos entidades que se contradicen es peor que una pobre. */
(() => {
  const bloques = [...document.querySelectorAll('script[type="application/ld+json"]')];
  const out = bloques.map(b => {
    try {
      const o = JSON.parse(b.textContent);
      const nodos = o['@graph'] || [o];
      return nodos.map(n => ({ tipo: n['@type'], id: n['@id'] || null, campos: Object.keys(n) }));
    } catch (e) { return [{ tipo: 'ERROR_PARSEO' }]; }
  });
  // sameAs de la entidad principal: es el mecanismo que une la web con los perfiles externos
  let sameAs = null, image = null;
  try {
    const o = JSON.parse(bloques[0].textContent);
    const p = (o['@graph'] || [o]).find(n => /Person|Organization/.test(n['@type'] || ''));
    if (p) { sameAs = p.sameAs || null; image = p.image ? (p.image.url || p.image) : null; }
  } catch (e) {}
  return JSON.stringify({ bloques: out, sameAs, imagePath: image ? (() => { try { return new URL(image, location.href).pathname; } catch (e) { return null; } })() : null });
})()

/* ---------- BLOQUE 5 · Rendimiento, accesibilidad y recursos declarados ----------
 * Comprueba que image y og:image resuelvan 200: un schema que apunta a un
 * recurso inexistente resta credibilidad a todo el marcado, y no se ve.      */
(async () => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const rs = performance.getEntriesByType('resource');
  const els = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.innerText && e.innerText.trim());
  const small = els.filter(e => parseFloat(getComputedStyle(e).fontSize) < 12).length;
  const tg = [...document.querySelectorAll('a,button')].filter(e => {
    const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44);
  }).length;

  const cand = [];
  const og = document.querySelector('meta[property="og:image"]');
  if (og) cand.push(og.content);
  try {
    const o = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    const p = (o['@graph'] || [o]).find(n => /Person|Organization/.test(n['@type'] || ''));
    if (p && p.image) cand.push(p.image.url || p.image);
  } catch (e) {}
  const imgs = [];
  for (const u of [...new Set(cand)]) {
    let path; try { path = new URL(u, location.href).pathname; } catch (e) { continue; }
    const r = await fetch(path);
    imgs.push({ path, status: r.status, ct: (r.headers.get('content-type') || '').split(';')[0] });
  }

  return JSON.stringify({
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    protocolo: nav.nextHopProtocol,
    recursos: rs.length,
    kb: Math.round(rs.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
    textosPequenos: small, objetivosTactilesPequenos: tg,
    imagenesDeclaradas: imgs
  });
})()

/* ---------- BLOQUE 6 · Metadatos de las subpáginas sin navegar ----------
 * fetch + DOMParser desde la home: mucho más rápido que cargar cada página.
 * Rellena RUTAS con lo que haya devuelto el sitemap en el bloque 3. */
(async () => {
  const RUTAS = ['/sobre-mi', '/servicios', '/proyectos', '/faq', '/contacto'];
  const out = [];
  for (const p of RUTAS) {
    const r = await fetch(p);
    if (r.status !== 200) { out.push({ p, status: r.status }); continue; }
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
    const g = s => [...doc.querySelectorAll(s)];
    const t = doc.querySelector('title'), de = doc.querySelector('meta[name="description"]');
    const can = doc.querySelector('link[rel=canonical]');
    out.push({
      p, status: 200,
      titleLen: t ? t.textContent.length : 0,
      descLen: de ? de.content.length : 0,
      canonicalPath: can ? (() => { try { return new URL(can.getAttribute('href')).pathname; } catch (e) { return can.getAttribute('href'); } })() : null,
      og: g('meta[property^="og:"]').length,
      jsonldTipos: g('script[type="application/ld+json"]').map(e => {
        try { const o = JSON.parse(e.textContent); return (o['@graph'] || [o]).map(n => n['@type']).join('+'); }
        catch (x) { return 'ERROR_PARSEO'; }
      }),
      h1: g('h1').length,
      imgs: g('img').length,
      imgsNoAlt: g('img').filter(e => !e.getAttribute('alt')).length,
      words: (doc.body.textContent.trim().match(/\S+/g) || []).length
    });
  }
  return JSON.stringify(out);
})()
