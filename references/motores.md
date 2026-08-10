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

### Lanzar y esperar

Navega a `https://www.perplexity.ai/search?q=<consulta url-encoded>`. Con `browser_batch` se encadenan **dos consultas completas por llamada**, que es el punto dulce: más de dos y el batch se vuelve frágil.

```
navigate (consulta 1) → wait 10 → wait 10 → get_page_text
navigate (consulta 2) → wait 10 → wait 10 → get_page_text
```

Unos 20 segundos bastan para una respuesta corta. **Si el texto sale cortado a mitad de una tabla o de una lista, no es un fallo: seguía redactando.** Espera 10 s más y vuelve a leer la misma página. Las respuestas con tabla comparativa son las que más tardan y son justo las más informativas.

Alternativa a `navigate` cuando la consulta lleva acentos y comillas, desde una página de Perplexity ya cargada:

```js
location.href = 'https://www.perplexity.ai/search?q=' + encodeURIComponent('¿Quién es …?');
'go'
```

Devuelve `'go'` al final para que la llamada no falle al descargarse la página.

### Leer

`get_page_text` funciona bien para el **cuerpo de la respuesta**, e incluye las etiquetas de cita inline (el nombre corto del dominio bajo cada párrafo), que ya sirven para saber si la web propia alimenta la respuesta.

Para la **lista completa de fuentes** hace falta abrirla: `find` con «botón N fuentes», `left_click` por `ref`, esperar 2-3 s y volver a leer. Si necesitas los dominios exactos, usa `document.body.innerText` en lugar de `get_page_text`, porque el panel de fuentes no siempre entra en el texto extraído.

### Trampas de Perplexity

- **`javascript_tool` puede responder `[BLOCKED: Cookie/query string data]`.** Salta con scripts largos, con los que devuelven objetos grandes y con los que exponen URLs completas o cadenas de consulta. Solución: trocea en varias llamadas que devuelvan cadenas cortas, y no devuelvas nunca `href` completos — extrae `pathname` o solo un booleano de si el dominio aparece.
- `document.querySelectorAll('a[href^="http"]')` devuelve vacío en las páginas de resultados. No intentes sacar las fuentes por el DOM de enlaces.
- Aparecerá un aviso de cookies y otro de «Inicia sesión». Cierra el de cookies con **«Solo las necesarias»** (la opción más respetuosa con la privacidad) y el de sesión con su «×». Una vez cerrados no vuelven durante la sesión.

## ChatGPT

Requiere sesión iniciada. Comprueba con una captura antes de escribir.

### Ciclo por consulta

1. `navigate` a `https://chatgpt.com/` — **cada vez**, para abrir hilo nuevo. Esperar ~6 s.
2. Clic en el campo de texto, `type` la consulta, esperar 2 s, `key Return`.
3. Esperar **30-40 s**. Es bastante más lento que Perplexity cuando busca en la web.
4. Leer (ver abajo).

Termina siempre la consulta con «**Busca en la web.**» para forzar la búsqueda. Sin eso contesta de memoria y el resultado no mide indexación, que es lo único que interesa.

### Leer: el orden que funciona

`get_page_text` **pierde la prosa** y devuelve solo los chips de fuentes («Rocío F. Peral - Portfolio», «LinkedIn», …). Es un fallo conocido y constante, no intermitente. Orden de intentos:

1. JS sobre el último mensaje del asistente:
   ```js
   const e = [...document.querySelectorAll('[data-message-author-role="assistant"]')];
   e.length ? e[e.length - 1].innerText.slice(0, 3500) : 'NO ASSISTANT MSG'
   ```
2. Si eso también devuelve solo los chips —pasa cuando la respuesta trae tarjetas de fuentes—, **haz captura y léela**. Desplázate hacia arriba para ver el principio: la vista queda anclada al final.

### Qué se extrae de ChatGPT

Los chips de cita llevan **el nombre de la fuente, no el dominio**. Una web personal aparece como el título de su `<title>` («Rocío F. Peral - Portfolio»). Cuéntalos: el número de citas a la web propia frente al total es la métrica de citación de este motor, y es la más sensible de las tres.

Que cite solo LinkedIn y no la web del sujeto es un diagnóstico en sí mismo: significa que su índice (Bing) no tiene el sitio, y la acción es dar de alta el sitemap en Bing Webmaster Tools, no tocar la web.

### El tope del plan gratuito

**Si la cuenta es gratuita, la búsqueda web tiene límite diario.** Al agotarse, ChatGPT no avisa: sigue contestando, pero de memoria. Es el peor fallo posible porque parece un dato válido y es un falso negativo.

Detección: la respuesta deja de mostrar chips de fuentes y de decir «Buscando en la web». En cuanto lo veas, **marca esa consulta y todas las siguientes como no ejecutadas por límite de plan**. No las cuentes como ausencias.

Si el sujeto va a hacer seguimiento semanal en serio, avísale de que una cuenta de pago elimina esta restricción — es la diferencia entre 15 datos y 4.

## Gemini

Requiere sesión iniciada. Es el más quisquilloso de los tres.

### Ciclo por consulta

1. `navigate` a `https://gemini.google.com/app` — **cada vez**. Esperar ~8 s. Cierra el aviso de ajustes si aparece.
2. Clic en el cuadro de texto y `type`. Si el clic por coordenadas no enfoca, usa `find` con «prompt input textbox» y haz `left_click` por `ref`.
3. **Enviar**: ver abajo, es la trampa principal.
4. Esperar **30-40 s**. Aquí `get_page_text` sí funciona bien y devuelve la respuesta completa.

### La trampa del botón de enviar

`Return` no siempre envía, y **el botón de enviar está pegado al selector de modelo**: un clic por coordenadas abre el desplegable de modelos («3.5 Flash-Lite / 3.6 Flash / 3.1 Pro») en lugar de mandar el mensaje. Si insistes por coordenadas, lo vuelve a abrir.

Secuencia que funciona:

1. Si se ha abierto el desplegable, **haz clic en una zona vacía de la página** para cerrarlo. `Escape` no siempre lo cierra.
2. `find` con «botón Enviar mensaje».
3. `left_click` por el `ref` devuelto.
4. Captura para confirmar que el mensaje se ha enviado antes de empezar a esperar.

El botón solo existe cuando hay texto en el cuadro, así que `find` no lo encontrará si el `type` falló: eso mismo sirve de comprobación.

### Qué se extrae de Gemini

**No cita fuentes web.** No es un fallo de extracción: no las muestra. Por tanto la columna de citación es «N/A» por diseño, y no tiene sentido contarla como un cero.

Lo que sí aporta, y es material accionable que los otros dos no dan:

- **La taxonomía del mercado**: con qué etiquetas se busca ese perfil («Growth Architect», «Technical Marketer», «CMO Técnico»). Si ninguna aparece en la web ni en LinkedIn del sujeto, ahí hay una acción de un minuto.
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

`no_ejecutada` no es un cero. Va siempre con el motivo en `notas`.
