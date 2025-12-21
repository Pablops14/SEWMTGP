<?php
require_once "cronometro.php"; // Primero carga la clase

if (session_status() === PHP_SESSION_NONE) {
    session_start(); // Luego inicia la sesión
}


/* -----------------------------------------
   INICIALIZAR CRONÓMETRO SI NO EXISTE
------------------------------------------ */
if (!isset($_SESSION['cronometro_test'])) {
    $_SESSION['cronometro_test'] = new Cronometro();
}
$cronometro = $_SESSION['cronometro_test'];


/* -----------------------------------------
   1) INICIAR PRUEBA → ARRANCAR CRONÓMETRO
------------------------------------------ */
if (isset($_POST['iniciar'])) {
    $cronometro->reiniciar();
    $cronometro->arrancar();

    // Mostrar el formulario completo
    $_SESSION['prueba_en_curso'] = true;
}


/* -----------------------------------------
   2) TERMINAR PRUEBA → GUARDAR EN RESULTS
------------------------------------------ */
if (isset($_POST['terminar'])) {

    /* --- PARAR CRONÓMETRO --- */
    $cronometro->parar();
    $tiempo_segundos = $cronometro->getTiempo();

    $horas = floor($tiempo_segundos / 3600);
    $minutos = floor(($tiempo_segundos % 3600) / 60);
    $segundos = floor($tiempo_segundos % 60);
    $tiempo_formato = sprintf("%02d:%02d:%02d", $horas, $minutos, $segundos);

    /* --- CONEXIÓN --- */
    $conexion = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "uo288816_db");

    if ($conexion->connect_error) {
        die("Error de conexión");
    }

    /* -----------------------------------------
       2.1) INSERTAR USUARIO EN `users`
    ------------------------------------------ */
    $insert_user = $conexion->prepare("
        INSERT INTO users (Profesion, Edad, Genero, `Pericia informatica`)
        VALUES (?, ?, ?, ?)
    ");

    $insert_user->bind_param(
        "siss",
        $_POST['profesion'],
        $_POST['edad'],
        $_POST['genero'],
        $_POST['pericia']
    );

    $insert_user->execute();
    $id_usuario = $conexion->insert_id;  // ID generado en users
    $insert_user->close();


    /* -----------------------------------------
       2.2) INSERTAR RESULTADO EN `results`
    ------------------------------------------ */
    $consulta = $conexion->prepare("
        INSERT INTO results 
        (ID, Dispositivo, Tiempo, TareaCompletada, Comentarios, PropuestasMejora, Valoracion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $tarea_completada = 1;

    $consulta->bind_param(
        "ississi",
        $id_usuario,                 // <-- AHORA SÍ: ID válido
        $_POST['dispositivo'],
        $tiempo_formato,
        $tarea_completada,
        $_POST['comentarios'],
        $_POST['propuestas'],
        $_POST['valoracion']
    );

    $consulta->execute();
    $consulta->close();
    $conexion->close();


    /* -----------------------------------------
       2.3) PASAR ID AL OBSERVADOR
    ------------------------------------------ */
    $id_usuario_final = $id_usuario;

    /* --- FORMULARIO DEL OBSERVADOR --- */
    echo "
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <title>Observador</title>
    </head>
    <body>

    <h2>Comentarios del Observador</h2>

    <form method='POST'>

        <p>Comentario adicional del observador</p>
        <textarea name='comentario' required></textarea>

        <input type='hidden' name='guardar_observador' value='1'>
        <input type='hidden' name='id_usuario' value='$id_usuario_final'>

        <button type='submit'>Guardar comentario</button>

    </form>

    </body>
    </html>
    ";

    exit;
}


/* -----------------------------------------
   3) GUARDAR COMENTARIO DEL OBSERVADOR
------------------------------------------ */
if (isset($_POST['guardar_observador'])) {

    $conexion = new mysqli("localhost", "DBUSER2025", "DBPSWD2025", "uo288816_db");

    if ($conexion->connect_error) {
        die("Error de conexión");
    }

    $consulta = $conexion->prepare("
        INSERT INTO observaciones (ID, Comentario)
        VALUES (?, ?)
    ");

    $consulta->bind_param(
        "is",
        $_POST['id_usuario'],
        $_POST['comentario']
    );

    $consulta->execute();
    $consulta->close();
    $conexion->close();

    echo "<p>Comentario del observador guardado correctamente.</p>";
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
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

<h2>Prueba de Usabilidad – MotoGP Desktop</h2>

<form method="POST">
    <button type="submit" name="iniciar">Iniciar prueba</button>
</form>


<form method="POST">

    <p>Profesión del usuario</p>
    <input type="text" name="profesion" required>

    <p>Edad del usuario</p>
    <input type="number" name="edad" required>

    <p>Género</p>
    <select name="genero" required>
        <option value="M">M</option>
        <option value="F">F</option>
    </select>

    <p>Pericia informática</p>
    <input type="text" name="pericia" required>


    <p>Dispositivo utilizado</p>
    <select name="dispositivo" required>
        <option value="ordenador">ordenador</option>
        <option value="tablet">tablet</option>
        <option value="teléfono">teléfono</option>
    </select>

    <p>1. ¿Cuál es la temperatura prevista para el día de la carrera?</p>
    <input type="text" name="p1" required>

    <p>2. ¿Cuál es el nombre del piloto seleccionado?</p>
    <input type="text" name="p2" required>

    <p>3. ¿Cuál es la altura del piloto?</p>
    <input type="text" name="p3" required>

    <p>4. Escribe una noticia incluida en el proyecto.</p>
    <textarea name="p4" required></textarea>

    <p>5. ¿Quién quedó primero en la clasificación?</p>
    <input type="text" name="p5" required>

    <p>6. ¿Cuál es el tiempo empleado en la carrera?</p>
    <input type="text" name="p6" required>

    <p>7. ¿Cuál es la longitud del circuito?</p>
    <input type="text" name="p7" required>

    <p>8. ¿Cuál es el gentilicio de Buriram?</p>
    <input type="text" name="p8" required>

    <p>9. ¿Cuál es la población de Buriram?</p>
    <input type="text" name="p9" required>

    <p>10. ¿Qué moto utiliza el piloto?</p>
    <input type="text" name="p10" required>

    <p>Comentarios del usuario</p>
    <textarea name="comentarios" required></textarea>

    <p>Propuestas de mejora</p>
    <textarea name="propuestas" required></textarea>

    <p>Valoración (0-10)</p>
    <input type="number" name="valoracion" min="0" max="10" required>


    <button type="submit" name="terminar">Terminar prueba</button>

</form>

</body>
</html>
