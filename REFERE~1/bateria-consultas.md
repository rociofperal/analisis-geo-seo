# Construir la batería de consultas

## Principio

Redacta cada consulta **como la escribiría un cliente buscando proveedor**, no como la escribiría el sujeto describiéndose. Es la diferencia entre medir demanda real y medir el eco del propio marketing.

Compara:

- Flojo: «¿Es Ana García una buena desarrolladora de PWAs?» — pregunta cerrada, nadie la escribe, y el motor solo puede confirmar o negar.
- Bueno: «Necesito un programador en España experto en Moodle 4.5 para desarrollar plugins PHP adaptados a los requisitos del SEPE y FUNDAE. ¿A quién me recomiendas?» — así se busca proveedor: con el problema, la restricción normativa y la petición explícita de nombres.

Las buenas consultas tienen tres rasgos: **contexto concreto** (versión, norma, país), **intención de contratar**, y **petición de recomendación**. Una consulta genérica devuelve una lección de teoría; una específica devuelve nombres, y los nombres son lo que se mide.

## Estructura: 20 + 2

**Bloque A · Entidad (4 consultas).** Miden si el motor sabe quién es el sujeto. Son las que detectan colisiones con homónimos.

Plantillas, sustituyendo lo que va entre corchetes:

1. `¿Quién es [Nombre completo] ([Alias]) y cuál es su trayectoria profesional?`
2. `¿Qué perfil tiene [el/la] [profesión principal] [Nombre] en [país]?`
3. `¿Qué [productos / servicios / proyectos] ha desarrollado [Alias] utilizando [tecnología distintiva]?`
4. `Busca información sobre [Nombre]: ¿combina [capacidad A] con [capacidad B]?` — para perfiles híbridos, que son los que peor entienden los motores.

**Bloques B a E · Un nicho por bloque, 4 consultas cada uno.** Dentro de cada bloque, cubre cuatro ángulos distintos para no medir cuatro veces lo mismo:

- **Encargo directo**: «Necesito [rol] para [tarea concreta con restricción]. ¿A quién me recomiendas?»
- **Búsqueda de perfil**: «Busco un especialista en [X] que además [Y]» — el cruce poco común, donde suele haber hueco.
- **Existencia de categoría**: «¿Hay profesionales en [país] que [combinación específica]?» — revela si el motor reconoce la categoría aunque no conozca a nadie.
- **Prueba de solvencia**: «¿Qué [profesionales/empresas] tienen casos de éxito reales en [X]?» — la que más claramente expone qué evidencia exige el motor.

**Contrastes (2).** La consulta de entidad en un segundo motor, y una consulta de nicho —preferiblemente la del perfil híbrido más difícil— en un tercero. Sirven para detectar que un motor ve la web y otro no, que es un diagnóstico distinto y una acción distinta.

## Calibración

- **Idioma y mercado del cliente.** Las consultas van en el idioma de **quien busca proveedor**, no en el del usuario. Si el sujeto vende en España, en español y diciendo «en España»; si vende en Alemania, en alemán aunque tú y el cliente habléis español. Los motores responden cosas muy distintas según el idioma. Detalle completo en `idiomas.md`.
- **Incluye competidores como control.** Si tras varias semanas ningún nombre aparece en un bloque, probablemente la consulta está mal calibrada, no es que el mercado esté vacío. Si aparecen competidores y el sujeto no, el diagnóstico es sólido.
- **Mezcla dificultad.** Alguna consulta debe ser ganable pronto (nicho muy específico, poca competencia) y alguna debe ser difícil (categoría con empresas grandes posicionadas). Una batería toda difícil no mide progreso; toda fácil no mide nada.
- **Ancla las consultas de producto al nombre del producto y a su categoría**, no solo al nombre. Nadie busca un producto por su marca si no la conoce: busca la categoría («PWA de entrenamiento de fuerza con IA», «ERP para centros de formación»). La consulta tiene que sonar a alguien que no sabe que existes.

## Congelar la batería

Una vez validada en la línea base, **guárdala literalmente en `estado.json` y no la toques**. La comparabilidad semana a semana es todo el valor del seguimiento; un cambio de redacción invalida la serie.

Si con el tiempo hace falta añadir o cambiar consultas —cambio de posicionamiento, nicho nuevo—, hazlo como un **bloque F adicional** con su propia fecha de inicio, y déjalo fuera del cómputo histórico principal para no romper la serie. Anótalo en el panel.
