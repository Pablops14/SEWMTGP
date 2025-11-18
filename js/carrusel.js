class Carrusel {
    #busqueda;
    #actual;
    #maximo;

    constructor(busqueda) {
        this.#busqueda = busqueda;
        this.#actual = 0;
        this.#maximo = 5; // Cambiado a 5 fotos para el carrusel
        this.fotos = [];
        this.fotosProcesadas = [];
    }

    mostrarEstado() {
        console.log(`Carrusel: búsqueda="${this.#busqueda}", actual=${this.#actual}, máximo=${this.#maximo}`);
    }

    getFotografias() {
        const self = this;
        return $.ajax({
            url: "https://www.flickr.com/services/rest/",
            method: "GET",
            dataType: "json",
            data: {
                method: "flickr.photos.search",
                api_key: "21d0ca7aacdc6e5b235dcb2f79303d3e",
                text: this.#busqueda,
                format: "json",
                nojsoncallback: 1,
                per_page: this.#maximo,
                sort: "relevance",
                extras: "url_c"
            },
            success: function(response) {
                if (response.photos && response.photos.photo) {
                    self.fotos = response.photos.photo.map(photo => photo.url_c);
                    console.log("Fotos obtenidas:", self.fotos);
                } else {
                    console.error("No se encontraron fotos");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error en la llamada AJAX:", error);
            }
        });
    }

    procesarJSONFotografias() {
        if (!this.fotos || this.fotos.length === 0) {
            console.error("No hay fotos disponibles para procesar.");
            return;
        }

        const fotosSeleccionadas = [];
        const fotosDisponibles = [...this.fotos];

        while (fotosSeleccionadas.length < this.#maximo && fotosDisponibles.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * fotosDisponibles.length);
            fotosSeleccionadas.push(fotosDisponibles[indiceAleatorio]);
            fotosDisponibles.splice(indiceAleatorio, 1);
        }

        this.fotosProcesadas = fotosSeleccionadas;
        console.log("Fotos procesadas:", this.fotosProcesadas);
    }

    mostrarFotografias() {
        if (!this.fotosProcesadas || this.fotosProcesadas.length === 0) {
            console.error("No hay fotos procesadas para mostrar.");
            return;
        }

        const foto = this.fotosProcesadas[0];

        const $articulo = $("<article></article>");
        const $titulo = $("<h2></h2>").text(`Imágenes del circuito de ${this.#busqueda}`);
        const $imagen = $("<img>").attr("src", foto).attr("alt", `Imagen del circuito ${this.#busqueda}`);

        $articulo.append($titulo, $imagen);
        $("main").append($articulo);

        setInterval(this.cambiarFotografia.bind(this), 3000);
    }

    cambiarFotografia() {
        this.#actual = (this.#actual + 1) % this.fotosProcesadas.length;
        const foto = this.fotosProcesadas[this.#actual];
        $("main article img").attr("src", foto);
    }
}

// Crear y mostrar el carrusel
const carruselMotoGP = new Carrusel("Chang International Circuit");

carruselMotoGP.getFotografias().done(() => {
    carruselMotoGP.procesarJSONFotografias();
    carruselMotoGP.mostrarFotografias();
});
