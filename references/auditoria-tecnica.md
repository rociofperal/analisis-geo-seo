# Auditoría técnica

## Cómo ejecutarla

Navega a la home con Chrome y ejecuta `scripts/auditoria.js` con `javascript_tool`. Está partido en seis bloques porque devolver todo de una vez trunca la salida.

El bloque 2 detecta la plataforma. **Si sale WordPress, Webflow, Shopify o Squarespace, lee `cms.md` antes de interpretar el resto**: sirven los ficheros de raíz en rutas distintas y hay criterios que se cumplen de otra forma o que la plataforma impide cumplir.

Después repite el bloque de metadatos en cada subpágina que responda 200. Se puede hacer sin navegar, con `fetch` + `DOMParser` desde la propia home: es mucho más rápido que cargar cada página.

**Trampa importante:** `javascript_tool` devuelve `[BLOCKED: Cookie/query string data]` si el código retorna URLs completas o cadenas de consulta. No devuelvas nunca `href` completos ni listas de enlaces con parámetros. Devuelve `pathname`, recuentos o booleanos.

## Qué comprobar

### Ficheros de la raíz

| Ruta | Qué buscar |
|---|---|
| `/robots.txt` | 200, y directivas nominales para GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot. Referencia al sitemap. |
| sitemap | La ruta **no siempre es `/sitemap.xml`**: WordPress nativo usa `/wp-sitemap.xml` y Yoast o Rank Math `/sitemap_index.xml`. La fuente autorizada es la directiva `Sitemap:` del `robots.txt`; el script la lee primero y solo después prueba candidatos. Comprueba que el XML sea válido y que las URLs listadas **coincidan con las que responden 200**: un sitemap con URLs fantasma resta credibilidad. |
| sitemaps índice | Los tres formatos anteriores suelen ser `<sitemapindex>`, no listas de páginas. Hay que seguir los sitemaps hijos: pararse en el índice hace reportar 6 URLs donde hay 300. El script lo hace, con un tope de 12 hijos. |
| `/llms.txt` | 200. Resumen en prosa, nota de desambiguación si hay homónimos, lista de proyectos o servicios. Webflow y Shopify **no permiten servir ficheros arbitrarios en la raíz**: ahí es una limitación de plataforma, no negligencia. Ver `cms.md`. |

### Códigos de respuesta

Comprueba las rutas esperadas del sitio **más una inexistente**. Sin la ruta falsa no puedes distinguir un 404 real de un catch-all que devuelve 200 a todo.

Y esto no es un caso raro: en un WordPress con Elementor que probamos, la ruta falsa devolvía **200**. Cuando eso pasa, el código de estado deja de ser informativo y hay que **validar por contenido**: un `/llms.txt` que responde 200 pero devuelve el HTML de la home no es un `llms.txt`, es el catch-all. El script lo comprueba en `ficherosRaiz.real` mirando que `robots.txt` contenga `User-agent:` y que `llms.txt` no sea HTML. Si `catchAll` es `true`, ignora los status de `res[]` y usa esa validación.

Es el fallo que más falsos positivos produce en toda la auditoría, y el que más credibilidad quita si se cuela en un informe.

### Metadatos por página

`title` y longitud, `meta description` y longitud, `canonical`, `lang`, `meta robots`, Open Graph, Twitter Card, `viewport`, `hreflang`. Cada página debe tener los suyos: heredar los de la home es un fallo frecuente y silencioso.

### Datos estructurados

Número de bloques `application/ld+json` y tipos que declaran. Para una persona o empresa, lo relevante:

- `Person` u `Organization` con `@id`, `name`, `alternateName` (todas las variantes del nombre), `jobTitle`, `description`, `image` **que resuelva 200**, `address`, `worksFor`, `hasCredential`, `knowsAbout` y sobre todo **`sameAs`** con los perfiles externos.
- `ProfessionalService` con `hasOfferCatalog` para los servicios.
- `ItemList` para el portafolio.
- `FAQPage` donde haya preguntas frecuentes: es el tipo que más directamente produce fragmentos citables.
- `BreadcrumbList` si hay jerarquía real de páginas.

Verifica que el `image` del schema y el `og:image` **devuelvan 200**. Un schema que apunta a un recurso inexistente resta credibilidad a todo el marcado, y es un fallo que nadie ve porque la página se muestra bien.

### Contenido

Encabezados (debe haber **un solo H1** por página), recuento de palabras del `body` renderizado, número de imágenes y cuántas carecen de `alt`, enlaces internos reales (no anclas `#`) y externos.

Sobre el volumen: menos de ~300 palabras en una página es prácticamente incitable. No hay un umbral mágico, pero una página que no desarrolla nada no da al motor nada que extraer.

### Rendimiento

De Navigation Timing: TTFB, `domContentLoaded`, `loadEventEnd`, protocolo, peso total de recursos. Y comprueba que el contenido esté en el HTML servido (SSR) y no solo tras ejecutar JavaScript.

### Accesibilidad básica

Elementos de texto con `font-size` < 12 px y objetivos táctiles < 44 px. No afecta al GEO directamente, pero penaliza en auditorías y es fácil de arreglar.

## Rúbrica de puntuación (sobre 100)

Usa `scripts/puntuacion.py`, que recibe el JSON de la auditoría y devuelve el desglose. Pesos:

| Criterio | Puntos |
|---|---|
| `robots.txt` con directivas de IA | 7 |
| `sitemap.xml` válido y coherente | 7 |
| `llms.txt` | 5 |
| JSON-LD de entidad principal completo | 11 |
| `FAQPage` | 4 |
| `BreadcrumbList` | 3 |
| Canonical correcto en todas las páginas | 5 |
| Open Graph + Twitter Card | 7 |
| Title y description únicos y en rango | 7 |
| Un solo H1 por página | 5 |
| Profundidad de contenido | 9 |
| URLs indexables (objetivo: 8) | 7 |
| Hub de contenidos (blog o recursos) | 6 |
| Imágenes con `alt` y assets visuales | 5 |
| Rendimiento y SSR | 6 |
| Enlazado interno | 3 |
| `hreflang` / i18n | 3 |

Los pesos son un juicio, no una medición: lo que importa es **usar los mismos cada semana**. Si los cambias, recalcula todo el histórico o la serie deja de significar nada. Anota en el panel que la puntuación es una estimación ponderada y no un Lighthouse.

`hreflang` puntúa 0 sin penalización real en sitios monolingües; déjalo a 0 y menciónalo, o retíralo del total repartiendo sus 3 puntos si el sujeto no va a internacionalizar.

Cuando la **plataforma impide** cumplir un criterio —`llms.txt` en Webflow o Shopify—, no lo arrastres como penalización semana tras semana: exclúyelo con `_ignorar` en el JSON que pasas a `scripts/puntuacion.py`, que reescala el total sobre 100 para que la serie siga comparable, y decláralo en el panel como limitación de plataforma.
