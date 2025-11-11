#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
xml2altimetria.py

Genera altimetria.svg a partir de circuitoEsquema.xml (namespace http://www.uniovi.es).
Requisitos: usar xml.etree.ElementTree y expresiones XPath (con mapping de namespaces).

Uso:
    python xml2altimetria.py circuitoEsquema.xml altimetria.svg

Salida:
    - altimetria.svg
"""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path
import math

# Namespace mapping (obligatorio para usar XPath con prefijo 'ns')
NS = {'ns': 'http://www.uniovi.es'}

# Parámetros de dibujo SVG (ajustables)
SVG_WIDTH = 1200
SVG_HEIGHT = 400
MARGIN_LEFT = 80
MARGIN_RIGHT = 30
MARGIN_TOP = 20
MARGIN_BOTTOM = 60

# Helpers --------------------------------------------------------------------
def text_of(elem, xpath):
    """Devuelve texto del primer nodo que coincida con xpath relativo (usando NS) o None."""
    node = elem.find(xpath, namespaces=NS)
    return node.text.strip() if node is not None and node.text is not None else None

def float_of(text, default=0.0):
    """Convierte texto a float ignorando comas y espacios; devuelve default si falla."""
    if text is None:
        return default
    t = str(text).strip().replace(',', '.')
    try:
        return float(t)
    except Exception:
        return default

# Extracción de datos -------------------------------------------------------
def extract_distances_and_altitudes(root):
    """
    Extrae:
      - altitud del punto origen (punto_origen/altitud_coor)
      - para cada tramo: distancia (elemento distancia) y altitud final (coordenada_final/altitud_coor_final)
    Devuelve listas: distances_m (por tramo) y altitudes_m (punto origen + alt final de cada tramo)
    """
    distances = []
    altitudes = []

    # Punto origen
    po = root.find('.//ns:punto_origen', namespaces=NS)
    if po is not None:
        alt_origen = float_of(text_of(po, 'ns:altitud_coor'), default=None)
        if alt_origen is not None:
            altitudes.append(alt_origen)
    else:
        # si no hay punto origen, arrancar altitud 0
        altitudes.append(0.0)

    # Tramos: recoger distancia y altitud final de cada tramo
    tramo_nodes = root.findall('.//ns:tramos/ns:tramo', namespaces=NS)
    for t in tramo_nodes:
        # distancia: puede ser texto del elemento (ej. 191) y unidad en atributo (ignoramos unidad si es 'm')
        distancia_text = text_of(t, 'ns:distancia')
        distancia = float_of(distancia_text, default=0.0)

        # altitud final
        cf = t.find('ns:coordenada_final', namespaces=NS)
        altf = None
        if cf is not None:
            altf = float_of(text_of(cf, 'ns:altitud_coor_final'), default=None)

        # sólo añadimos tramo si distancia > 0 and altitud válida
        distances.append(distancia)
        altitudes.append(altf if altf is not None else (altitudes[-1] if altitudes else 0.0))

    # Normalizamos altitudes (si alguna None): se cubrieron antes con fallback
    altitudes = [0.0 if a is None else float(a) for a in altitudes]
    return distances, altitudes

# SVG utilities --------------------------------------------------------------
def map_x(dist, total_dist):
    """Mapea distancia (m) -> coordenada X en píxeles dentro del área dibujable."""
    usable_w = SVG_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
    if total_dist <= 0:
        return MARGIN_LEFT
    return MARGIN_LEFT + (dist / total_dist) * usable_w

def map_y(alt, min_alt, max_alt):
    """Mapea altitud -> coordenada Y (inversa: alt mayor -> Y pequeño)."""
    usable_h = SVG_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
    if max_alt == min_alt:
        return MARGIN_TOP + usable_h / 2
    # invertido: alt=max -> MARGIN_TOP, alt=min -> SVG_HEIGHT - MARGIN_BOTTOM
    return MARGIN_TOP + (1 - (alt - min_alt) / (max_alt - min_alt)) * usable_h

def nice_round(x):
    """Redondeo 'agradable' para ticks (por simplicidad)."""
    if x <= 0:
        return 1
    exponent = math.floor(math.log10(x))
    base = 10 ** exponent
    for mul in [1, 2, 5]:
        if x <= mul * base:
            return mul * base
    return 10 * base

# Generación SVG -------------------------------------------------------------
def generate_svg(distances, altitudes, output_path):
    # calcular distancias acumuladas
    cum = [0.0]
    for d in distances:
        cum.append(cum[-1] + float(d))
    # cum[0] = 0 -> corresponde a altitudes[0] (punto origen)
    total_dist = cum[-1]

    # min/max alt
    min_alt = min(altitudes)
    max_alt = max(altitudes)
    if min_alt == max_alt:
        # dar un margen pequeño
        min_alt -= 5
        max_alt += 5

    # generar puntos para polyline: cada punto corresponde a (cum[i], altitudes[i])
    points = []
    for i, a in enumerate(altitudes):
        x = map_x(cum[i], total_dist)
        y = map_y(a, min_alt, max_alt)
        points.append((x, y))

    # crear string de puntos para polyline
    poly_points = ' '.join(f'{x:.2f},{y:.2f}' for x, y in points)

    # cerrar la polilínea hacia baseline para rellenar (suelto)
    baseline_y = map_y(min_alt, min_alt, max_alt)
    # polygon points (close to bottom to create filled area)
    polygon_points = poly_points + f' {SVG_WIDTH - MARGIN_RIGHT:.2f},{baseline_y:.2f} {MARGIN_LEFT:.2f},{baseline_y:.2f}'

    # empezar SVG
    lines = []
    lines.append(f'<?xml version="1.0" encoding="UTF-8"?>')
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{SVG_WIDTH}" height="{SVG_HEIGHT}" viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}">')
    lines.append('<style>')
    lines.append('  .axis { stroke:#000; stroke-width:1 }')
    lines.append('  .grid { stroke:#ccc; stroke-width:0.8 }')
    lines.append('  .profile { fill: rgba(30,144,255,0.25); stroke:#1e90ff; stroke-width:2 }')
    lines.append('  .tick { stroke:#000; stroke-width:1 }')
    lines.append('  .label { font-family: Arial, Helvetica, sans-serif; font-size:12px; fill:#000 }')
    lines.append('</style>')

    # Background
    lines.append(f'<rect x="0" y="0" width="{SVG_WIDTH}" height="{SVG_HEIGHT}" fill="#ffffff"/>')

    # Draw axes
    # X axis line
    x0 = MARGIN_LEFT
    x1 = SVG_WIDTH - MARGIN_RIGHT
    y_axis = SVG_HEIGHT - MARGIN_BOTTOM
    lines.append(f'<line class="axis" x1="{x0}" y1="{y_axis}" x2="{x1}" y2="{y_axis}" />')
    # Y axis
    lines.append(f'<line class="axis" x1="{MARGIN_LEFT}" y1="{MARGIN_TOP}" x2="{MARGIN_LEFT}" y2="{y_axis}" />')

    # Grid and ticks: X ticks
    # calcular ticks X (cada tick agradable que cubra entre 6 y 12 ticks)
    approx_ticks = 8
    if total_dist <= 0:
        x_ticks = [0.0]
    else:
        raw_step = total_dist / approx_ticks
        step = nice_round(raw_step)
        x_ticks = [i * step for i in range(0, int(math.floor(total_dist / step)) + 1)]
        if x_ticks[-1] < total_dist:
            x_ticks.append(total_dist)

    for xt in x_ticks:
        xpix = map_x(xt, total_dist)
        # small tick
        lines.append(f'<line class="tick" x1="{xpix}" y1="{y_axis}" x2="{xpix}" y2="{y_axis+6}" />')
        # grid line
        lines.append(f'<line class="grid" x1="{xpix}" y1="{MARGIN_TOP}" x2="{xpix}" y2="{y_axis}" />')
        # label (dist in meters or km >1000)
        label = f'{int(xt)} m' if xt < 1000 else f'{xt/1000:.1f} km'
        lines.append(f'<text class="label" x="{xpix}" y="{y_axis+22}" text-anchor="middle">{label}</text>')

    # Y ticks: 6 ticks
    y_ticks_count = 6
    y_step_raw = (max_alt - min_alt) / (y_ticks_count - 1)
    y_step = nice_round(y_step_raw)
    # build from nearest multiple
    y_start = math.floor(min_alt / y_step) * y_step
    y_ticks = []
    v = y_start
    while v <= max_alt + 0.0001:
        y_ticks.append(v)
        v += y_step
    # Draw y ticks and labels
    for yt in y_ticks:
        ypix = map_y(yt, min_alt, max_alt)
        lines.append(f'<line class="tick" x1="{MARGIN_LEFT-6}" y1="{ypix}" x2="{MARGIN_LEFT}" y2="{ypix}" />')
        lines.append(f'<line class="grid" x1="{MARGIN_LEFT}" y1="{ypix}" x2="{SVG_WIDTH - MARGIN_RIGHT}" y2="{ypix}" />')
        lines.append(f'<text class="label" x="{MARGIN_LEFT-10}" y="{ypix+4}" text-anchor="end">{int(yt)} m</text>')

    # Draw polyline filled as polygon for profile
    lines.append(f'<polygon class="profile" points="{polygon_points}" />')

    # Draw the top line (stroke) over the filled polygon
    lines.append(f'<polyline fill="none" stroke="#1e90ff" stroke-width="2" points="{poly_points}" />')

    # Add labels: Title and axis labels
    lines.append(f'<text class="label" x="{SVG_WIDTH/2}" y="{MARGIN_TOP + 12}" text-anchor="middle" font-size="16">Perfil altimétrico del circuito</text>')
    lines.append(f'<text class="label" x="{SVG_WIDTH/2}" y="{SVG_HEIGHT - 10}" text-anchor="middle">Distancia</text>')
    # vertical label for altitude (rotated)
    lines.append(f'<g transform="translate(18,{SVG_HEIGHT/2}) rotate(-90)">')
    lines.append(f'  <text class="label" x="0" y="0" text-anchor="middle">Altitud (m)</text>')
    lines.append(f'</g>')

    # Add small markers for points (optional) and labels for origin & last
    # origin label
    if len(points) >= 1:
        ox, oy = points[0]
        lines.append(f'<circle cx="{ox:.2f}" cy="{oy:.2f}" r="3" fill="#ff0000" />')
        lines.append(f'<text class="label" x="{ox+6:.2f}" y="{oy-6:.2f}" font-size="12">Origen</text>')
    if len(points) >= 2:
        lx, ly = points[-1]
        lines.append(f'<circle cx="{lx:.2f}" cy="{ly:.2f}" r="3" fill="#006400" />')
        lines.append(f'<text class="label" x="{lx-6:.2f}" y="{ly-6:.2f}" font-size="12" text-anchor="end">Fin</text>')

    # Close SVG
    lines.append('</svg>')

    # Escribir fichero
    svg_content = '\n'.join(lines)
    Path(output_path).write_text(svg_content, encoding='utf-8')
    return True

# Main -----------------------------------------------------------------------
def main(argv):
    if len(argv) < 3:
        print("Uso: python xml2altimetria.py <entrada_xml> <salida_svg>")
        sys.exit(1)

    input_xml = Path(argv[1])
    output_svg = Path(argv[2])

    if not input_xml.exists():
        print("Error: archivo de entrada no encontrado:", input_xml)
        sys.exit(2)

    # Parsear, usando ElementTree (XML con namespace por defecto)
    try:
        tree = ET.parse(str(input_xml))
        root = tree.getroot()
    except ET.ParseError as e:
        print("Error al parsear XML:", e)
        sys.exit(3)

    # Extraer datos (usando XPath con namespace 'ns')
    distances, altitudes = extract_distances_and_altitudes(root)

    if not distances:
        print("ADVERTENCIA: no se encontraron tramos o distancias en el XML. Se intentará dibujar con lo disponible.")

    # Generar SVG
    ok = generate_svg(distances, altitudes, output_svg)
    if ok:
        print(f"SVG generado: {output_svg}")
    else:
        print("Fallo al generar SVG.")
        sys.exit(4)

if __name__ == '__main__':
    main(sys.argv)
