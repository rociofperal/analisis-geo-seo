# analisis-geo-seo

Skill para Claude que mide y monitoriza la visibilidad de una marca, empresa o persona en los **motores generativos** (Perplexity, ChatGPT, Gemini), audita su web para que esos motores puedan citarla, y repite el análisis cada semana registrando la evolución.

Un buscador clásico devuelve diez enlaces; un motor generativo devuelve **una** respuesta con dos o tres nombres. O estás en esa respuesta o no existes. Esta skill mide si apareces, por qué no apareces, y qué evidencia concreta piden los motores para incluirte.

## Qué hace

**Línea base.** Entrevista breve sobre nichos y alias, auditoría técnica de la web, huella digital externa (LinkedIn, GitHub, menciones de terceros) y una batería de 15 consultas lanzadas íntegras en Perplexity, ChatGPT y Gemini — 45 ejecuciones. Devuelve un panel HTML, la transcripción literal de todas las respuestas y un plan de acción priorizado.

**Seguimiento recurrente.** Programa una ejecución semanal, reutiliza la misma batería congelada —la comparabilidad es todo el valor del seguimiento— y encabeza el panel con «Cambios desde la semana anterior».

**Informe general acumulado.** Cruza qué acciones se implementaron con qué se movió después, señala lo que lleva semanas bloqueado y reordena las prioridades.

## Tres estados, no dos

La clasificación de cada consulta distingue:

| Estado | Significado |
|---|---|
| **Recomendado** | El motor te nombra como respuesta. Se anota la posición frente a los competidores. |
| **Citado pero no nombrado** | Tu web está entre las fuentes y alimenta la respuesta, pero el motor se queda con la categoría genérica. |
| **Ausente** | Ni nombrado ni citado. |
| **No ejecutada** | No se pudo lanzar (sin sesión, cuota agotada, fallo de interfaz). No cuenta como ausencia. |

Ese estado intermedio es el más informativo: significa que la autoridad ya existe y lo que falta es que el contenido sea *atribuible* — un método con nombre, fases y entregable, en lugar de una descripción de capacidades. Con un simple sí/no se perdería justo la palanca que hay que mover.

## Instalación

**Como skill de Claude** (Cowork o Claude Code): clona este repo dentro de tu carpeta de skills.

```bash
git clone https://github.com/<usuario>/analisis-geo-seo.git ~/.claude/skills/analisis-geo-seo
```

O descarga el `.skill` de la sección *Releases* y guárdalo desde la interfaz de Claude.

Después basta con pedirlo en lenguaje natural: «analiza el GEO y SEO de ejemplo.com», «mira si salgo en la IA», «dame el informe general».

## Estructura

```
├── SKILL.md                        # flujo principal: tres modos y seis fases
├── references/
│   ├── auditoria-tecnica.md        # qué medir y la rúbrica de puntuación /100
│   ├── cms.md                      # WordPress, Webflow, Shopify: dónde cambia todo
│   ├── bateria-consultas.md        # cómo construir las 15 consultas (5 bloques x 3)
│   ├── motores.md                  # mecánica de navegador y sus trampas
│   ├── estado-json.md              # esquema del histórico
│   ├── panel.md                    # las nueve secciones del panel
│   └── informe-general.md          # informe acumulado
├── scripts/
│   ├── auditoria.js                # extracción del DOM en seis bloques
│   ├── puntuacion.py               # puntuación técnica sobre 100
│   └── informe_general.py          # series, movimientos y vida de cada acción
└── assets/
    └── plantilla-panel.html        # panel autocontenido (Chart.js por CDN)
```

## Requisitos

- Claude con acceso a un navegador (la extensión Claude in Chrome o equivalente) para lanzar las consultas y auditar el DOM renderizado.
- ChatGPT y Gemini requieren **sesión iniciada** en el navegador: sin ella se pierden 30 de las 45 consultas. Perplexity no la necesita.
- Si la cuenta de ChatGPT es **gratuita**, su búsqueda web tiene tope diario y puede agotarse a mitad de la batería. La skill lo detecta y marca esas consultas como no ejecutadas en lugar de contarlas como ausencias.
- Python 3.8+ para los dos scripts de análisis.

## Alcance

La skill **diagnostica**. No edita el proyecto web ni publica nada en ningún sitio. Implementar los cambios es una decisión aparte.

## Nota sobre la puntuación técnica

Los pesos de la rúbrica son un juicio razonado, no una medición objetiva, y no equivalen a un Lighthouse. Lo que importa es usar **los mismos cada semana**: si se cambian, hay que recalcular todo el histórico o la serie deja de significar nada.

## Licencia

MIT. Ver [LICENSE](LICENSE).
