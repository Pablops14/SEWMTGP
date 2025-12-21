class Noticias {

    constructor(busqueda) {
        this.busqueda = busqueda;
        this.url = "https://api.thenewsapi.com/v1/news/all";
        this.apiKey = "cEtSuVWg2gT4wjfNBGZTsWGsPTbhjll06swdCvKk"; 
    }

    buscar() {
        const endpoint = `${this.url}?api_token=${this.apiKey}&search=${this.busqueda}&locale=es&limit=5`;

        return fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }
                return response.json(); 
            })
            .catch(error => {
                console.error("Error al obtener noticias:", error);
            });
    }

    procesarInformacion(json) {
        if (!json || !json.data) {
            console.error("El JSON no contiene noticias válidas");
            return [];
        }
        const noticias = json.data.map(noticia => {
            return {
                titulo: noticia.title,
                descripcion: noticia.description,
                imagen: noticia.image_url,
                enlace: noticia.url,
                fecha: noticia.published_at,
                fuente: noticia.source
            };
        });
        this.noticias = noticias;
        return noticias;
    }

    mostrarNoticias() {
        const seccion = $("section").last();

        seccion.find("article").remove();

        // Recorremos las noticias procesadas
        this.noticias.forEach(noticia => {

            const articulo = $("<article></article>");

            const titulo = $("<h3></h3>").text(noticia.titulo);
            articulo.append(titulo);

            const entradilla = $("<p></p>").text(noticia.descripcion);
            articulo.append(entradilla);

            const fuente = $("<p></p>").text("Fuente: " + noticia.fuente);
            articulo.append(fuente);

            const enlace = $("<a></a>")
                .attr("href", noticia.enlace)
                .attr("target", "_blank")
                .text("Leer noticia completa");
            articulo.append(enlace);

            seccion.append(articulo);
        });
    }


}

const noticias = new Noticias("MotoGP");

noticias.buscar().then(json => {
    const lista = noticias.procesarInformacion(json);
    console.log(lista); // Aquí ya tienes las noticias procesadas
});

