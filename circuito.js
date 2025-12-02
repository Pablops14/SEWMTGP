class Circuito {
    constructor() {
        this.comprobarApiFile();

        // Esperamos a que el DOM esté listo antes de configurar el selector
        window.addEventListener("DOMContentLoaded", () => {
            this.configurarSelectorArchivo();
        });
    }

    comprobarApiFile() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log("✅ El navegador soporta la API File.");
        } else {
            console.log("❌ El navegador NO soporta la API File.");
            const mensaje = document.createElement("p");
            mensaje.style.color = "red";
            mensaje.textContent = "Tu navegador no soporta la API File. Algunas funciones pueden no estar disponibles.";
            document.body.appendChild(mensaje);
        }
    }

    configurarSelectorArchivo() {
        const inputFile = document.querySelector('input[type="file"]');
        if (inputFile) {
            inputFile.addEventListener("change", (event) => {
                const archivo = event.target.files[0];
                this.leerArchivoHTML(archivo);
            });
        } else {
            console.warn("No se encontró ningún input de tipo file en el documento.");
        }
    }

    leerArchivoHTML(archivo) {
        if (!archivo) {
            console.error("No se ha proporcionado ningún archivo.");
            return;
        }

        const lector = new FileReader();

        lector.onload = (evento) => {
            const contenido = evento.target.result;

            const parser = new DOMParser();
            const doc = parser.parseFromString(contenido, "text/html");

            const bodyContenido = doc.body;
            const section = document.createElement("section");
            section.id = "info-circuito";

            while (bodyContenido.firstChild) {
                section.appendChild(bodyContenido.firstChild);
            }

            document.body.appendChild(section);
        };

        lector.onerror = () => {
            console.error("Error al leer el archivo.");
        };

        lector.readAsText(archivo);
    }
}

class CargadorSVG {
    leerArchivoSVG(archivo) {
        if (!archivo) {
            console.error("No se ha proporcionado ningún archivo SVG.");
            return;
        }

        const lector = new FileReader();

        lector.onload = (evento) => {
            const contenidoSVG = evento.target.result;
            this.insertarSVG(contenidoSVG);
        };

        lector.onerror = () => {
            console.error("Error al leer el archivo SVG.");
        };

        lector.readAsText(archivo);
    }

   insertarSVG(contenidoSVG) {
    // Creamos un nuevo elemento <section> y le añadimos el SVG
        $("body").append($("<section>").html(contenidoSVG));
    }

}

window.addEventListener("DOMContentLoaded", () => {
    const contenedorMapa = document.querySelector('div');

    if (!contenedorMapa) {
        console.error("No se encontró un contenedor <section> para el mapa.");
        return;
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoicGFibG9wczE0MDMiLCJhIjoiY21pb2Z1OHA3MDE4MjNkcXhpcWRjNTR6eCJ9.lsLWJDL9YSva58Gj2HySxg'; 

    const mapa = new mapboxgl.Map({
        container: contenedorMapa,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [103.0844, 14.9587], // Coordenadas iniciales
        zoom: 14
    });

    mapa.addControl(new mapboxgl.NavigationControl());

    // Creamos la instancia del cargador KML con acceso al mapa
    window.cargadorKML = new CargadorKML(mapa);
});

class CargadorKML {
    constructor(mapa) {
        this.mapa = mapa;
    }

    leerArchivoKML(archivo) {
        if (!archivo) {
            console.error("No se ha proporcionado ningún archivo KML.");
            return;
        }

        const lector = new FileReader();

        lector.onload = (evento) => {
            const contenidoKML = evento.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(contenidoKML, "application/xml");
            const coordenadas = xmlDoc.getElementsByTagName("coordinates");

            if (coordenadas.length === 0) {
                console.warn("No se encontraron coordenadas en el archivo KML.");
                return;
            }

            const puntos = [];

            for (let i = 0; i < coordenadas.length; i++) {
                const tramo = coordenadas[i].textContent.trim().split(/\s+/);
                tramo.forEach((coord) => {
                    if (coord.includes(",")) {
                        const partes = coord.split(",");
                        if (partes.length >= 2) {
                            const lon = parseFloat(partes[0].trim());
                            const lat = parseFloat(partes[1].trim());
                            puntos.push([lon, lat]);
                        }
                    }
                });
            }

            if (puntos.length === 0) {
                console.warn("No se extrajeron puntos válidos del KML.");
                return;
            }

            console.log("📍 Coordenadas extraídas:", puntos);
            this.insertarCapaKML(puntos);
        };

        lector.onerror = () => {
            console.error("Error al leer el archivo KML.");
        };

        lector.readAsText(archivo);
    }

    insertarCapaKML(puntos) {
    const geojson = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: puntos
        },
        properties: {}
    };

    const añadirCapa = () => {
        if (this.mapa.getSource("circuito-kml")) {
            this.mapa.getSource("circuito-kml").setData(geojson);
        } else {
            this.mapa.addSource("circuito-kml", {
                type: "geojson",
                data: geojson
            });

            this.mapa.addLayer({
                id: "circuito-kml",
                type: "line",
                source: "circuito-kml",
                paint: {
                    "line-color": "#ff0000",
                    "line-width": 3
                }
            });
        }

        this.mapa.flyTo({ center: puntos[0], zoom: 15 });
    };

    // Esperamos a que el estilo esté cargado
    if (this.mapa.isStyleLoaded()) {
        añadirCapa();
    } else {
        this.mapa.once("load", añadirCapa);
    }
}

}


const cargadorSVG = new CargadorSVG();


const circuito = new Circuito();
