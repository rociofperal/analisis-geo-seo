# Panel e informe semanal

## Plantilla

`assets/plantilla-panel.html` es autocontenido: estilos en línea, sin más dependencia externa que Chart.js por CDN. Los marcadores `{{...}}` se sustituyen; el resto se conserva.

En Cowork, escribe el HTML a fichero y pásalo a `update_artifact` con el id `geo-seo-<slug>`. Así el usuario tiene un panel vivo que puede reabrir. La primera semana usa `create_artifact`.

## Regla de oro al actualizar

Conserva estructura, estilos y secciones. Añade un objeto al array `HIST` **sin borrar los anteriores** y actualiza cifras y tablas. Si reescribes el panel desde cero cada semana, se pierde el histórico, que es la razón de existir del seguimiento.

Antes de entregar, comprueba tres cosas: que `HIST` contiene todas las mediciones anteriores más la nueva, que las etiquetas cierran (`div`, `table`, `tr`, `td` en número par), y que los totales de las tarjetas cuadran con la suma de la tabla de consultas. Un panel con cifras que no cuadran entre secciones destruye la confianza en todo el informe.

## Las nueve secciones

**1 · Cabecera y «Cambios desde la semana anterior».** Desde la segunda medición, un bloque destacado justo bajo el subtítulo. Tres o cuatro frases: qué mejoró con cifras, qué se resolvió, qué sigue igual. Es lo primero y a menudo lo único que se lee. Incluye lo que **no** avanzó: un informe que solo cuenta buenas noticias deja de ser útil a la tercera semana.

**2 · Tarjetas de puntuación.** Visibilidad GEO (`x / total`), puntuación técnica, URLs indexables, rendimiento. Cada una con su valor anterior en la nota: «Era 0/22». Un número sin delta no informa. Colorea por estado, no por optimismo.

**3 · Tabla de las consultas.** Agrupada por bloques, con el recuento de aciertos en la cabecera de cada bloque. Columnas: consulta, motor, estado, qué respondió. En «qué respondió» incluye la cita literal relevante en un `.quote` — es lo que permite discutir el diagnóstico en lugar de aceptarlo.

**4 · «Lo que los motores te han dicho que necesitan».** Dos columnas: frase literal | qué significa. Suele ser la sección que el usuario relee. No la resumas ni la parafrasees: el valor está en que son palabras del motor, no interpretación propia.

**5 · Auditoría técnica.** Tabla elemento / estado / detalle. Marca explícitamente como **Resuelto** lo corregido desde la última medición, con una frase de qué era y qué es ahora. Ver el progreso acumulado es lo que sostiene el hábito de implementar.

**6 · Huella digital.** Fuente / estado / detalle, para web, LinkedIn, GitHub, índice de búsqueda, productos y menciones de terceros. Aquí van los diagnósticos que no se ven mirando la web.

**7 · Plan de acción priorizado.** Reordenado cada semana. **Retira lo hecho** y di explícitamente que se retira, para que el usuario vea que su trabajo se ha registrado. Prioriza por impacto/esfuerzo, no por orden lógico: una acción de dos minutos que desbloquea un motor entero va antes que un rediseño.

**8 · Quién ocupa hoy tu sitio.** Consulta / posición del sujeto / recomendados por el motor. Es la sección que convierte el análisis en algo competitivo y concreto.

**9 · Gráfico de evolución.** Dos series sobre el mismo eje 0-100: visibilidad GEO en porcentaje de consultas, y puntuación técnica. Con tres o más puntos, un comentario de una línea sobre la tendencia.

## Transcripción semanal

Fichero aparte, `transcripcion-YYYY-MM-DD.md`. Para cada consulta: pregunta, motor, número de fuentes, veredicto, **cita literal** de la parte relevante y una línea de «Lectura».

La «Lectura» es donde va el valor interpretativo: qué significa esa respuesta, por qué gana el competidor que gana, qué acción concreta se deduce. Sin ella la transcripción es un volcado; con ella es un análisis.

Cierra con un resumen cuantitativo por bloques y la lista de frases accionables de la semana.

## Resumen en el chat

Máximo seis líneas: qué cambió respecto a la semana anterior y las tres acciones más prioritarias. No repitas el informe — el panel ya lo contiene, y un resumen largo compite con él en lugar de dirigir hacia él.
