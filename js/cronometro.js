class Cronometro {

    constructor() {
        this.tiempo = 0;
    }

    arrancar() {
        try {
            this.inicio = Temporal.Now.instant();
        } catch (error) {
            this.inicio = new Date();
        }
        this.corriendo = setInterval(this.actualizar.bind(this), 100);
    }

    actualizar() {
        try {
            this.tiempo = Temporal.Now.instant().epochMilliseconds - this.inicio.epochMilliseconds;
        } catch (error) {
            this.tiempo = new Date() - this.inicio;
        }
        this.mostrar();
    }

    mostrar() {
        const minutos = parseInt(this.tiempo / 60000);
        const segundos = parseInt((this.tiempo % 60000) / 1000);
        const decimas = parseInt((this.tiempo % 1000) / 100);

        const formato =
            String(minutos).padStart(2, "0") +
            ":" +
            String(segundos).padStart(2, "0") +
            "." +
            decimas;

        const parrafo = document.querySelector("main p");
        parrafo.textContent = formato;
    }

    parar() {
        clearInterval(this.corriendo);
        this.corriendo = null;
    }

    reiniciar() {
        clearInterval(this.corriendo);
        this.tiempo = 0;
        this.corriendo = null;
        this.mostrar();
    }

}
// Crear el cronómetro cuando cargue la página
const cronometro = new Cronometro();
