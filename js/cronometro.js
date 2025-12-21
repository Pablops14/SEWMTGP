class Cronometro {
    // Atributos privados
    #tiempo;
    #inicio;
    #corriendo;

    constructor() {
        this.#tiempo = 0;
    }


    arrancar() {
        try {
            this.#inicio = Temporal.Now.instant();
        } catch (error) {
            this.#inicio = new Date();
        }

        this.#corriendo = setInterval(() => this.#actualizar(), 100);
    }


    parar() {
        if (this.#corriendo) {
            clearInterval(this.#corriendo);
            this.#corriendo = null;
        }
    }

    reiniciar() {
        this.parar();
        this.#tiempo = 0;
        this.#mostrar();
    }

    #actualizar() {
        try {
            this.#tiempo = Temporal.Now.instant().epochMilliseconds - this.#inicio.epochMilliseconds;
        } catch (error) {
            this.#tiempo = new Date() - this.#inicio;
        }
        this.#mostrar();
    }

    #mostrar() {
        const minutos = Math.floor(this.#tiempo / 60000);
        const segundos = Math.floor((this.#tiempo % 60000) / 1000);
        const decimas = Math.floor((this.#tiempo % 1000) / 100);

        const formato =
            String(minutos).padStart(2, "0") +
            ":" +
            String(segundos).padStart(2, "0") +
            "." +
            decimas;

        const parrafo = document.querySelector("main p");
        if (parrafo) parrafo.textContent = formato;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.cronometro = new Cronometro();
});


