# Particularidades por CMS

El **diagnóstico** es idéntico en cualquier plataforma: se mide el resultado renderizado, y a un motor generativo le da igual qué lo generó. Lo que cambia es **dónde se arreglan** los hallazgos, y algunas plataformas sirven los ficheros en rutas distintas de las esperadas.

Detecta la plataforma antes de dar por buenos los resultados del bloque 2 de la auditoría. El script lo hace mirando la etiqueta `generator`, rutas delatoras (`/wp-content/`, `cdn.shopify.com`, `assets.website-files.com`) y cabeceras. Si el CMS no está en esta lista, trátalo como «control total» y verifica a mano las tres rutas de raíz.

## WordPress

Es el caso más frecuente y el que más trampas tiene.

**`robots.txt` es virtual.** WordPress lo genera al vuelo; no existe como fichero. Se edita desde Yoast o Rank Math, o con el filtro `robots_txt` en `functions.php`. Trampa: si alguien sube un `robots.txt` físico a la raíz, ese **pisa al virtual**, y acabas editando uno que no se sirve. Si el contenido que ves no coincide con lo que dice el plugin, es esto.

**El sitemap no está en `/sitemap.xml`.** Nativo desde WordPress 5.5: `/wp-sitemap.xml`. Yoast y Rank Math: `/sitemap_index.xml`. Los tres son **índices**, no listas de páginas: hay que seguir los sitemaps hijos para obtener las URLs reales. Un análisis que se pare en el índice reporta «6 URLs» cuando hay 300.

La fuente autorizada siempre es la directiva `Sitemap:` del `robots.txt`. Léela antes de probar rutas a ciegas.

**El JSON-LD ya existe y hay que extenderlo, no duplicarlo.** Yoast y Rank Math emiten su propio `@graph` con `WebSite`, `WebPage`, `Organization` o `Person` y `BreadcrumbList`. Añadir un segundo bloque `Person` propio crea **dos entidades que se contradicen**, y eso es peor que una sola pobre: el motor no sabe cuál creer. Lo correcto es extender el grafo existente con los filtros del plugin (`wpseo_schema_person` y compañía en Yoast, `rank_math/json_ld` en Rank Math) para añadir lo que viene vacío: `sameAs`, `knowsAbout`, `alternateName`, `hasCredential`.

Comprueba también qué tipo declara: muchos sitios de marca personal salen como `Organization` cuando deberían ser `Person`, o al revés.

**`llms.txt` no tiene soporte nativo.** Un fichero suelto en la raíz funciona. Si el hosting o un plugin de seguridad bloquea ficheros de texto desconocidos en la raíz, sírvelo con una regla de reescritura o con el hook `init` devolviendo `text/plain`.

**Varios H1 por página.** Muy común con Elementor, Divi y WPBakery: el tema pone uno y el constructor otro. Es de los fallos más repetidos y de los más fáciles de corregir.

**Contenido fino generado automáticamente.** WordPress crea archivos de categoría, etiqueta, autor y fecha, y una página por cada archivo subido a la biblioteca de medios. Todo eso son URLs sin contenido propio que diluyen el sitio. Yoast redirige las páginas de adjuntos por defecto; verifica que esté activo y que los archivos que no aportan estén en `noindex`. Cuenta las URLs indexables **útiles**, no las totales del sitemap.

**Rendimiento.** A favor: sirve HTML desde el servidor, así que el problema de contenido que solo existe tras ejecutar JavaScript no aparece. En contra: los constructores inflan el DOM y el TTFB depende del plugin de caché. Mide dos veces —con caché caliente y con una URL que no esté cacheada— porque la primera medición puede ser engañosamente buena.

**Multiidioma.** WPML y Polylang generan `hreflang` automáticamente. Si el sitio es monolingüe, deja ese criterio a 0 sin penalizar.

## Webflow

**`robots.txt` y sitemap** se gestionan en *Site settings → SEO*. El sitemap se genera en `/sitemap.xml` y se activa con un interruptor; también se puede sustituir por uno manual.

**No hay datos estructurados automáticos.** Se añaden como código personalizado en el `head` del sitio o de cada página. Es más trabajo que en WordPress, pero a cambio no hay riesgo de duplicar entidades.

**`llms.txt` es el punto débil.** Webflow no permite servir ficheros de texto arbitrarios en la raíz. Alternativas: publicar el contenido como una página normal (`/llms`) y reescribir la ruta con un proxy delante —Cloudflare Worker o similar—, o aceptar que ese criterio se queda a 0 y compensar con `FAQPage` y contenido en prosa bien estructurado. Anótalo como limitación de plataforma, no como negligencia.

**Las colecciones de CMS son una ventaja** para lo que esta skill suele recomendar: crear una página por proyecto o servicio es trivial y sale con plantilla consistente.

## Shopify

**`robots.txt` es editable** mediante `robots.txt.liquid` en el tema. El **sitemap** está en `/sitemap.xml`, se genera solo y no se puede modificar.

**Los datos estructurados dependen del tema.** Casi todos emiten `Product` y `Offer` razonables; `Organization` suele venir mínimo y sin `sameAs`. Si el sujeto es una marca personal detrás de la tienda, casi seguro falta `Person` por completo.

**`llms.txt`**: misma limitación que Webflow. Se puede servir con un *app proxy*, pero para la mayoría de casos no compensa.

## Sitios estáticos y frameworks

Next.js, Astro, Hugo, Eleventy, HTML a mano: control total sobre las tres rutas de raíz y sobre el JSON-LD. Nada especial que vigilar salvo lo obvio.

El único riesgo propio es el contrario al de WordPress: **que el contenido solo exista tras ejecutar JavaScript**. Comprueba que el texto esté en el HTML servido, no solo en el DOM renderizado. Si `fetch` de la URL devuelve un esqueleto sin contenido, ese es el hallazgo más importante de toda la auditoría, porque significa que buena parte de los rastreadores no ve nada.

## Cómo afecta a la puntuación

La rúbrica no cambia. Pero cuando una plataforma **impide** cumplir un criterio —`llms.txt` en Webflow o Shopify—, decláralo en el panel como limitación de plataforma y usa `_ignorar` en `scripts/puntuacion.py` para excluirlo del total y que se reescale. Así la serie histórica sigue siendo comparable y el usuario no arrastra semana tras semana una penalización que no puede resolver.
