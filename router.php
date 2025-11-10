<?php
// router.php — manejador universal con CORS

// === Habilitar CORS antes de cualquier salida ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Responder preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Si el archivo solicitado existe, servirlo normalmente
$path = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
if (is_file($path)) {
    return false; // deja que PHP lo sirva (roles.php, usuarios.php, etc.)
}

// Si no existe, devolver 404 JSON
http_response_code(404);
echo json_encode(["error" => "Archivo no encontrado"]);
