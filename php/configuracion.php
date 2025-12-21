<?php
// ===============================
// CONFIGURACIÓN DE CONEXIÓN
// ===============================
$servidor = "localhost";
$usuario = "DBUSER2025";
$password = "DBPSWD2025";
$bd = "uo288816_db";

// Crear conexión general
$conexion = new mysqli($servidor, $usuario, $password);

// Comprobar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// ===============================
// FUNCIONES DE CONFIGURACIÓN
// ===============================

// Reiniciar BD: vaciar todas las tablas
if (isset($_POST['reiniciar'])) {
    $conexion->select_db($bd);

    $tablas = ["results", "observaciones", "users"];

    foreach ($tablas as $t) {
        $conexion->query("DELETE FROM $t");
    }

    $mensaje = "Base de datos reiniciada correctamente.";
}

// Eliminar BD completa
if (isset($_POST['eliminar'])) {
    $conexion->query("DROP DATABASE IF EXISTS $bd");
    $mensaje = "Base de datos eliminada correctamente.";
}

// Exportar CSV
if (isset($_POST['exportar'])) {
    $conexion->select_db($bd);

    $tabla = $_POST['tabla'];
    $resultado = $conexion->query("SELECT * FROM $tabla");

    header("Content-Type: text/csv");
    header("Content-Disposition: attachment; filename=$tabla.csv");

    $fichero = fopen("php://output", "w");

    // Cabeceras
    $columnas = $resultado->fetch_fields();
    $cabeceras = [];
    foreach ($columnas as $col) {
        $cabeceras[] = $col->name;
    }
    fputcsv($fichero, $cabeceras);

    // Datos
    while ($fila = $resultado->fetch_assoc()) {
        fputcsv($fichero, $fila);
    }

    fclose($fichero);
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>MotoGP-Clasificaciones</title>
    <link rel="icon" href="multimedia/favicon.ico" />
    <meta name="author" content="Pablo Pérez Saavedra" />
    <meta name="description" content="Test de MotoGP-Desktop" />
    <meta name="keywords" content="MotoGP" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css"/>
</head>

<body>
<header>
    <h1><a href="../index.html">MotoGP Desktop</a></h1>
    <nav>
        <a href="../index.html">Inicio</a>
        <a href="../piloto.html">Piloto</a>
        <a href="../circuito.html">Circuito</a>
        <a href="../meteorologia.html">Meteorologia</a>
        <a href="../clasificaciones.php">Clasificaciones</a>
        <a href="../juegos.html">Juegos</a>
        <a href="../ayuda.html">Ayuda</a>
    </nav>
</header>
<body>

<h1>Configuración de la Base de Datos</h1>

<?php if (isset($mensaje)) echo "<p>$mensaje</p>"; ?>

<form method="POST">
    <button name="reiniciar">Reiniciar Base de Datos</button>
</form>

<form method="POST">
    <button name="eliminar">Eliminar Base de Datos</button>
</form>

<form method="POST">
    <select name="tabla">
        <option value="users">Users</option>
        <option value="results">Results</option>
        <option value="observaciones">Observaciones</option>
    </select>
    <button name="exportar">Exportar CSV</button>
</form>

</body>
</html>
