#!/usr/bin/env python3
"""Calcula la puntuacion tecnica sobre 100 a partir de los hallazgos de la auditoria.

Uso:
    python puntuacion.py hallazgos.json
    python puntuacion.py --plantilla > hallazgos.json     # esqueleto para rellenar

Los pesos son un juicio, no una medicion. Lo que importa es usar los mismos
cada semana: si los cambias, recalcula todo el historico o la serie deja de
significar nada.

Cada criterio se puntua con un valor de 0 a 1 (cumplimiento parcial permitido).
Devuelve el desglose y el total, listo para meter en estado.json.
"""

import json
import sys

PESOS = {
    "robots_ia":        (7,  "robots.txt con directivas nominales para bots de IA"),
    "sitemap":          (7,  "sitemap.xml valido y coherente con las URLs que responden 200"),
    "llms_txt":         (5,  "llms.txt presente y con nota de desambiguacion si hace falta"),
    "jsonld_entidad":   (11, "Person/Organization completo con sameAs e image que resuelve"),
    "faqpage":          (4,  "FAQPage donde haya preguntas frecuentes"),
    "breadcrumbs":      (3,  "BreadcrumbList si hay jerarquia real"),
    "canonical":        (5,  "canonical correcto en todas las paginas"),
    "og_twitter":       (7,  "Open Graph y Twitter Card completos"),
    "title_desc":       (7,  "title y description unicos y en rango por pagina"),
    "un_h1":            (5,  "un solo H1 por pagina"),
    "profundidad":      (9,  "profundidad de contenido suficiente por pagina"),
    "urls_indexables":  (7,  "URLs indexables (objetivo 8)"),
    "hub_contenidos":   (6,  "blog o hub de recursos indexable"),
    "imagenes":         (5,  "imagenes con alt y assets visuales de apoyo"),
    "rendimiento":      (6,  "rendimiento y contenido servido en el HTML (SSR)"),
    "enlazado_interno": (3,  "enlaces internos reales, no anclas"),
    "hreflang":         (3,  "hreflang / i18n"),
}

PLANTILLA = {k: 0.0 for k in PESOS}


def puntuar(h, ignorar=()):
    """h: dict criterio -> cumplimiento 0..1. ignorar: criterios a excluir del total."""
    desglose, obtenido, maximo = {}, 0.0, 0
    for k, (peso, etiqueta) in PESOS.items():
        if k in ignorar:
            continue
        v = float(h.get(k, 0) or 0)
        v = max(0.0, min(1.0, v))
        pts = round(peso * v, 1)
        desglose[k] = {"puntos": pts, "de": peso, "cumplimiento": v, "criterio": etiqueta}
        obtenido += pts
        maximo += peso
    # Si se ignoran criterios, reescala para que el total siga siendo sobre 100
    # y la serie historica siga comparable.
    total = round(obtenido * 100 / maximo, 0) if maximo else 0
    return {
        "puntuacion": int(total),
        "obtenido": round(obtenido, 1),
        "maximo": maximo,
        "desglose": desglose,
        "ignorados": list(ignorar),
    }


def main():
    if "--plantilla" in sys.argv:
        print(json.dumps(PLANTILLA, indent=2, ensure_ascii=False))
        return
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        h = json.load(f)
    ignorar = tuple(h.pop("_ignorar", ()))
    r = puntuar(h, ignorar)
    print(json.dumps(r, indent=2, ensure_ascii=False))
    print(f"\nPuntuacion tecnica: {r['puntuacion']} / 100"
          f"  ({r['obtenido']} de {r['maximo']} puntos evaluados)", file=sys.stderr)
    faltan = sorted(
        ((v["de"] - v["puntos"], k, v["criterio"]) for k, v in r["desglose"].items() if v["puntos"] < v["de"]),
        reverse=True,
    )
    if faltan:
        print("\nDonde se pierden mas puntos:", file=sys.stderr)
        for perdidos, k, crit in faltan[:6]:
            print(f"  -{perdidos:>4.1f}  {k:<18} {crit}", file=sys.stderr)


if __name__ == "__main__":
    main()
