# Informe general acumulado

Se pide explícitamente («cómo vamos desde que empezamos», «dame el informe general», «prepárame algo para el cliente»). Se construye leyendo **todo** `estado.json`, no la última medición.

Ejecuta primero `scripts/informe_general.py <ruta-estado.json>`: devuelve las series temporales, la vida de cada acción recomendada y las consultas que llevan más semanas bloqueadas. Así no hay que leer el JSON a mano.

## Estructura

Cuatro secciones, en este orden, porque es el orden en que le importan a quien decide.

### 1 · ¿Vamos mejor?

Tendencia desde el inicio con cifras: apariciones, citas y puntuación técnica en la primera medición y en la última, con el gráfico. Una frase de veredicto al principio, sin rodeos.

Distingue las dos series. Que las citas crezcan antes que las apariciones es el patrón normal y es buena señal: significa que la web ya entra en el conjunto de fuentes y falta que el contenido sea atribuible. Explicarlo evita que el usuario lea «solo 2 apariciones» como un fracaso cuando en realidad es progreso.

### 2 · ¿Qué hicimos y qué funcionó?

Tabla: acción implementada | semana | qué pasó después.

Aquí está el valor del histórico, y también su mayor riesgo. Con una medición semanal y varias acciones en paralelo **no se puede aislar causas**. Escribe «coincidió con» cuando no puedas atribuir, y reserva «causó» para los casos donde la relación sea inequívoca — por ejemplo, cuando una consulta pasa de ausente a recomendada citando literalmente la página que se publicó esa semana.

Esa honestidad es lo que hace el informe defendible ante un cliente. Un informe que se atribuye todo pierde credibilidad en la primera pregunta incómoda.

Marca aparte las acciones de **coste bajo y efecto alto**: son el argumento para seguir.

### 3 · ¿Qué sigue bloqueado y por qué?

Consultas ausentes durante tres o más mediciones, agrupadas por bloque, con la hipótesis de por qué.

Si algo lleva un mes sin moverse, el diagnóstico anterior era incompleto. Dilo y revísalo en lugar de repetir la misma recomendación una cuarta vez. Las causas habituales: la consulta está mal calibrada y no la escribiría ningún cliente real; la evidencia que pide el motor es de un tipo que no se ha producido (código público, cita de terceros, cifras); o la categoría está ocupada por actores cuya autoridad no se alcanza en meses y conviene reenfocar el ángulo en lugar de insistir.

### 4 · ¿Qué toca ahora?

Plan priorizado por impacto/esfuerzo, con la evidencia que respalda cada punto: la frase del motor, o la comparación con el competidor que sí aparece. Máximo 8 puntos: una lista más larga no se ejecuta.

## Formato

Markdown por defecto. Si el usuario lo quiere para un cliente o para presentar, pregunta si prefiere `.docx` o `.pdf` y usa la skill correspondiente. En ese caso añade al principio un resumen ejecutivo de media página, que es lo único que va a leer quien decide, y quita la jerga: «visibilidad en motores generativos» en lugar de «GEO», «datos estructurados» en lugar de «JSON-LD».
