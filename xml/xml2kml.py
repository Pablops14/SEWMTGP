#!/usr/bin/env python3
"""
xml2kml.py

Genera un archivo KML (circuito.kml) a partir de un XML con namespace http://www.uniovi.es
Usa xml.etree.ElementTree y expresiones XPath (con mapping de namespaces).

Uso:
    python xml2kml.py circuitoEsquema.xml circuito.kml

Salida:
    - circuito.kml (archivo KML con LineString y Placemark para punto origen)
"""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {'ns': 'http://www.uniovi.es'}  # prefijo 'ns' para el espacio de nombres usado en el XML

KML_PROLOG = '''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Circuito</name>
  <Style id="trackStyle">
    <LineStyle>
      <width>3</width>
    </LineStyle>
  </Style>
'''

KML_EPILOG = '''
</Document>
</kml>
'''

def find_text(elem, xpath):
    """Helper: find text of first matching element (with NS) or return None"""
    node = elem.find(xpath, namespaces=NS)
    return node.text.strip() if node is not None and node.text is not None else None

def extract_coordinates(tree_root):
    """
    Extrae coordenadas en formato (lon,lat,alt) a partir del XML:
    - Empieza con punto_origen (longitud_coor, latitud_coor, altitud_coor)
    - Añade coordenada_final de cada tramo en el orden que aparezcan
    Devuelve lista de tuples (lon, lat, alt)
    """
    coords = []

    # Punto origen (uno solo)
    po = tree_root.find('.//ns:punto_origen', namespaces=NS)
    if po is not None:
        lon = find_text(po, 'ns:longitud_coor')
        lat = find_text(po, 'ns:latitud_coor')
        alt = find_text(po, 'ns:altitud_coor') or '0'
        try:
            coords.append((float(lon), float(lat), float(alt)))
        except Exception:
            # en caso de datos no convertibles, saltamos el punto origen
            pass

    # Recorremos tramos -> tramo -> coordenada_final
    tramo_nodes = tree_root.findall('.//ns:tramos/ns:tramo', namespaces=NS)
    for t in tramo_nodes:
        cf = t.find('ns:coordenada_final', namespaces=NS)
        if cf is None:
            continue
        lonf = find_text(cf, 'ns:longitud_coor_final')
        latf = find_text(cf, 'ns:latitud_coor_final')
        altf = find_text(cf, 'ns:altitud_coor_final') or '0'
        try:
            coords.append((float(lonf), float(latf), float(altf)))
        except Exception:
            # Ignorar tramos con coordenadas inválidas
            continue

    # Si sólo hay punto origen o menos de 2 puntos, devolver lo que haya
    return coords

def coords_to_kml_linestring(coords):
    """Convierte lista de tuples (lon,lat,alt) a texto para <coordinates> en KML"""
    return '\n'.join(f'      {lon},{lat},{alt}' for lon, lat, alt in coords)

def make_kml_document(coords, origin_name="Punto Origen"):
    """
    Construye el contenido del KML como string:
    - Un Placemark con LineString (track)
    - Un Placemark para punto origen (primer punto) si existe
    """
    kml = [KML_PROLOG]

    if len(coords) >= 1:
        # LineString que une todos los puntos en el orden extraído
        kml.append('  <Placemark>\n    <name>Recorrido circuito</name>\n    <styleUrl>#trackStyle</styleUrl>\n    <LineString>\n      <tessellate>1</tessellate>\n      <coordinates>\n')
        kml.append(coords_to_kml_linestring(coords))
        kml.append('\n      </coordinates>\n    </LineString>\n  </Placemark>\n')

        # Punto origen (primer punto)
        lon, lat, alt = coords[0]
        kml.append(f'''  <Placemark>
    <name>{origin_name}</name>
    <Point>
      <coordinates>{lon},{lat},{alt}</coordinates>
    </Point>
  </Placemark>
''')
    else:
        # Si no hay coordenadas: mensaje en KML (placemark vacío)
        kml.append('  <Placemark>\n    <name>No se encontraron coordenadas</name>\n  </Placemark>\n')

    kml.append(KML_EPILOG)
    return ''.join(kml)

def main(argv):
    if len(argv) < 3:
        print("Uso: python xml2kml.py <entrada_xml> <salida_kml>")
        sys.exit(1)

    input_xml = Path(argv[1])
    output_kml = Path(argv[2])

    if not input_xml.exists():
        print(f"Error: no existe el fichero de entrada {input_xml}")
        sys.exit(2)

    # Parsear XML (tiene namespace por defecto: http://www.uniovi.es)
    try:
        tree = ET.parse(str(input_xml))
        root = tree.getroot()
    except ET.ParseError as e:
        print("Error al parsear XML:", e)
        sys.exit(3)

    coords = extract_coordinates(root)
    if not coords:
        print("ADVERTENCIA: no se encontraron coordenadas válidas en el XML.")

    kml_text = make_kml_document(coords)

    # Escribir KML (UTF-8)
    output_kml.write_text(kml_text, encoding='utf-8')
    print(f"KML generado: {output_kml} (puntos: {len(coords)})")

if __name__ == '__main__':
    main(sys.argv)
