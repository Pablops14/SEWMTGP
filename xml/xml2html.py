import xml.etree.ElementTree as ET
import sys

class Html:
    def __init__(self, archivo_salida):
        self.file = open(archivo_salida, "w", encoding="utf-8")

    def escribir_inicio(self, titulo):
        self.file.write("""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{}</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
</head>
<body>
<h1>{}</h1>
""".format(titulo, titulo))

    def escribir_fin(self):
        self.file.write("</body>\n</html>")
        self.file.close()

    def escribir_parrafo(self, texto):
        self.file.write(f"<p>{texto}</p>\n")

    def escribir_lista(self, titulo, elementos):
        self.file.write(f"<h2>{titulo}</h2>\n<ul>\n")
        for e in elementos:
            self.file.write(f"  <li>{e}</li>\n")
        self.file.write("</ul>\n")

def main(xml_path, html_path):
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()
    except Exception as e:
        print("Error al leer el XML:", e)
        return

    # Declarar el espacio de nombres
    ns = {'ns': 'http://www.uniovi.es'}

    # Buscar el elemento principal
    circuito = root.find('ns:circuito', ns)
    if circuito is None:
        circuito = root  # si el elemento raíz es <circuito>

    if circuito.tag.endswith("circuito"):
        html = Html(html_path)
        nombre = circuito.findtext('ns:nombre', default="(Sin nombre)", namespaces=ns)
        html.escribir_inicio(nombre)

        # Información general
        longitud = circuito.find('ns:longitud', ns)
        anchura = circuito.find('ns:anchura', ns)
        carrera = circuito.find('ns:carrera', ns)

        html.escribir_parrafo(f" Longitud:  {longitud.text} {longitud.get('unidad')}")
        html.escribir_parrafo(f" Anchura:  {anchura.text} {anchura.get('unidad')}")

        if carrera is not None:
            fecha = carrera.findtext('ns:fecha', default="?", namespaces=ns)
            hora = carrera.findtext('ns:hora', default="?", namespaces=ns)
            vueltas = carrera.findtext('ns:vueltas', default="?", namespaces=ns)
            html.escribir_parrafo(f" Fecha de carrera:  {fecha}")
            html.escribir_parrafo(f" Hora de inicio:  {hora}")
            html.escribir_parrafo(f" Vueltas:  {vueltas}")

        # Localización y patrocinador
        localidad = circuito.findtext('ns:localidad', default="", namespaces=ns)
        pais = circuito.findtext('ns:pais', default="", namespaces=ns)
        patrocinador = circuito.findtext('ns:patrocinador', default="", namespaces=ns)
        html.escribir_parrafo(f" Localidad:  {localidad} ({pais})")
        html.escribir_parrafo(f" Patrocinador:  {patrocinador}")

        # Referencias
        refs = [r.text.strip() for r in circuito.findall('ns:referencias/ns:referencia', ns)]
        html.escribir_lista("Referencias", refs)

        # Galerías
        fotos = [f"{f.get('descripcion')} ({f.get('fichero')})" for f in circuito.findall('ns:galeria_fotos/ns:foto', ns)]
        html.escribir_lista("Galería de Fotos", fotos)

        videos = [f"{v.get('descripcion')} ({v.get('fichero')}, {v.get('duracion_s')} s)" for v in circuito.findall('ns:galeria_videos/ns:video', ns)]
        html.escribir_lista("Galería de Videos", videos)

        # Resultado
        vencedor = circuito.find('ns:resultado/ns:vencedor', ns)
        if vencedor is not None:
            nombre_piloto = vencedor.findtext('ns:nombre_piloto', default="?", namespaces=ns)
            nacionalidad = vencedor.findtext('ns:nacionalidad', default="?", namespaces=ns)
            tiempo = circuito.findtext('ns:resultado/ns:tiempo_victoria', default="?", namespaces=ns)
            html.escribir_parrafo(f" Vencedor:  {nombre_piloto} ({nacionalidad}) — Tiempo: {tiempo}")

        # Clasificación
        puestos = circuito.findall('ns:clasificacion_mundial/ns:puesto', ns)
        if puestos:
            clasif = [
                f"{p.findtext('ns:posicion', '?', namespaces=ns)}. "
                f"{p.findtext('ns:piloto', '?', namespaces=ns)} "
                f"({p.findtext('ns:puntos', '?', namespaces=ns)} pts)"
                for p in puestos
            ]
            html.escribir_lista("Clasificación Mundial", clasif)

        html.escribir_fin()
        print(f"✅ Archivo HTML generado correctamente: {html_path}")
    else:
        print("⚠️ No se encontró el elemento <circuito> en el XML.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python xml2html.py archivo.xml salida.html")
    else:
        main(sys.argv[1], sys.argv[2])
