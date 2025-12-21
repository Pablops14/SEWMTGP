<?php

class Clasificacion {

    private $documento;

    public function __construct() {
        $this->documento = __DIR__ . '/xml/circuitoEsquema.xml';
    }

    public function consultar() {
        if (!file_exists($this->documento)) {
            return null;
        }

        $xml = simplexml_load_file($this->documento);

        if ($xml === false) {
            return null;
        }

        return $xml;
    }
}

$clasificacion = new Clasificacion();
$xml = $clasificacion->consultar();

$nombreGanador = "";
$tiempoGanador = "";

if ($xml !== null) {

    $ns = $xml->getNamespaces(true);
    $c = $xml->children($ns['']);

    $resultado = $c->resultado;

    if ($resultado) {
        $nombreGanador = (string)$resultado->vencedor->nombre_piloto;
        $tiempoGanador = (string)$resultado->tiempo_victoria;
    }
}

$clasificacionMundial = [];

if ($xml !== null) {

    $ns = $xml->getNamespaces(true);
    $c = $xml->children($ns['']);

    if (isset($c->clasificacion_mundial)) {
        foreach ($c->clasificacion_mundial->puesto as $puesto) {
            $clasificacionMundial[] = [
                'posicion' => (string)$puesto->posicion,
                'piloto'   => (string)$puesto->piloto,
                'puntos'   => (string)$puesto->puntos
            ];
        }
    }
}


?>
<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>MotoGP-Clasificaciones</title>
    <link rel="icon" href="multimedia/favicon.ico" />
    <meta name="author" content="Pablo Pérez Saavedra" />
    <meta name="description" content="Información de clasificaciones de MotoGP" />
    <meta name="keywords" content="MotoGP" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css"/>
</head>

<body>
<header>
    <h1><a href="index.html">MotoGP Desktop</a></h1>
    <nav>
        <a href="index.html">Inicio</a>
        <a href="piloto.html">Piloto</a>
        <a href="circuito.html">Circuito</a>
        <a href="meteorologia.html">Meteorologia</a>
        <a href="clasificaciones.php">Clasificaciones</a>
        <a href="juegos.html">Juegos</a>
        <a href="ayuda.html">Ayuda</a>
    </nav>
</header>

<p>Estás en: <a href="index.html">Inicio</a> >> Clasificaciones</p>

<h2>Información relativa a las clasificaciones de MotoGP</h2>

<section>
    <h3>Ganador de la carrera</h3>

    <?php if ($nombreGanador !== "" && $tiempoGanador !== ""): ?>
        <p>Piloto ganador: <?php echo $nombreGanador; ?></p>
        <p>Tiempo empleado: <?php echo $tiempoGanador; ?></p>
    <?php else: ?>
        <p>No se ha podido obtener la información del ganador.</p>
    <?php endif; ?>
</section>

<section>
    <h3>Clasificación del mundial tras la carrera</h3>

    <?php if (!empty($clasificacionMundial)): ?>
        <table>
            <thead>
                <tr>
                    <th>Posición</th>
                    <th>Piloto</th>
                    <th>Puntos</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($clasificacionMundial as $fila): ?>
                    <tr>
                        <td><?php echo $fila['posicion']; ?></td>
                        <td><?php echo $fila['piloto']; ?></td>
                        <td><?php echo $fila['puntos']; ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No se ha podido obtener la clasificación del mundial.</p>
    <?php endif; ?>
</section>
</body>
</html>
