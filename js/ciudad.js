class Ciudad {

    // Constructor: recibe nombre, país y gentilicio
    constructor(nombre, pais, gentilicio) {
        this.nombre = nombre;
        this.pais = pais;
        this.gentilicio = gentilicio;
    
    }

    // Método para rellenar el resto de atributos
    inicializarDatos(poblacion, latitud, longitud, altitud) {
        this.poblacion = poblacion;
        this.latitud = latitud;
        this.longitud = longitud;
        this.altitud = altitud;
    }

    // Método que devuelve el nombre de la ciudad en texto
    obtenerNombreCiudad() {
        return this.nombre;
    }

    // Método que devuelve el nombre del país en texto
    obtenerNombrePais() {
        return this.pais;
    }

    // Método que devuelve el gentilicio y población en una lista ul HTML5
    obtenerInformacionSecundaria() {
        return `
        <ul>
            <li>Gentilicio: ${this.gentilicio}</li>
            <li>Población: ${this.poblacion}</li>
        </ul>`;
    }

    // Método que escribe las coordenadas en el documento con document.write()
    escribirCoordenadasEnDocumento() {
        const p = document.createElement("p");
        p.textContent = `Latitud: ${this.latitud}, Longitud: ${this.longitud}, Altitud: ${this.altitud} m`;
        document.body.appendChild(p);
    }
}
