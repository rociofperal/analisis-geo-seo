---
name: analisis-geo-seo
description: Analiza y monitoriza la visibilidad de una marca, empresa o persona en los motores generativos (Perplexity, ChatGPT, Gemini) y audita su web para que esos motores la puedan citar. Hace una línea base la primera vez, y después un seguimiento recurrente que registra la evolución semana a semana en un panel con histórico, más un informe general acumulado con recomendaciones priorizadas. Úsala siempre que el usuario mencione GEO, AEO, SEO para IA, visibilidad en LLMs, "aparecer en ChatGPT", "que la IA me recomiende", análisis de marca personal en buscadores, auditoría de web para motores generativos, colisión de entidad u homónimos, llms.txt, datos estructurados para IA, seguimiento semanal de posicionamiento, o cuando pida analizar qué dicen los motores de IA sobre una web, un dominio, un profesional o un competidor. Úsala también si solo dice "analiza mi web" o "mira si salgo en la IA", sin nombrar GEO explícitamente.
---

# Análisis GEO + SEO recurrente

## Qué problema resuelve

Un buscador clásico devuelve diez enlaces; un motor generativo devuelve **una** respuesta con dos o tres nombres. O estás en esa respuesta o no existes. Esta skill mide si el sujeto aparece, por qué no aparece, y qué evidencia concreta piden los motores para incluirlo — y lo repite cada semana para que la mejora sea medible en lugar de una sensación.

La parte más valiosa del análisis no son las puntuaciones: son las **frases literales** en las que un motor explica qué está buscando y no encuentra («no aparecen perfiles técnicos públicos: GitHub, Stack Overflow, ponencias…», «conviene validar referencias independientes antes de contratar»). Esas frases son un plan de trabajo dictado por el propio motor. Recógelas siempre.

## Los tres modos

Determina cuál toca antes de hacer nada, mirando si existe ya estado guardado para el sujeto (`estado.json`, ver más abajo):

| Modo | Cuándo | Salida |
|---|---|---|
| **Línea base** | No hay estado previo para este sujeto | Panel completo + transcripción + estado inicial + propuesta de calendario |
| **Seguimiento** | Ya hay al menos una medición | Panel actualizado con «Cambios desde la semana anterior» + nueva transcripción + nuevo punto en el histórico |
| **Informe general** | El usuario lo pide explícitamente («dame el informe general», «cómo vamos desde que empezamos») | Documento acumulado: tendencia, qué se hizo, qué funcionó, qué sigue pendiente |

Si el usuario pide un análisis y no está claro si hay estado previo, búscalo antes de preguntar.

## Estado y ficheros

Todo vive en una carpeta por sujeto, dentro de la carpeta de trabajo que el usuario tenga conectada:

```
geo-seo/<slug-del-sujeto>/
├── estado.json                                  # historia completa, es la fuente de verdad
├── panel.html                                   # panel visual (también como artefacto si estás en Cowork)
├── transcripcion-YYYY-MM-DD.md                  # respuestas literales de cada semana
└── informe-general-YYYY-MM-DD.md                # solo cuando se pide
```

Si no hay carpeta conectada, pide una con `request_cowork_directory` explicando que el histórico necesita persistir entre semanas. Si el usuario prefiere no conectar ninguna, degrada con elegancia: guarda el histórico dentro del array `HIST` del panel y avísale de que el informe general será más limitado.

El esquema de `estado.json` está en `references/estado-json.md`. Léelo antes de escribirlo por primera vez. Lo esencial: nunca sobreescribas mediciones anteriores, solo añades.

## Fase 0 · Definir el sujeto (solo en la línea base)

No lances consultas hasta tener esto. Una batería mal calibrada mide ruido.

Pregunta en una sola tanda, con `AskUserQuestion` si está disponible:

1. **Web y nombre exacto**, incluidas variantes y alias con los que se le busca.
2. **Nichos**: 3-5 áreas donde quiere que le recomienden. Son los bloques temáticos de la batería.
3. **Competidores conocidos**, si los tiene. Sirven de control: si aparecen y el sujeto no, el hueco es de contenido, no de mercado.
4. **Homónimos o colisiones de entidad** que sepa que existen.

Sobre las colisiones: comprueba siempre si el nombre está ocupado por otra persona más indexada. Es el fallo más común y el más caro, porque ninguna mejora técnica funciona mientras el motor crea que el sujeto es otra persona. Se detecta con la consulta de entidad del bloque A y con una búsqueda del nombre a secas.

Advierte también, antes de empezar, de las **dos condiciones de ejecución** que limitan la batería: hace falta sesión iniciada en ChatGPT y en Gemini, y si el plan de ChatGPT es gratuito su búsqueda web tiene tope diario. Ver Fase 3.

## Fase 1 · Auditoría técnica de la web

Lee `references/auditoria-tecnica.md`. Contiene el script de extracción y la rúbrica de puntuación sobre 100.

El script detecta la plataforma en su segundo bloque. **Si es WordPress, Webflow, Shopify o Squarespace, lee `references/cms.md` antes de interpretar los resultados**, porque sirven los ficheros de raíz en rutas distintas y algunos criterios se cumplen de otra forma. El caso más traicionero es WordPress: su `robots.txt` es virtual y el sitemap no está en `/sitemap.xml`, así que una auditoría ingenua reporta como ausentes cosas que sí existen.

Resumen de lo que se mide, y por qué cada cosa importa para un motor generativo y no solo para Google:

- **`llms.txt`** — es lo que más rápido cambia el comportamiento de Perplexity. Un resumen en prosa de quién es el sujeto, con nota de desambiguación si hay homónimos.
- **`robots.txt` con permiso explícito a los bots de IA** — GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot. Un `Allow: /` genérico no basta: algunos operadores respetan solo la directiva nominal.
- **JSON-LD con `Person` u `Organization` + `sameAs`** — `sameAs` es el mecanismo por el que un motor une la web con LinkedIn y GitHub y decide que son la misma entidad. Sin él, cada fuente es una isla.
- **Profundidad de contenido y número de URLs indexables** — un motor no puede recomendar lo que no tiene URL. Un proyecto nombrado dentro de una página compartida casi nunca gana una consulta de producto; necesita página propia. Cuenta URLs **útiles**: en WordPress el sitemap incluye archivos de categoría, etiqueta, autor y fecha que inflan la cifra sin aportar contenido.
- **`<lastmod>` en el sitemap** — sin él, un buscador no tiene forma de saber que una página que rastreó cuando era mala ha cambiado. Es la causa más habitual de URLs atascadas en «descubierta pero no rastreada» durante semanas después de rehacer un sitio.
- **Metadatos únicos por página, un solo H1, canonical correcto** — higiene. Bajo impacto individual, pero es lo que resta.
- **Rendimiento y SSR** — si el contenido solo existe tras ejecutar JavaScript, buena parte de los rastreadores no lo ve.

Comprueba también los códigos de respuesta de las rutas esperadas y de una inexistente, para distinguir un 404 real de un catch-all que devuelve 200 a todo.

## Fase 2 · Huella digital fuera de la web

La web propia es una sola fuente, y los motores desconfían de las autodescripciones sin corroboración. Esta fase mide si hay respaldo externo.

- Búsquedas del nombre, del dominio y del nombre junto a cada nicho.
- **LinkedIn**: ¿existe, está poblado, y el **nombre visible coincide exactamente** con el nombre por el que se busca? Un perfil que se llama «Ana G.» no es vinculable con «Ana García Pérez». Este detalle bloquea motores enteros y se arregla en dos minutos.
- **GitHub** si el sujeto es técnico. No basta con que el perfil exista: mide **repos, estrellas y seguidores** con la API pública (`api.github.com/users/<usuario>`). Un perfil con bio impecable y cero repos no acredita nada, y varios motores nombran GitHub explícitamente como criterio de admisión.
- **Menciones de terceros**: publicaciones, rankings, directorios, foros del sector. Una ficha en un ranking ajeno pesa más que diez páginas propias.
- **Productos**: ¿tienen rastro fuera de la web del autor?
- **Índice de búsqueda**, si hay acceso a Google Search Console o Bing Webmaster Tools: URLs realmente indexadas y backlinks. Solo lectura — no envíes URLs ni pidas indexación sin permiso explícito del usuario.

## Fase 3 · La batería de consultas

Lee `references/bateria-consultas.md` para construirla y `references/motores.md` para la mecánica de navegador, que tiene bastantes trampas.

Estructura: **15 consultas en 5 bloques** (A entidad, B–E un nicho cada uno, 3 por bloque), lanzadas **íntegras en los tres motores** — Perplexity, ChatGPT y Gemini. Son 45 ejecuciones. Las consultas se redactan como las escribiría un cliente que busca proveedor, no como las escribiría el sujeto describiéndose. Esa diferencia es la que hace que el test mida demanda real.

**Si el mercado del sujeto no es hispanohablante, lee antes `references/idiomas.md`.** La batería va siempre en el idioma de quien busca proveedor, no en el del usuario ni en el tuyo, y hay que evitar anclar la lectura de las respuestas a rótulos de la interfaz — es lo que rompe la extracción cuando los motores están en otro idioma.

Tres reglas que no se negocian:

1. **Las mismas 15 preguntas, literales, en los tres motores.** Sin reformular ni adaptar por motor. Mismo denominador = series comparables entre sí.
2. **Una conversación nueva por consulta** en ChatGPT y en Gemini. Si encadenas preguntas en el mismo hilo, el motor arrastra contexto y deja de medir descubrimiento espontáneo. Perplexity no tiene este problema porque cada búsqueda por URL es independiente.
3. **Lo que no se pueda ejecutar se marca como no ejecutado**, nunca como ausencia. Un hueco explicado es dato; un cero falso envenena la serie.

Guarda la batería en `estado.json` en la línea base y **reutilízala literalmente** cada semana. Cambiar la redacción rompe la comparabilidad, que es todo el valor del seguimiento.

**Si el sujeto viene de una batería antigua** con otro reparto (por ejemplo 20 en un motor + contrastes sueltos), no mezcles los totales. Migra en un punto claro del histórico, deja anotada la fecha del cambio, y compara siempre **tasa por motor** en lugar del agregado. Un motor cuyo denominador pasa de 1 a 15 no está ampliando una muestra: está empezando una serie nueva, y hay que decirlo en el panel.

## Fase 4 · Clasificar cada resultado

Aquí es donde se gana o se pierde la utilidad del informe. Tres estados, no dos:

- **Recomendado** — el motor lo nombra como respuesta. Anota la **posición** frente a los competidores.
- **Citado pero no nombrado** — la web aparece entre las fuentes y alimenta la respuesta, pero el motor se queda con la categoría genérica en lugar de recomendar a nadie. Es el estado más informativo: significa que la autoridad ya existe y lo que falta es que el contenido sea *atribuible* — un método con nombre, fases y entregable, en lugar de una descripción de capacidades.
- **Ausente** — ni nombrado ni citado.

Mezclar los dos primeros oculta exactamente la palanca que hay que mover. Para cada consulta registra además: si la información es correcta o alucinada, qué competidores se recomiendan en su lugar, y cualquier frase donde el motor explique qué evidencia busca.

**Anota también las reservas.** Un motor puede recomendar al sujeto y a la vez añadir «conviene validar referencias independientes» o «no he podido verificar X». Esa coletilla es la diferencia entre estar en la respuesta y ganar el encargo, y suele ser el diagnóstico dominante en cuanto la web deja de ser el cuello de botella.

## Fase 5 · Panel e histórico

Lee `references/panel.md`. Usa `assets/plantilla-panel.html` como base: es autocontenido, sin dependencias más allá de Chart.js por CDN.

Secciones fijas del panel, en este orden:

1. Cabecera con fecha y, desde la segunda semana, **«Cambios desde la semana anterior»** — lo primero que se lee, y lo único que se lee si hay prisa. Di qué mejoró, qué se resolvió y qué sigue igual. Un panel que no responde «¿vamos mejor?» en tres líneas ha fallado.
2. Tarjetas de puntuación, **una de visibilidad por motor** (`x / 15` en Perplexity, ChatGPT y Gemini) más puntuación técnica y URLs indexables. Cada una con su valor anterior al lado: un número sin su delta no informa. Nunca una sola cifra agregada de los tres motores: oculta que uno va al 40 % y otro a cero, que es justo el diagnóstico accionable.
3. **Matriz de consultas**: 15 filas agrupadas por bloque × 3 columnas de motor, con el estado en cada celda y el detalle debajo. 45 filas sueltas son ilegibles; la matriz además hace visible de un vistazo el patrón por motor.
4. **«Lo que los motores te han dicho que necesitan»** — las frases literales. Suele ser la sección más útil del panel.
5. Auditoría técnica, marcando como resueltos los puntos corregidos desde la última vez. Ver el progreso sostiene el hábito.
6. Huella digital.
7. Plan de acción **reordenado** según lo que queda pendiente, retirando lo ya hecho.
8. Quién ocupa hoy el sitio del sujeto.
9. Gráfico de evolución: una serie por motor más la puntuación técnica.

Al actualizar: conserva estructura y estilos, añade un objeto al array `HIST` sin borrar los anteriores, y actualiza cifras y tablas. En Cowork, escribe el HTML a fichero y pásalo a `update_artifact` con el id del sujeto para que el usuario tenga un panel vivo.

Escribe también la transcripción literal de la semana, agrupada **por pregunta y dentro de ella por motor**, para poder leer en paralelo las tres respuestas a la misma consulta — que es donde se ve qué motor va por delante. Para cada una: pregunta, motor, número de fuentes, veredicto, cita literal de la parte relevante y una línea de «Lectura». Las citas literales son lo que permite discutir el diagnóstico en lugar de creérselo.

## Fase 6 · Programar el seguimiento

Al terminar la línea base, propón el calendario. Pregunta **día de la semana y hora**, y confirma la zona horaria si no es obvia. El lunes a primera hora funciona bien: da margen a implementar durante la semana y cada informe llega con cambios que medir.

Crea la tarea con la skill `schedule` o con `create_scheduled_task`. El texto de la tarea debe: invocar esta skill en modo seguimiento, nombrar el sujeto y la ruta de su `estado.json`, y recordar que en una ejecución programada no hay nadie a quien preguntar — hay que decidir de forma autónoma y dejar constancia de las decisiones en el informe.

Advierte de tres cosas al proponerlo:

- **ChatGPT y Gemini necesitan sesión iniciada** en el navegador. Sin ella se pierden 30 de las 45 consultas, así que la sesión hay que dejarla abierta. Lo que no se ejecute se marca como no ejecutado, nunca como ausencia.
- **Si el plan de ChatGPT es gratuito**, su búsqueda web tiene tope. Puede agotarse a mitad de la batería y seguir respondiendo de memoria, que es peor que no responder porque parece un dato válido. Hay que detectarlo y marcarlo.
- **El GEO se mueve en semanas; el SEO clásico en meses.** Un seguimiento semanal es el ritmo adecuado para el primero, y para el segundo hay que mirar la tendencia de varias semanas, no el salto de una.

Calcula también el tiempo: la batería completa ronda los 50-60 minutos, porque Perplexity se automatiza por URL pero ChatGPT y Gemini exigen escribir y esperar. Si el presupuesto se agota, es mejor cerrar dos motores completos que dejar los tres a medias.

## Informe general acumulado

Lee `references/informe-general.md`. Se construye leyendo todo `estado.json`, no la última medición.

Debe responder cuatro preguntas y en este orden, porque es el orden en que le importan a quien decide:

1. **¿Vamos mejor?** Tendencia de visibilidad **por motor** y de puntuación técnica desde el inicio, con las cifras.
2. **¿Qué hicimos y qué funcionó?** Cruza las acciones implementadas con los saltos de visibilidad de la semana siguiente. Aquí se distingue lo que mueve la aguja de lo que solo da trabajo. Sé honesto cuando la correlación no permita atribuir: «coincidió con» no es «causó».
3. **¿Qué sigue bloqueado y por qué?** Consultas que llevan varias semanas ausentes. Si algo lleva un mes sin moverse, el diagnóstico anterior era incompleto: dilo y revísalo.
4. **¿Qué toca ahora?** Plan priorizado por relación impacto/esfuerzo, con la evidencia que lo respalda.

`scripts/informe_general.py` extrae las series y las tablas de `estado.json` para no tener que leerlo a mano.

## Principios que hacen que el análisis sirva

- **Una cita no es una recomendación.** Distinguirlo señala la palanca exacta: pasar de describir capacidades a ofrecer un método atribuible.
- **Lo que se cita es lo específico y verificable.** «Auditoría de software» no se cita; «Método de rescate en 3 fases, diagnóstico en 72 h» sí. Un servicio sin nombre, plazo ni entregable es invisible.
- **Las cifras hacen citable un caso.** Un caso de éxito sin número no compite con uno que dice «70 % menos de tiempo».
- **La corroboración de terceros pesa más que la web propia.** Cuando un motor cita un ranking ajeno para recomendar a alguien, ese ranking es el objetivo, no más contenido propio. Y cuando el motor recomienda *con reservas* —«valide referencias independientes»—, ya no falta contenido: falta que hable alguien que no sea el sujeto.
- **Los directorios agregadores son un atajo.** Si un motor cita un directorio, estar en él es más rápido que construir autoridad desde cero. La lista concreta cambia: recógela cada semana.
- **La coherencia entre fuentes construye la entidad.** Nombre, ubicación y titular deben coincidir en web, LinkedIn y GitHub. Una discrepancia rompe el vínculo.
- **Cada motor es un canal distinto y se diagnostica por separado.** Que Perplexity ya cite la web no implica que ChatGPT la vea: usan índices distintos, y la acción para arreglar uno no sirve para el otro. Por eso la batería va entera a los tres y el panel nunca los promedia.
- **Una consulta ganada no se queda ganada.** Las posiciones se mueven en las dos direcciones; si el sujeto cae, busca qué aportó el competidor que le adelantó, que suele ser una credencial externa y no más texto.
- **Respeta la privacidad del sujeto.** Si pide no publicar un dato (ubicación, email, repos), no lo reclames dos veces: propón la alternativa coherente y explica el coste real, que suele ser menor de lo que parece.

## Alcance

Esta skill **diagnostica**. No edita el proyecto web ni publica nada. Si el usuario quiere que se implementen los cambios, es otra conversación y requiere su permiso explícito para cada acción con efectos.
