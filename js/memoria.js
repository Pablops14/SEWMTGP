class Memoria {
    constructor() {
    }


    voltearCarta(carta) {
        carta.dataset.estado = "volteada";
      }
  }

  const memoria = new Memoria();
  