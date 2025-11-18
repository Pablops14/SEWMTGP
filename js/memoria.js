/**
 * Autor: Pablo Pérez Saavedra
 * 
 */
class Memoria {
    constructor() {
        this.primera_carta = null;
        this.segunda_carta = null;
        this.barajarCartas();
        this.tablero_bloqueado = false;

        this.cronometro = new Cronometro();
        this.cronometro.arrancar();
    }


    voltearCarta(carta) {    
        if (this.tablero_bloqueado) return;   
        if (carta === this.primera_carta) return;
        if (carta.classList.contains("revelada")) return;
        carta.dataset.estado = "volteada";

        if (!this.primera_carta) {
            this.primera_carta = carta; 
            return;
        }

        this.segunda_carta = carta; 

        this.tablero_bloqueado = true;
        this.comprobarPareja();
    }

    activarEventos() {
        const cartas = document.querySelectorAll("main > article");

        cartas.forEach(carta => {
            carta.addEventListener("click", (event) => {
                this.voltearCarta(event.currentTarget);
            });
        });
    }
    
    barajarCartas() {
        const contenedor = document.querySelector("main"); // contenedor principal
        const cartas = Array.from(contenedor.querySelectorAll("article")); // solo las cartas

        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = cartas[i];
            cartas[i] = cartas[j];
            cartas[j] = temp;
        }

        // Reinsertamos las cartas en el mismo contenedor
        cartas.forEach(carta => contenedor.appendChild(carta));
    }
    reiniciarAtributos() {
        this.tablero_bloqueado = false;
        this.primera_carta = null;
        this.segunda_carta = null;
    }

    deshabilitarCartas() {
        this.primera_carta.classList.add("revelada");
        this.segunda_carta.classList.add("revelada");
        this.comprobarJuego();
        this.reiniciarAtributos();
    }

    comprobarJuego() {
        const contenedor = document.querySelector("main"); // contenedor principal
        const cartas = Array.from(contenedor.querySelectorAll("article")); // solo las cartas
        const todasReveladas = Array.from(cartas).every(carta => carta.classList.contains("revelada"));
        console.log(todasReveladas);
        if (todasReveladas) {
            this.cronometro.parar();
        }
    }

    cubrirCartas() {
        // Bloqueamos el tablero para evitar interacciones mientras se voltean las cartas
        this.tablero_bloqueado = true;

        // Usamos setTimeout para esperar 1.5 segundos antes de poner las cartas bocabajo
        setTimeout(() => {
            this.primera_carta.removeAttribute("data-estado");
            this.segunda_carta.removeAttribute("data-estado");
            this.reiniciarAtributos();
        }, 1500); // 1500 ms = 1,5 segundos
    }

    comprobarPareja() {
        if (!this.primera_carta || !this.segunda_carta) return;
        const img1 = this.primera_carta.querySelector("img");
        const img2 = this.segunda_carta.querySelector("img");

        const sonIguales = img1.getAttribute("alt") === img2.getAttribute("alt");

        sonIguales ? this.deshabilitarCartas() : this.cubrirCartas();
    }
  }


  