# Esquema de `estado.json`

Es la fuente de verdad. El panel y el informe general se derivan de aquí, nunca al contrario. **Solo se añade; no se sobreescriben mediciones anteriores.**

```json
{
  "sujeto": {
    "slug": "nombre-sujeto",
    "nombre": "Nombre Apellido Apellido",
    "alias": ["N. Apellido", "Nombre Apellido"],
    "web": "https://www.ejemplo.com",
    "pais": "España",
    "nichos": ["EdTech y Moodle", "IA y automatización", "PWAs de salud", "Negocio y consultoría"],
    "colisiones": ["Homónima con más presencia indexada en otro sector (periodismo)"],
    "perfiles": {
      "linkedin": "linkedin.com/in/usuario",
      "github": "github.com/usuario"
    }
  },

  "bateria": [
    { "id": "A1", "bloque": "A · Entidad", "texto": "¿Quién es …?", "motor": "perplexity" }
  ],

  "mediciones": [
    {
      "fecha": "2026-08-03",
      "etiqueta": "3 ago",

      "geo": { "apariciones": 5, "citas": 6, "total": 22 },
      "seo": { "puntuacion": 86, "desglose": { "robots": 7, "sitemap": 7 } },
      "urls_indexables": 6,

      "auditoria": {
        "resuelto": ["Arquitectura de páginas", "Enlazado interno"],
        "pendiente": ["Hub de contenidos", "Páginas por proyecto"],
        "rendimiento": { "ttfb_ms": 60, "load_ms": 826, "kb": 433, "protocolo": "h2" }
      },

      "huella": {
        "linkedin": { "estado": "parcial", "nota": "nombre visible sin segundo apellido" },
        "github":   { "estado": "vacio",   "nota": "1 repo, 3 contribuciones" }
      },

      "resultados": [
        {
          "id": "B1",
          "estado": "recomendado",
          "posicion": 1,
          "correcta": true,
          "cita_web": true,
          "competidores": ["Competidor A", "Competidor B", "Competidor C"],
          "cita_literal": "1) Nombre Apellido (desarrolladora full-stack / EdTech)…",
          "frases_evidencia": ["Ideal si buscas una persona técnica de referencia (no solo una empresa)"],
          "fuentes_n": null
        }
      ],

      "acciones_recomendadas": [
        { "id": "acc-linkedin-nombre", "prioridad": 1, "texto": "Corregir el nombre visible de LinkedIn", "esfuerzo": "bajo" }
      ],

      "acciones_implementadas": ["acc-json-ld-person", "acc-arquitectura-paginas"],

      "notas": "Ejecución programada; contrastes lanzados con sesión disponible."
    }
  ]
}
```

## Reglas

**`estado` de cada resultado** solo puede ser `recomendado`, `citado` o `ausente`. Mantener `citado` separado de `recomendado` es lo que permite ver que la autoridad ya existe y lo que falta es atribuibilidad.

**`apariciones`** cuenta solo los `recomendado`. **`citas`** cuenta `recomendado` + `citado`. Registrar las dos series por separado hace visible el progreso intermedio: la semana en que la web empieza a ser citada sin que aún la recomienden es una señal real de avance, y con una sola cifra se perdería.

**`acciones_recomendadas`** usa `id` estable entre semanas. Así el informe general puede seguir la vida de cada recomendación: cuándo apareció, cuándo se implementó, y qué pasó después. Sin ids estables no hay forma de decir qué funcionó.

**`acciones_implementadas`** se rellena con lo que el usuario confirme haber hecho, o con lo que la auditoría detecte como resuelto. Es la columna que permite cruzar causa y efecto en el informe general.

**`frases_evidencia`** es acumulativo por diseño. Léelo entero de vez en cuando: sobre varias semanas dibuja el patrón de lo que ese sector exige.

**`notas`** documenta las decisiones tomadas en ejecuciones automáticas, sobre todo cuando algo no se pudo medir. Un hueco explicado es dato; un hueco silencioso parece un cero.
