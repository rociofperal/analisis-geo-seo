# Mecánica de los motores

Cómo lanzar y leer las consultas sin perder tiempo. Casi todo lo que hay aquí son trampas descubiertas ejecutando la batería de verdad; ignorarlas cuesta reintentos.

## Carga de herramientas

Carga las de Chrome en **una sola llamada** a ToolSearch:

```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__browser_batch
```

Empieza siempre con `tabs_context_mcp` para tener el `tabId`.

**El tab puede desaparecer a mitad de la batería.** Si una llamada devuelve «Tab … no longer exists» o «is not in the same group», vuelve a llamar a `tabs_context_mcp` y continúa con el nuevo id. No es un fallo grave, pero perderás la consulta en curso: relánzala.

## Perplexity — el motor principal

Es el único de los tres que se automatiza sin fricción, porque acepta la consulta por URL y no exige sesión.

### Lanzar

Dos formas. La segunda es preferible cuando la consulta tiene acentos, comillas o interrogaciones, porque evita codificar a mano:

```js
// desde una página de perplexity ya cargada
location.href = 'https://www.perplexity.ai/search?q=' + encodeURIComponent('¿Quién es …?');
'go'
```

Devuelve `'go'` al final para que la llamada no falle al descargarse la página.

Si vienes de otro dominio, primero `navigate` a la URL de búsqueda ya codificada, y a partir de ahí usa el truco de `location.href` para el resto de la batería.

### Esperar

Unos **20 segundos** antes de leer. Con `browser_batch` se encadena en una sola llamada:

```
javascript_tool (lanzar) → computer wait 10 → computer wait 10 → javascript_tool (leer)
```

Puedes meter **dos consultas completas en el mismo `browser_batch`** y así reducir a la mitad los viajes de ida y vuelta. Más de dos y el batch se vuelve frágil.

Para saber si ha terminado de generar, **no busques el rótulo «En curso»**: depende del idioma de la interfaz. Mide el tamaño del texto dos veces con unos segundos de diferencia — si ha crecido, sigue escribiendo:

```js
const a = document.body.innerText.length;
await new Promise(r => setTimeout(r, 4000));
const b = document.body.innerText.length;
JSON.stringify({ generando: b > a, largo: b })
```

### Leer — sin depender del idioma

**Usa `document.body.innerText`, no `get_page_text`.** El panel de fuentes de Perplexity no aparece en el texto que extrae `get_page_text`, y las fuentes son la mitad del dato que buscas.

La tentación es anclarse a un rótulo de la interfaz para localizar dónde empieza la respuesta. **No lo hagas**: «Descargar Comet», «Buscando en la web» o «Fuentes» solo existen con la interfaz en español, y la extracción devolvería vacío para cualquier otro usuario.

El ancla buena es **el texto de la consulta que acabas de lanzar**, porque lo has escrito tú y por tanto lo conoces. Aparece dos veces en la página —en la lista de sesiones y en la burbuja de la pregunta— y la respuesta empieza justo después de la segunda:

```js
const CONSULTA = '…aquí el texto exacto que lanzaste…';
const DOMINIO  = 'ejemplo.com';
const MARCA    = 'Nombre del sujeto';

const t = document.body.innerText;
const ancla = CONSULTA.slice(0, 60);           // un trozo basta y evita truncados
const i = t.lastIndexOf(ancla);                // la última ocurrencia es la burbuja
const desde = i >= 0 ? i + ancla.length : 0;   // si no aparece, leemos desde el principio

JSON.stringify({
  ancladoOk: i >= 0,                                  // si sale false, revisa la consulta
  cita: new RegExp(DOMINIO.replace('.', '\\.'), 'i').test(t),
  menciones: t.split('\n').filter(l => new RegExp(MARCA, 'i').test(l)).slice(0, 8),
  respuesta: t.slice(desde, desde + 2000)
})
```

Si `ancladoOk` sale `false`, casi siempre es que la consulta llevaba un salto de línea o un carácter que la interfaz ha normalizado. Prueba con un trozo más corto y sin signos de puntuación.

Mantén el recorte en **unos 2.000 caracteres**: si pides mucho más, la salida se trunca y pierdes los campos que van después de `respuesta` en el JSON. Pon los flags **antes** del texto largo, por ese mismo motivo.

Para ver la lista de fuentes, localiza el botón con **`find`** describiéndolo en lenguaje natural —«sources button», «botón de fuentes»— en lugar de buscar su texto exacto: `find` es semántico y funciona con la interfaz en cualquier idioma. Después haz `left_click`, espera 2-3 s y vuelve a leer `innerText`; las fuentes aparecen entonces como líneas de texto.

### Trampas de Perplexity

- **`javascript_tool` puede responder `[BLOCKED: Cookie/query string data]`.** Ocurre cuando el código devuelve URLs completas o cadenas de consulta. Solución: no devuelvas nunca `href` completos — extrae `pathname`, o solo un booleano de si el dominio aparece.
- `document.querySelectorAll('a[href^="http"]')` devuelve vacío en las páginas de resultados. No intentes sacar las fuentes por el DOM de enlaces: usa `innerText`.
- Aparecerá un aviso de cookies y otro de «inicia sesión». Localízalos con `find` y cierra el de cookies eligiendo **solo las necesarias** (la opción más respetuosa con la privacidad) y el de sesión con su «×». Una vez cerrados no vuelven durante la sesión.

## ChatGPT — contraste de entidad

Requiere sesión iniciada. Comprueba con una captura antes de escribir.

1. `navigate` a `https://chatgpt.com/`, esperar ~6 s, captura.
2. Localiza el cuadro de texto con `find`, haz `left_click` sobre su `ref`, `type` la consulta, esperar 2 s, `key Return`.
3. Esperar **30-50 s**. Es bastante más lento que Perplexity cuando busca en la web.
4. `get_page_text` suele devolver solo un fragmento. **Lee con capturas** y desplázate para ver la respuesta completa.

Termina la consulta con una instrucción explícita de buscar en la web —«Busca en la web.», «Search the web.»— en el idioma de la consulta. Sin eso contesta de memoria y el resultado no mide indexación.

**Trampa con los acentos.** El editor de ChatGPT a veces se come los caracteres no ASCII al escribir por teclado y deja solo los acentos sueltos («¿éíáíñá»). Si ves eso en la captura, borra y reescribe la consulta sin acentos: los motores son insensibles a ellos, y anótalo como salvedad en la transcripción para que quede constancia de que el texto lanzado no fue exactamente el de la batería.

Fíjate en **qué dominios cita**. Que cite solo LinkedIn y no la web del sujeto es un diagnóstico en sí mismo: significa que su índice (Bing) no tiene el sitio, y la acción es dar de alta el sitemap en Bing Webmaster Tools, no tocar la web.

## Gemini — contraste de taxonomía

Requiere sesión iniciada. Es el más quisquilloso de los tres.

- **Escribir con un clic por coordenadas no siempre funciona.** Usa `find` para localizar el cuadro de texto («prompt input textbox»), haz `left_click` con el `ref`, y solo entonces `type`. Verifica con una captura que el texto ha entrado antes de enviar.
- **`Return` no siempre envía.** Pulsa el botón de enviar (la flecha, a la derecha del cuadro). Si `find` no lo encuentra —solo aparece cuando hay texto— localízalo en la captura y haz clic por coordenadas.
- Cierra el aviso de ajustes si aparece.
- Suele **no citar fuentes web**. Su valor no es medir indexación, sino que devuelve la **taxonomía del mercado** —las etiquetas con las que se busca ese perfil— y **directorios concretos** donde buscaría. Eso es material accionable aunque el sujeto no aparezca.

## Búsqueda clásica

Usa `WebSearch` para: nombre exacto entre comillas, dominio, y nombre junto a cada nicho. Sirve para confirmar si la web está indexada en absoluto y para detectar homónimos.

`web_fetch` solo alcanza URLs que hayan aparecido antes en un resultado de búsqueda o en un mensaje del usuario. Para comprobar un perfil concreto (LinkedIn, GitHub) navega con Chrome, que no tiene esa restricción.

## Registro por consulta

De cada consulta guarda en `estado.json`:

```
id, bloque, texto, motor, estado (recomendado | citado | ausente),
posicion (si recomendado), correcta (bool | null si ausente),
competidores [], frases_evidencia [], cita_literal, fuentes_n
```

`frases_evidencia` es el campo que más rinde con el tiempo: acumulado sobre varias semanas dibuja el patrón de lo que los motores exigen en ese sector.
