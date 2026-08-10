# Panel e informe semanal

## Plantilla

`assets/plantilla-panel.html` es autocontenido: estilos en línea, sin más dependencia externa que Chart.js por CDN. Los marcadores `{{...}}` se sustituyen; el resto se conserva.

En Cowork, escribe el HTML a fichero y pásalo a `update_artifact` con el id `geo-seo-<slug>`. Así el usuario tiene un panel vivo que puede reabrir. La primera semana usa `create_artifact`.

## Regla de oro al actualizar

Conserva estructura, estilos y secciones. Añade un objeto al array `HIST` **sin borrar los anteriores** y actualiza cifras y tablas. Si reescribes el panel desde cero cada semana, se pierde el histórico, que es la razón de existir del seguimiento.

Antes de entregar, comprueba tres cosas: que `HIST` contiene todas las mediciones anteriores más la nueva, que las etiquetas cierran (`div`, `table`, `tr`, `td` en número par), y que **los totales de las tarjetas cuadran con la matriz de consultas, motor por motor**. Un panel con cifras que no cuadran entre secciones destruye la confianza en todo el informe.

## Forma de `HIST`

Una entrada por medición, con las apariciones y el total **de cada motor por separado**:

```js
const HIST = [
  { fecha: "3 ago",  seo: 86, ppx:{a:5,t:15}, gpt:{a:0,t:15}, gem:{a:0,t:15} },
  { fecha: "10 ago", seo: 94, ppx:{a:6,t:15}, gpt:{a:4,t:15}, gem:{a:1,t:15} }
];
```

`a` son apariciones (estado `recomendado`), `t` el total realmente lanzado en ese motor. Guardar `t` por motor y no una constante global es lo que permite que una semana en la que ChatGPT agotó su cuota se represente con honestidad: `{a:2,t:6}` es un dato, `{a:2,t:15}` sería mentira.

Nunca conviertas los tres motores en una sola cifra agregada. Un 33 % global puede ser 100/0/0, y esos dos casos piden acciones opuestas.

## Las nueve secciones

**1 · Cabecera y «Cambios desde la semana anterior».** Desde la segunda medición, un bloque destacado justo bajo el subtítulo. Tres o cuatro frases: qué mejoró con cifras, qué se resolvió, qué sigue igual. Es lo primero y a menudo lo único que se lee. Incluye lo que **no** avanzó, y también lo que **retrocedió**: perder una posición ganada es la noticia más accionable que puede dar un panel, porque el competidor que adelantó enseña qué falta. Un informe que solo cuenta buenas noticias deja de ser útil a la tercera semana.

**2 · Tarjetas de puntuación.** Una tarjeta de visibilidad **por motor** (`x / 15` en Perplexity, ChatGPT y Gemini), más puntuación técnica y URLs indexables. Cada una con su valor anterior en la nota: «Era 5/15». Un número sin delta no informa. Colorea por estado, no por optimismo.

Tres tarjetas en vez de una no es cosmética: es la diferencia entre «vamos al 33 %» y «Perplexity nos cita, ChatGPT no nos ve y Gemini ni siquiera rastrea», que son tres diagnósticos con tres acciones distintas.

**3 · Matriz de consultas.** 15 filas agrupadas por bloque × 3 columnas de motor. En cada celda, el estado; debajo de la fila, el detalle y la cita literal relevante en un `.quote` — es lo que permite discutir el diagnóstico en lugar de aceptarlo. Cabecera de bloque con el recuento por motor.

Con 45 resultados, una tabla plana es ilegible. La matriz además hace visible de un vistazo el patrón que importa: si una fila está verde en un motor y roja en los otros dos, el problema es de índice; si una fila entera está roja, el problema es de contenido.

**4 · «Lo que los motores te han dicho que necesitan».** Dos columnas: frase literal | qué significa. Suele ser la sección que el usuario relee. No la resumas ni la parafrasees: el valor está en que son palabras del motor, no interpretación propia. Incluye aquí las **reservas** («conviene validar referencias independientes»), que a menudo son más accionables que las ausencias.

**5 · Auditoría técnica.** Tabla elemento / estado / detalle. Marca explícitamente como **Resuelto** lo corregido desde la última medición, con una frase de qué era y qué es ahora. Ver el progreso acumulado es lo que sostiene el hábito de implementar.

**6 · Huella digital.** Fuente / estado / detalle, para web, LinkedIn, GitHub, índice de búsqueda, productos y menciones de terceros. Aquí van los diagnósticos que no se ven mirando la web. En GitHub, cifras concretas: un perfil bien redactado con cero repos no acredita nada y el panel no debe darlo por bueno.

**7 · Plan de acción priorizado.** Reordenado cada semana. **Retira lo hecho** y di explícitamente que se retira, para que el usuario vea que su trabajo se ha registrado. Prioriza por impacto/esfuerzo, no por orden lógico: una acción de dos minutos que desbloquea un motor entero va antes que un rediseño.

**8 · Quién ocupa hoy tu sitio.** Consulta / posición del sujeto / recomendados por el motor. Marca las variaciones de posición respecto a la semana anterior con una flecha: es la sección que convierte el análisis en algo competitivo y concreto.

**9 · Gráfico de evolución.** Cuatro series sobre el mismo eje 0-100: el porcentaje de apariciones de **cada motor** y la puntuación técnica. Con tres o más puntos, un comentario de una línea sobre la tendencia. Si el denominador de un motor cambió en algún punto de la serie, márcalo visualmente y explícalo en el pie.

## Transcripción semanal

Fichero aparte, `transcripcion-YYYY-MM-DD.md`. Agrupada **por pregunta y dentro de ella por motor**, para poder leer en paralelo las tres respuestas a la misma consulta: ahí se ve qué motor va por delante y en qué se diferencian sus fuentes.

Para cada una: motor, número de fuentes, veredicto, **cita literal** de la parte relevante y una línea de «Lectura».

La «Lectura» es donde va el valor interpretativo: qué significa esa respuesta, por qué gana el competidor que gana, qué acción concreta se deduce. Sin ella la transcripción es un volcado; con ella es un análisis.

Cierra con un resumen cuantitativo por bloque **y por motor**, y la lista de frases accionables de la semana.

## Resumen en el chat

Máximo seis líneas: qué cambió respecto a la semana anterior **por motor** y las tres acciones más prioritarias. No repitas el informe — el panel ya lo contiene, y un resumen largo compite con él en lugar de dirigir hacia él.
