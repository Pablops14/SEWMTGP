class Memoria {
    // Atributos privados
    #primeraCarta;
    #segundaCarta;
    #tableroBloqueado;
    #cronometro;

    constructor() {
        this.#primeraCarta = null;
        this.#segundaCarta = null;
        this.#tableroBloqueado = false;

        this.#barajarCartas();

        this.#cronometro = new Cronometro();
        this.#cronometro.arrancar();
    }

    activarEventos() {
        const cartas = document.querySelectorAll("main > article");
        cartas.forEach(carta => {
            carta.addEventListener("click", (event) => {
                this.#voltearCarta(event.currentTarget);
            });
        });
    }

    #voltearCarta(carta) {
        if (this.#tableroBloqueado) return;
        if (carta === this.#primeraCarta) return;
        if (carta.classList.contains("revelada")) return;

        carta.dataset.estado = "volteada";

        if (!this.#primeraCarta) {
            this.#primeraCarta = carta;
            return;
        }

        this.#segundaCarta = carta;
        this.#tableroBloqueado = true;

        this.#comprobarPareja();
    }


    #barajarCartas() {
        const contenedor = document.querySelector("main");
        const cartas = Array.from(contenedor.querySelectorAll("article"));

        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }

        cartas.forEach(carta => contenedor.appendChild(carta));
    }


    #reiniciarAtributos() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;
    }

    #deshabilitarCartas() {
        this.#primeraCarta.classList.add("revelada");
        this.#segundaCarta.classList.add("revelada");

        this.#comprobarJuego();
        this.#reiniciarAtributos();
    }

    #comprobarJuego() {
        const cartas = Array.from(document.querySelectorAll("main > article"));
        const todas = cartas.every(carta => carta.classList.contains("revelada"));

        if (todas) {
            this.#cronometro.parar();
        }
    }

    #cubrirCartas() {
        setTimeout(() => {
            this.#primeraCarta.removeAttribute("data-estado");
            this.#segundaCarta.removeAttribute("data-estado");
            this.#reiniciarAtributos();
        }, 1500);
    }

    #comprobarPareja() {
        const img1 = this.#primeraCarta.querySelector("img");
        const img2 = this.#segundaCarta.querySelector("img");

        const iguales = img1.alt === img2.alt;
        iguales ? this.#deshabilitarCartas() : this.#cubrirCartas();
    }
}
