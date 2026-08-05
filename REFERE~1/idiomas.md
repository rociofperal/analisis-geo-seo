# Idiomas y mercados

La skill está escrita en español, pero **el análisis funciona en cualquier idioma**. Lo que hay que decidir conscientemente son tres cosas.

## 1 · La batería va en el idioma del mercado, siempre

No en el idioma del cliente ni en el tuyo: **en el que escribiría quien busca proveedor**. Los motores generativos responden cosas muy distintas según el idioma de la consulta, porque el corpus que consultan es distinto.

Un despacho de Barcelona que vende a Alemania necesita la batería en alemán, aunque el cliente y tú habléis español. Si vende en los dos mercados, son **dos baterías separadas con dos series históricas**, no una mezclada: los resultados no son comparables entre sí.

Si el sujeto opera en un solo mercado pero en un país con varias lenguas, pregunta cuál usa su cliente para buscar. Suele haber una dominante para las búsquedas comerciales aunque la web esté traducida a las dos.

Concreta también el país en el texto de la consulta —«en España», «in Germany»— porque cambia mucho a quién recomienda el motor.

## 2 · Nunca ancles la lectura a rótulos de la interfaz

Es el error que rompe la skill para cualquiera que no tenga los motores en español. «Descargar Comet», «Buscando en la web», «Fuentes», «En curso» son cadenas de la interfaz en un idioma concreto.

Las alternativas independientes del idioma están en `motores.md` y son tres:

- **Para localizar la respuesta**, ánclate al texto de la consulta que acabas de lanzar. Lo has escrito tú, así que lo conoces, y aparece literalmente en la página.
- **Para saber si ha terminado de generar**, compara la longitud del texto dos veces con unos segundos de diferencia. Si ha crecido, sigue escribiendo.
- **Para pulsar botones**, usa `find` con una descripción en lenguaje natural en lugar de buscar su texto exacto. `find` es semántico y localiza el botón de fuentes o el de enviar en cualquier idioma.

## 3 · Idioma del panel y de los informes

La plantilla del panel (`assets/plantilla-panel.html`) trae los rótulos en español. Se pueden traducir sin problema — son texto plano en el HTML.

Lo importante es **decidirlo en la línea base y no cambiarlo después**. Si la semana 1 el panel dice «Visibilidad GEO» y la semana 4 dice «AI Visibility», el usuario no sabe si está mirando la misma métrica, y el histórico pierde legibilidad.

Regla práctica: **el panel y los informes van en el idioma del usuario; la batería, en el del mercado.** No tienen por qué coincidir, y es normal que no lo hagan — una consultora española analizando el mercado francés quiere leer su informe en español con las consultas en francés.

Las citas literales de las respuestas de los motores **se transcriben en el idioma original, sin traducir**. Son pruebas. Si hace falta, añade la traducción entre corchetes después, pero el original tiene que estar.

## 4 · Cosas que no dependen del idioma

Para que quede claro qué no hay que tocar: la auditoría técnica completa —DOM, cabeceras, JSON-LD, sitemap, `robots.txt`, `llms.txt`, rendimiento—, la rúbrica de puntuación, el esquema de `estado.json` y los tres estados de clasificación funcionan igual en cualquier idioma y sobre cualquier web.

El único detalle a ajustar en `scripts/auditoria.js` es la lista `RUTAS`, que trae rutas de ejemplo en español (`/sobre-mi`, `/servicios`). Hay que sustituirlas por las del sitio auditado de todas formas, sea cual sea su idioma.
