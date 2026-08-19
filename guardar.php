<?php

$conexion = new mysqli("localhost", "root", "", "sapi");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$q1 = $_POST["q1"];
$q2 = $_POST["q2"];
$q3 = $_POST["q3"];
$q4 = $_POST["q4"];
$q5 = $_POST["q5"];
$q6 = $_POST["q6"];
$q7 = $_POST["q7"];

$sql = "INSERT INTO respuestas 
        (q1, q2, q3, q4, q5, q6, q7)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);

$stmt->bind_param(
    "sssssss",
    $q1, $q2, $q3, $q4, $q5, $q6, $q7
);

$stmt->execute();

echo "Respuesta guardada correctamente.";

$stmt->close();
$conexion->close();

?>