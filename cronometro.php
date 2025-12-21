<?php
/*
 * Autor: Pablo Pérez Saavedra
 */

class Cronometro {
    private $tiempo;
    private $inicio;

    public function __construct() {
        $this->tiempo = 0;
        $this->inicio = null;
    }

    public function getTiempo() {
        return $this->tiempo;
    }

    public function reiniciar() {
        $this->tiempo = 0;
        $this->inicio = null;
    }

     public function arrancar() {
        $this->inicio = microtime(true);
    }

    public function getInicio() {
        return $this->inicio;
    }

    public function parar() {
        if ($this->inicio !== null) {
            $fin = microtime(true); 
            $this->tiempo = $fin - $this->inicio; 
            $this->inicio = null; 
        }
    }

     public function mostrar() {
        // Convertimos el tiempo en minutos y segundos
        $minutos = floor($this->tiempo / 60);
        $segundos = $this->tiempo - ($minutos * 60);

        return sprintf("%02d:%04.1f", $minutos, $segundos);
    }
}
// --- Lógica de interfaz ---
session_start();
if (!isset($_SESSION['cronometro_menu'])) {
    $_SESSION['cronometro_menu'] = new Cronometro();
}
$cronometro = $_SESSION['cronometro_menu'];


$mensaje = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST["arrancar"])) {
        $cronometro->arrancar();
        $mensaje = "⏱ Cronómetro arrancado.";
    } elseif (isset($_POST["parar"])) {
        $cronometro->parar();
        $mensaje = "⏹ Cronómetro detenido.";
    } elseif (isset($_POST["mostrar"])) {
        $mensaje = "⏲ Tiempo transcurrido: " . $cronometro->mostrar();
    } elseif (isset($_POST["reiniciar"])) {
        $cronometro->reiniciar();
        $mensaje = "🔄 Cronómetro reiniciado.";
    }
}
?>
<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>MotoGP - Cronómetro</title>
    <link rel="icon" href="multimedia/favicon.ico" />
    <meta name="author" content="Pablo Pérez Saavedra" />
    <meta name="description" content="Cronómetro de MotoGP Desktop" />
    <meta name="keywords" content="MotoGP, Cronómetro" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css"/>
</head>

<body>
    <header>
        <h1>MotoGP Desktop</h1>
        <nav>
            <a href="index.html">Inicio</a>
            <a href="piloto.html">Piloto</a>
            <a href="circuito.html">Circuito</a>
            <a href="meteorologia.html">Meteorologia</a>
            <a href="clasificaciones.php">Clasificaciones</a>
            <a href="juegos.html">Juegos</a>
            <a href="ayuda.html">Ayuda</a>
            <a href="cronometro.php" class="active">Cronómetro</a>
        </nav>
    </header>
    <main>
        <p>Estás en: <a href="index.html">Inicio</a> >> <a href="juegos.html">Juegos</a> >> Cronómetro</p>
        <h2>Prueba de funcionamiento del cronómetro</h2>

        <form method="post">
            <input type="submit" name="arrancar" value="Arrancar" />
            <input type="submit" name="parar" value="Parar" />
            <input type="submit" name="mostrar" value="Mostrar" />
            <input type="submit" name="reiniciar" value="Reiniciar" />
        </form>

        <p><?php echo $mensaje; ?></p>
    </main>
</body>
</html>