# Construir la batería de consultas

## Principio

Redacta cada consulta **como la escribiría un cliente buscando proveedor**, no como la escribiría el sujeto describiéndose. Es la diferencia entre medir demanda real y medir el eco del propio marketing.

Compara:

- Flojo: «¿Es Ana García una buena desarrolladora de PWAs?» — pregunta cerrada, nadie la escribe, y el motor solo puede confirmar o negar.
- Bueno: «Necesito un programador en España experto en Moodle 4.5 para desarrollar plugins PHP adaptados a los requisitos del SEPE y FUNDAE. ¿A quién me recomiendas?» — así se busca proveedor: con el problema, la restricción normativa y la petición explícita de nombres.

Las buenas consultas tienen tres rasgos: **contexto concreto** (versión, norma, país), **intención de contratar**, y **petición de recomendación**. Una consulta genérica devuelve una lección de teoría; una específica devuelve nombres, y los nombres son lo que se mide.

## Estructura: 15 × 3

**15 consultas en 5 bloques de 3, lanzadas íntegras en los tres motores.** 45 ejecuciones por medición.

El reparto importa. Antes esta skill lanzaba 20 consultas en Perplexity y solo un par de contrastes sueltos en ChatGPT y Gemini, porque Perplexity es el único que se automatiza por URL y los otros dos obligan a escribir. El problema es que con una sola consulta por motor no se puede decir nada: «0 de 1» no es una medición, es una anécdota. Y son canales distintos, con índices distintos, que se arreglan con acciones distintas — precisamente lo que hay que poder distinguir.

Con 15 en cada uno, los tres denominadores son iguales y las series se comparan entre sí y consigo mismas.

**Bloque A · Entidad (3 consultas).** Miden si el motor sabe quién es el sujeto. Son las que detectan colisiones con homónimos.

Plantillas, sustituyendo lo que va entre corchetes:

1. `¿Quién es [Nombre completo] ([Alias]) y cuál es su trayectoria profesional?`
2. `¿Qué perfil tiene [el/la] [profesión principal] [Nombre] en [país]?`
3. `¿Qué [productos / servicios / proyectos] ha desarrollado [Alias] utilizando [tecnología distintiva]?`

Evita la variante `¿combina [capacidad A] con [capacidad B]?`. Parece útil para perfiles híbridos, pero es una pregunta cerrada: si el motor conoce al sujeto contesta que sí casi siempre, y si no lo conoce contesta que no sabe. Discrimina poco y se solapa con las dos primeras.

**Bloques B a E · Un nicho por bloque, 3 consultas cada uno.** Dentro de cada bloque, cubre tres ángulos distintos para no medir tres veces lo mismo:

- **Encargo directo**: «Necesito [rol] para [tarea concreta con restricción]. ¿A quién me recomiendas?»
- **Búsqueda de perfil**: «Busco un especialista en [X] que además [Y]» — el cruce poco común, donde suele haber hueco.
- **Prueba de solvencia**: «¿Qué [profesionales/empresas] tienen casos de éxito reales en [X]?» — la que más claramente expone qué evidencia exige el motor.

El cuarto ángulo clásico, *existencia de categoría* («¿Hay profesionales en [país] que…?»), sale del reparto estándar: suele devolver una lección de taxonomía en lugar de nombres. Consérvalo solo si el nicho es tan nuevo que aún no está claro que el motor lo reconozca como categoría.

## Qué consultas descartar

Una batería de 15 solo funciona si las 15 pueden mover algo. Descarta:

- **Las redundantes.** Dos consultas del mismo bloque que devuelven semana tras semana la misma lista de competidores están midiendo lo mismo. Quédate con la que dé respuestas más concretas.
- **Las estructuralmente inalcanzables.** Si la consulta la gana siempre quien tiene una credencial que el sujeto no puede obtener —partner certificado de un fabricante, una ISO vigente, un colegio profesional—, medirla cada semana no informa: el resultado ya se sabe. Sustitúyela por otra del mismo nicho donde sí haya recorrido, y anota la barrera en el plan de acción.
- **Las que no corresponden a nada que el sujeto venda.** Es fácil colar en la batería el nicho que gustaría tener en lugar del que se tiene. Si no hay página, producto ni caso detrás, la consulta solo genera ceros.

## Calibración

- **Idioma y mercado del cliente.** Si el sujeto vende en España, las consultas van en español y dicen «en España». Los motores dan respuestas muy distintas según el idioma.
- **Incluye competidores como control.** Si tras varias semanas ningún nombre aparece en un bloque, probablemente la consulta está mal calibrada, no es que el mercado esté vacío. Si aparecen competidores y el sujeto no, el diagnóstico es sólido.
- **Mezcla dificultad.** Alguna consulta debe ser ganable pronto (nicho muy específico, poca competencia) y alguna debe ser difícil (categoría con empresas grandes posicionadas). Una batería toda difícil no mide progreso; toda fácil no mide nada.
- **Ancla las consultas de producto al nombre del producto y a su categoría**, no solo al nombre. Nadie busca «Voltio»: buscan «PWA de entrenamiento de fuerza con IA».
- **Deja al menos un nicho vacío en la batería** si lo detectas: una consulta donde el motor admite que no conoce a nadie es la victoria más barata que existe y conviene vigilar cuándo se ocupa, sea por el sujeto o por un competidor.

## Congelar la batería

Una vez validada en la línea base, **guárdala literalmente en `estado.json` y no la toques**. La comparabilidad semana a semana es todo el valor del seguimiento; un cambio de redacción invalida la serie.

Si con el tiempo hace falta añadir o cambiar consultas —cambio de posicionamiento, nicho nuevo—, hazlo como un **bloque F adicional** con su propia fecha de inicio, y déjalo fuera del cómputo histórico principal para no romper la serie. Anótalo en el panel.

## Migrar una batería antigua

Si el sujeto viene de un reparto anterior (20 + 2 contrastes, u otro), la migración se hace una vez, en una fecha concreta, y se documenta:

1. **Elige las 15 que se quedan** con los criterios de «Qué consultas descartar». Guarda las descartadas en `estado.json` con su motivo: si más adelante se recupera alguna, hay que saber por qué salió.
2. **No mezcles nunca los agregados.** «7 de 22» y «x de 45» no van en la misma frase ni en la misma serie.
3. **La serie del motor principal se conserva** si sus consultas eran ya un superconjunto de las 15: es el mismo motor y casi las mismas preguntas, y la tasa sigue siendo comparable con una nota al pie.
4. **Los motores que pasan de 1 consulta a 15 empiezan serie nueva.** No es ampliar la muestra, es crear una. Márcalo en el gráfico y dilo en «Cambios desde la semana anterior» la primera semana.
