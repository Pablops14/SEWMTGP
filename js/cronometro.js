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

    actualizar(){
        try {
            this.tiempo = this.inicio - Temporal.Now.instant(); 
        } catch (error) {
            this.tiempo = this.inicio - new Date();
        }
    }

    mostrar(){

    }

}
