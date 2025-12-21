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

    getMeteorologiaCarrera() {

        const fechaCarrera = "2025-10-26"; // Día exacto de la carrera

        const url = "https://api.open-meteo.com/v1/forecast";

        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            data: {
                latitude: this.latitud,
                longitude: this.longitud,
                start_date: fechaCarrera,
                end_date: fechaCarrera,
                hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,winddirection_10m",
                daily: "sunrise,sunset",
                timezone: "auto"
            },

            success: function(datos) {

                const tieneDaily = datos.daily 
                                && datos.daily.sunrise 
                                && datos.daily.sunrise.length > 0 
                                && datos.daily.sunset 
                                && datos.daily.sunset.length > 0;

                const meteo = {
                    diario: {
                        salidaSol: tieneDaily ? datos.daily.sunrise[0] : "No disponible",
                        puestaSol: tieneDaily ? datos.daily.sunset[0] : "No disponible"
                    },
                    horario: {
                        fechas: datos.hourly.time,
                        temperatura: datos.hourly.temperature_2m,
                        sensacionTermica: datos.hourly.apparent_temperature,
                        lluvia: datos.hourly.precipitation,
                        humedad: datos.hourly.relative_humidity_2m,
                        vientoVelocidad: datos.hourly.windspeed_10m,
                        vientoDireccion: datos.hourly.winddirection_10m
                    }
                };

                this.procesarJSONCarrera(meteo);

            }.bind(this),

            error: function() {
                console.error("Error al obtener los datos meteorológicos.");
            }
        });
    }



       procesarJSONCarrera(meteoJSON) {
            const main = $("main");

            main.append("<h3>Datos diarios</h3>");
            main.append(`<p>Salida del sol: ${meteoJSON.diario.salidaSol}</p>`);
            main.append(`<p>Puesta del sol: ${meteoJSON.diario.puestaSol}</p>`);

            main.append("<h3>Datos horarios</h3>");

            const tabla = $("<table border='1'></table>");
            tabla.append("<tr><th>Hora</th><th>Temp</th><th>Sensación</th><th>Lluvia</th><th>Humedad</th><th>Viento</th><th>Dirección</th></tr>");

            const horas = meteoJSON.horario.temperatura.length;

            for (let i = 0; i < horas; i++) {
                const fila = $("<tr></tr>");
                fila.append(`<td>${meteoJSON.horario.fechas[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.temperatura[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.sensacionTermica[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.lluvia[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.humedad[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.vientoVelocidad[i]}</td>`);
                fila.append(`<td>${meteoJSON.horario.vientoDireccion[i]}</td>`);
                tabla.append(fila);
            }

            main.append(tabla);
        }

   getMeteorologiaEntrenos() {

        const fechaInicio = "2025-10-23";
        const fechaFin = "2025-10-25";

        const url = "https://api.open-meteo.com/v1/forecast";

        $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            data: {
                latitude: this.latitud,
                longitude: this.longitud,
                start_date: fechaInicio,
                end_date: fechaFin,
                hourly: "temperature_2m,precipitation,windspeed_10m,relative_humidity_2m",
                timezone: "auto"
            },

            success: function(datos) {

                if (!datos.hourly) {
                    console.error("El JSON de entrenos no contiene datos horarios");
                    return;
                }

                const meteoEntrenos = {
                    fechas: datos.hourly.time,
                    temperatura: datos.hourly.temperature_2m,
                    lluvia: datos.hourly.precipitation,
                    viento: datos.hourly.windspeed_10m,
                    humedad: datos.hourly.relative_humidity_2m
                };

                // Procesar y mostrar en el HTML
                this.procesarJSONEntrenos(meteoEntrenos);

            }.bind(this),

            error: function() {
                console.error("Error al obtener los datos de entrenamientos.");
            }
        });
    }




    procesarJSONEntrenos(meteoEntrenos) {

        const main = $("main");

        main.append("<h3>Medias de los entrenamientos (3 días)</h3>");

        const HORAS_DIA = 24;

        // Función auxiliar para calcular media
        function media(array) {
            const suma = array.reduce((acc, val) => acc + val, 0);
            return (suma / array.length).toFixed(2);
        }

        // Procesar los 3 días
        for (let dia = 0; dia < 3; dia++) {

            // Índices de inicio y fin para cada día
            const inicio = dia * HORAS_DIA;
            const fin = inicio + HORAS_DIA;

            // Extraemos los datos del día
            const tempDia = meteoEntrenos.temperatura.slice(inicio, fin);
            const lluviaDia = meteoEntrenos.lluvia.slice(inicio, fin);
            const vientoDia = meteoEntrenos.viento.slice(inicio, fin);
            const humedadDia = meteoEntrenos.humedad.slice(inicio, fin);

            // Calculamos medias
            const mediaTemp = media(tempDia);
            const mediaLluvia = media(lluviaDia);
            const mediaViento = media(vientoDia);
            const mediaHumedad = media(humedadDia);

            // Añadimos al documento
            main.append(`<h4>Día ${dia + 1}</h4>`);
            main.append(`<p>Temperatura media: ${mediaTemp} °C</p>`);
            main.append(`<p>Lluvia media: ${mediaLluvia} mm</p>`);
            main.append(`<p>Viento medio: ${mediaViento} km/h</p>`);
            main.append(`<p>Humedad media: ${mediaHumedad} %</p>`);
        }
    }


}
