#!/usr/bin/env python3
"""Extrae de estado.json lo que hace falta para el informe general acumulado.

Uso:
    python informe_general.py ruta/estado.json
    python informe_general.py ruta/estado.json --json    # salida cruda

Devuelve cuatro cosas, que corresponden a las cuatro secciones del informe:
  1. Series temporales de visibilidad y puntuacion tecnica.
  2. Vida de cada accion recomendada: cuando aparecio, cuando se implemento,
     y que paso en la medicion siguiente.
  3. Consultas bloqueadas: ausentes durante 3 o mas mediciones seguidas.
  4. Movimientos: consultas que cambiaron de estado, en que semana.

No interpreta. La interpretacion la hace quien escribe el informe, que es
donde esta el valor: este script solo evita leer el JSON a mano.
"""

import json
import sys
from collections import defaultdict

ORDEN = {"ausente": 0, "citado": 1, "recomendado": 2}


def cargar(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def series(est):
    out = []
    for m in est.get("mediciones", []):
        geo = m.get("geo", {}) or {}
        seo = m.get("seo", {}) or {}
        total = geo.get("total") or 0
        out.append({
            "fecha": m.get("fecha"),
            "etiqueta": m.get("etiqueta") or m.get("fecha"),
            "apariciones": geo.get("apariciones", 0),
            "citas": geo.get("citas", 0),
            "total": total,
            "pct_apariciones": round(geo.get("apariciones", 0) * 100 / total) if total else 0,
            "pct_citas": round(geo.get("citas", 0) * 100 / total) if total else 0,
            "seo": seo.get("puntuacion"),
            "urls": m.get("urls_indexables"),
        })
    return out


def vida_acciones(est):
    """Para cada accion: cuando se recomendo, cuando se implemento, y el delta
    de visibilidad de la medicion siguiente a la implementacion."""
    ms = est.get("mediciones", [])
    recomendada_en, implementada_en, textos, esfuerzos = {}, {}, {}, {}
    for i, m in enumerate(ms):
        for a in m.get("acciones_recomendadas", []) or []:
            aid = a.get("id")
            if not aid:
                continue
            recomendada_en.setdefault(aid, i)
            textos[aid] = a.get("texto", aid)
            esfuerzos[aid] = a.get("esfuerzo")
        for aid in m.get("acciones_implementadas", []) or []:
            implementada_en.setdefault(aid, i)

    filas = []
    for aid in sorted(set(recomendada_en) | set(implementada_en)):
        ri = recomendada_en.get(aid)
        ii = implementada_en.get(aid)
        delta_ap = delta_seo = None
        if ii is not None and ii + 1 < len(ms):
            g0 = (ms[ii].get("geo") or {}).get("apariciones", 0)
            g1 = (ms[ii + 1].get("geo") or {}).get("apariciones", 0)
            delta_ap = g1 - g0
            s0 = (ms[ii].get("seo") or {}).get("puntuacion")
            s1 = (ms[ii + 1].get("seo") or {}).get("puntuacion")
            if s0 is not None and s1 is not None:
                delta_seo = s1 - s0
        filas.append({
            "id": aid,
            "texto": textos.get(aid, aid),
            "esfuerzo": esfuerzos.get(aid),
            "recomendada": ms[ri].get("etiqueta") if ri is not None else None,
            "implementada": ms[ii].get("etiqueta") if ii is not None else None,
            "semanas_pendiente": (len(ms) - 1 - ri) if (ri is not None and ii is None) else None,
            "delta_apariciones_siguiente": delta_ap,
            "delta_seo_siguiente": delta_seo,
        })
    return filas


def por_consulta(est):
    hist = defaultdict(list)
    for m in est.get("mediciones", []):
        for r in m.get("resultados", []) or []:
            hist[r.get("id")].append((m.get("etiqueta") or m.get("fecha"), r.get("estado", "ausente")))
    return hist


def bloqueadas(hist, minimo=3):
    out = []
    for qid, serie in hist.items():
        cola = [e for _, e in serie][-minimo:]
        if len(cola) >= minimo and all(e == "ausente" for e in cola):
            out.append({"id": qid, "mediciones_ausente": len([e for _, e in serie if e == "ausente"]),
                        "serie": [e for _, e in serie]})
    return sorted(out, key=lambda x: -x["mediciones_ausente"])


def movimientos(hist):
    out = []
    for qid, serie in hist.items():
        for (f0, e0), (f1, e1) in zip(serie, serie[1:]):
            if e0 != e1:
                out.append({"id": qid, "de": e0, "a": e1, "semana": f1,
                            "sentido": "mejora" if ORDEN.get(e1, 0) > ORDEN.get(e0, 0) else "retroceso"})
    return out


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    est = cargar(sys.argv[1])
    hist = por_consulta(est)
    datos = {
        "sujeto": est.get("sujeto", {}).get("nombre"),
        "mediciones": len(est.get("mediciones", [])),
        "series": series(est),
        "acciones": vida_acciones(est),
        "bloqueadas": bloqueadas(hist),
        "movimientos": movimientos(hist),
    }

    if "--json" in sys.argv:
        print(json.dumps(datos, indent=2, ensure_ascii=False))
        return

    s = datos["series"]
    print(f"# {datos['sujeto']} — {datos['mediciones']} mediciones\n")
    if s:
        a, b = s[0], s[-1]
        print("## 1 · Tendencia")
        print(f"  Apariciones      {a['apariciones']}/{a['total']} -> {b['apariciones']}/{b['total']}"
              f"   ({a['pct_apariciones']}% -> {b['pct_apariciones']}%)")
        print(f"  Citas            {a['citas']}/{a['total']} -> {b['citas']}/{b['total']}")
        print(f"  SEO tecnico      {a['seo']} -> {b['seo']}")
        print(f"  URLs indexables  {a['urls']} -> {b['urls']}\n")
        print("  serie:", " | ".join(f"{x['etiqueta']}: {x['apariciones']}/{x['total']} · seo {x['seo']}" for x in s), "\n")

    print("## 2 · Acciones")
    for a in datos["acciones"]:
        est_txt = f"implementada {a['implementada']}" if a["implementada"] else f"PENDIENTE ({a['semanas_pendiente']} sem.)"
        d = ""
        if a["delta_apariciones_siguiente"] is not None:
            d = f"  -> semana siguiente: apariciones {a['delta_apariciones_siguiente']:+d}"
            if a["delta_seo_siguiente"] is not None:
                d += f", seo {a['delta_seo_siguiente']:+d}"
        print(f"  [{est_txt}] {a['texto']}{d}")
    print()

    print("## 3 · Bloqueadas (3+ mediciones ausente)")
    if not datos["bloqueadas"]:
        print("  ninguna")
    for b in datos["bloqueadas"]:
        print(f"  {b['id']}: {' > '.join(b['serie'])}")
    print()

    print("## 4 · Movimientos")
    if not datos["movimientos"]:
        print("  ninguno")
    for m in datos["movimientos"]:
        flecha = "^" if m["sentido"] == "mejora" else "v"
        print(f"  {flecha} {m['id']}: {m['de']} -> {m['a']} ({m['semana']})")

    print("\nRecuerda: con varias acciones en paralelo no se pueden aislar causas.")
    print("Usa 'coincidio con' salvo que la relacion sea inequivoca.")


if __name__ == "__main__":
    main()
