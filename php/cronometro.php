<?php
/*
 * Autor: Pablo Pérez Saavedra
 * Este es porque me daba problemas en el test el usar el mismo php, se que sería mejorable
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
        $minutos = floor($this->tiempo / 60);
        $segundos = $this->tiempo - ($minutos * 60);
        return sprintf("%02d:%04.1f", $minutos, $segundos);
    }
}
?>
