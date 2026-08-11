# Mecánica de los motores

Cómo lanzar y leer las 15 consultas en cada uno de los tres motores sin perder tiempo. Casi todo lo que hay aquí son trampas descubiertas ejecutando la batería de verdad; ignorarlas cuesta reintentos.

## Orden y presupuesto

Empieza siempre por **Perplexity**: es el único que se automatiza por URL, así que en diez minutos tienes un tercio del trabajo hecho y un primer diagnóstico por si algo se tuerce después. Luego ChatGPT y por último Gemini, que es el más frágil.

Presupuesto orientativo por medición completa: Perplexity ~10 min, ChatGPT ~20, Gemini ~20. Si el tiempo se agota, **cierra dos motores completos antes que dejar los tres a medias**: una serie con hueco es peor que una serie corta.

## Regla común: una conversación nueva por consulta

En ChatGPT y Gemini, **navega de nuevo a la raíz antes de cada pregunta**. Si encadenas las 15 en el mismo hilo, el motor arrastra el contexto de las anteriores y a partir de la tercera ya sabe de quién le estás hablando: deja de medir descubrimiento espontáneo y empieza a medir memoria de conversación, que es exactamente lo contrario de lo que interesa.

Perplexity no tiene este problema: cada búsqueda por URL es independiente.

## Carga de herramientas

Carga las de Chrome en **una sola llamada** a ToolSearch:

```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__find,mcp__claude-in-chrome__browser_batch
```

Empieza siempre con `tabs_context_mcp` para tener el `tabId`.

**El tab puede desaparecer a mitad de la batería.** Si una llamada devuelve «Tab … no longer exists» o «is not in the same group», vuelve a llamar a `tabs_context_mcp` y continúa con el nuevo id. No es un fallo grave, pero perderás la consulta en curso: relánzala.

## Perplexity

El más barato de los tres: acepta la consulta por URL y no exige sesión.

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

Las respuestas con **tabla comparativa** son las que más tardan, y son justo las más informativas porque comparan al sujeto con sus competidores fila a fila. Si el texto sale cortado a media tabla, no es un fallo: seguía redactando. Espera y vuelve a leer.

### Leer — sin depender del idioma

**Usa `document.body.innerText`, no `get_page_text`.** El panel de fuentes de Perplexity no aparece en el texto que extrae `get_page_text`, y las fuentes son la mitad del dato que buscas.

La tentación es anclarse a un rótulo de la interfaz para localizar dónde empieza la respuesta. **No lo hagas**: «Descargar Comet», «Buscando en la web» o «Fuentes» solo existen con la interfaz en español, y la extracción devolvería vacío para cualquier otro usuario.

El ancla buena es **el texto de la consulta que acabas de lanzar**, porque lo has escrito tú y por tanto lo conoces. Aparece dos veces en la página —en la lista de sesiones y en la burbuja de la pregunta— y la respuesta empieza justo después de la segunda:

```js
const CONSULTA = '…aquí el texto exacto que lanzaste…';
const DOMINIO  = 'ejemplo.com';
const MARCA    = 'Nombre del sujeto';

const t = document.body.innerText;
const ancla = CONSULTA.slice(0, 60);              // un trozo basta y evita truncados
const i = t.lastIndexOf(ancla);                   // la última ocurrencia es la burbuja
const desde = i >= 0 ? i + ancla.length : 0;      // si no aparece, leemos desde el principio

JSON.stringify({
  ancladoOk: i >= 0,                              // si sale false, revisa la consulta
  cita: new RegExp(DOMINIO.replace('.', '\\.'), 'i').test(t),
  menciones: t.split('\n').filter(l => new RegExp(MARCA, 'i').test(l)).slice(0, 8),
  respuesta: t.slice(desde, desde + 2000)
})
```

Si `ancladoOk` sale `false`, casi siempre es que la consulta llevaba un salto de línea o un carácter que la interfaz ha normalizado. Prueba con un trozo más corto y sin signos de puntuación.

Mantén el recorte en **unos 2.000 caracteres**: si pides mucho más, la salida se trunca y pierdes los campos que van después de `respuesta` en el JSON. Pon los flags **antes** del texto largo, por ese mismo motivo.

Para ver la lista de fuentes, localiza el botón con **`find`** describiéndolo en lenguaje natural —«sources button», «botón de fuentes»— en lugar de buscar su texto exacto: `find` es semántico y funciona con la interfaz en cualquier idioma. Después haz `left_click`, espera 2-3 s y vuelve a leer `innerText`; las fuentes aparecen entonces como líneas de texto.

### Trampas de Perplexity

- **`javascript_tool` puede responder `[BLOCKED: Cookie/query string data]`.** Ocurre cuando el código devuelve URLs completas o cadenas de consulta, y también con scripts largos que devuelven objetos grandes. Solución: no devuelvas nunca `href` completos —extrae `pathname`, o solo un booleano de si el dominio aparece— y trocea la extracción en varias llamadas que devuelvan cadenas cortas.
- `document.querySelectorAll('a[href^="http"]')` devuelve vacío en las páginas de resultados. No intentes sacar las fuentes por el DOM de enlaces: usa `innerText`.
- Aparecerá un aviso de cookies y otro de «inicia sesión». Localízalos con `find` y cierra el de cookies eligiendo **solo las necesarias** (la opción más respetuosa con la privacidad) y el de sesión con su «×». Una vez cerrados no vuelven durante la sesión.

## ChatGPT

Requiere sesión iniciada. Comprueba con una captura antes de escribir.

### Ciclo por consulta

1. `navigate` a `https://chatgpt.com/` — **cada vez**, para abrir hilo nuevo. Esperar ~6 s.
2. Localiza el cuadro de texto con `find`, haz `left_click` sobre su `ref`, `type` la consulta, esperar 2 s, `key Return`.
3. Esperar **30-50 s**. Es bastante más lento que Perplexity cuando busca en la web.
4. Leer (ver abajo).

Termina la consulta con una instrucción explícita de buscar en la web —«Busca en la web.», «Search the web.»— en el idioma de la consulta. Sin eso contesta de memoria y el resultado no mide indexación.

### Leer: el orden que funciona

`get_page_text` **pierde la prosa** y devuelve solo los chips de fuentes. Es un fallo conocido y constante, no intermitente. Orden de intentos:

1. JS sobre el último mensaje del asistente:
   ```js
   const e = [...document.querySelectorAll('[data-message-author-role="assistant"]')];
   e.length ? e[e.length - 1].innerText.slice(0, 3500) : 'NO ASSISTANT MSG'
   ```
2. Si eso también devuelve solo los chips —pasa cuando la respuesta trae tarjetas de fuentes—, **lee con capturas** y desplázate hacia arriba para ver el principio: la vista queda anclada al final.

### Qué se extrae de ChatGPT

Los chips de cita llevan **el nombre de la fuente, no el dominio**. Una web personal aparece como el título de su `<title>` («Nombre Apellido - Portfolio»). Cuéntalos: el número de citas a la web propia frente al total es la métrica de citación de este motor, y es la más sensible de las tres.

Que cite solo LinkedIn y no la web del sujeto es un diagnóstico en sí mismo: significa que su índice (Bing) no tiene el sitio, y la acción es dar de alta el sitemap en Bing Webmaster Tools, no tocar la web.

### Trampas de ChatGPT

**Los acentos.** El editor a veces se come los caracteres no ASCII al escribir por teclado y deja solo los acentos sueltos («¿éíáíñá»). Si ves eso en la captura, borra y reescribe la consulta sin acentos: los motores son insensibles a ellos. Anótalo como salvedad en la transcripción, para que quede constancia de que el texto lanzado no fue exactamente el de la batería.

**El tope del plan gratuito.** Si la cuenta es gratuita, la búsqueda web tiene límite diario. Al agotarse, ChatGPT no avisa: sigue contestando, pero de memoria. Es el peor fallo posible porque parece un dato válido y es un falso negativo.

Detección: la respuesta deja de mostrar chips de fuentes y de indicar que está buscando. En cuanto lo veas, **marca esa consulta y todas las siguientes como `no_ejecutada` por límite de plan**. No las cuentes como ausencias.

Si el sujeto va a hacer seguimiento semanal en serio, avísale de que una cuenta de pago elimina esta restricción — es la diferencia entre 15 datos y 4.

## Gemini

Requiere sesión iniciada. Es el más quisquilloso de los tres.

### Ciclo por consulta

1. `navigate` a `https://gemini.google.com/app` — **cada vez**. Esperar ~8 s. Cierra el aviso de ajustes si aparece.
2. Usa `find` para localizar el cuadro de texto («prompt input textbox»), haz `left_click` con el `ref`, y solo entonces `type`. Verifica con una captura que el texto ha entrado antes de enviar.
3. **Enviar**: ver abajo, es la trampa principal.
4. Esperar **30-40 s**. Aquí `get_page_text` sí funciona bien y devuelve la respuesta completa.

### La trampa del botón de enviar

`Return` no siempre envía, y **el botón de enviar está pegado al selector de modelo**: un clic por coordenadas abre el desplegable de modelos en lugar de mandar el mensaje. Si insistes por coordenadas, lo vuelve a abrir.

Secuencia que funciona:

1. Si se ha abierto el desplegable, **haz clic en una zona vacía de la página** para cerrarlo. `Escape` no siempre lo cierra.
2. `find` con «botón Enviar mensaje» / «send message button».
3. `left_click` por el `ref` devuelto.
4. Captura para confirmar que el mensaje se ha enviado antes de empezar a esperar.

El botón solo existe cuando hay texto en el cuadro, así que `find` no lo encontrará si el `type` falló: eso mismo sirve de comprobación.

### Qué se extrae de Gemini

**No cita fuentes web.** No es un fallo de extracción: no las muestra. Por tanto la columna de citación es «N/A» por diseño, y no tiene sentido contarla como un cero.

Lo que sí aporta, y es material accionable que los otros dos no dan:

- **La taxonomía del mercado**: con qué etiquetas se busca ese perfil («Growth Architect», «Technical Marketer», «CMO Técnico»). Si ninguna aparece en la web ni en el LinkedIn del sujeto, ahí hay una acción de un minuto.
- **Cadenas de búsqueda booleanas** que propone para encontrar el perfil. Son literalmente las palabras que el mercado usaría.
- **Directorios y comunidades concretas** donde buscaría.
- **La conducta que hace visible al perfil** («publican contenido compartiendo las aplicaciones que han desarrollado»), que suele describir exactamente lo que el sujeto no está haciendo.

Registra si nombra al sujeto (sí/no) y estas cuatro cosas. Con eso, 15 consultas en Gemini rinden aunque el sujeto no aparezca en ninguna.

## Búsqueda clásica

Usa `WebSearch` para: nombre exacto entre comillas, dominio, y nombre junto a cada nicho. Sirve para confirmar si la web está indexada en absoluto y para detectar homónimos.

`web_fetch` solo alcanza URLs que hayan aparecido antes en un resultado de búsqueda o en un mensaje del usuario. Para comprobar un perfil concreto (LinkedIn, GitHub) navega con Chrome, que no tiene esa restricción. Para GitHub, la API pública (`api.github.com/users/<usuario>` y `/repos`) da repos, estrellas y seguidores de una sola llamada.

## Registro por consulta

De cada una de las 45 guarda en `estado.json`:

```
id, bloque, texto, motor, estado (recomendado | citado | ausente | no_ejecutada),
posicion (si recomendado), correcta (bool | null si ausente),
competidores [], frases_evidencia [], reservas [], cita_literal, fuentes_n
```

`frases_evidencia` es el campo que más rinde con el tiempo: acumulado sobre varias semanas dibuja el patrón de lo que los motores exigen en ese sector.

`reservas` recoge las coletillas del tipo «conviene validar referencias independientes» o «no he podido verificar X». Un sujeto puede estar recomendado y perder igualmente el encargo por una de estas frases, y son la señal más temprana de que el cuello de botella ha dejado de ser la web.

`no_ejecutada` no es un cero. Va siempre con el motivo en `notas`, y **se resta del total de ese motor** para que la tasa de la semana siga siendo honesta.
