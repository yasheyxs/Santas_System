<?php
// Mostrar errores en el navegador para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// --- CORS ---
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ======================
   Cargar .env
====================== */
require_once __DIR__ . '/../vendor/autoload.php';  // Asegúrate de que el autoload de Composer esté presente

// Ruta correcta a la raíz del proyecto
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');  // Correcta ruta desde 'api' a la raíz
$dotenv->load();

// Verificar que las variables de entorno se están cargando correctamente
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$dbname = getenv('DB_NAME');
$dbuser = getenv('DB_USER');
$dbpass = getenv('DB_PASSWORD');

$brevoApiKey = getenv('BREVO_API_KEY');
$fromEmail = getenv('MAILER_FROM_ADDRESS');
$fromName = getenv('MAILER_FROM_NAME');

// Comprobar si alguna variable de entorno está vacía
if (!$host || !$port || !$dbname || !$dbuser || !$dbpass || !$brevoApiKey || !$fromEmail || !$fromName) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Faltan variables de entorno necesarias',
        'details' => [
            'DB_HOST' => $host ? $host : 'no definido',
            'DB_PORT' => $port ? $port : 'no definido',
            'DB_NAME' => $dbname ? $dbname : 'no definido',
            'DB_USER' => $dbuser ? $dbuser : 'no definido',
            'DB_PASSWORD' => $dbpass ? 'definido' : 'no definido',
            'BREVO_API_KEY' => $brevoApiKey ? 'definido' : 'no definido',
            'MAILER_FROM_ADDRESS' => $fromEmail ? 'definido' : 'no definido',
            'MAILER_FROM_NAME' => $fromName ? 'definido' : 'no definido'
        ]
    ]);
    exit;
}

/* ======================
   Conexión a la base de datos
====================== */
try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$dbuser;password=$dbpass;sslmode=require");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo conectar a la base de datos', 'details' => $e->getMessage()]);
    exit;
}

/* ======================
   Input
====================== */
$data = json_decode(file_get_contents("php://input"), true);
$email = strtolower(trim($data["email"] ?? ""));

if ($email === "") {
    http_response_code(400);
    echo json_encode(['error' => 'El email es obligatorio']);
    exit;
}

/* ======================
   Buscar usuario
====================== */
$stmt = $conn->prepare("SELECT id, nombre FROM usuarios WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'No existe un usuario con ese email']);
    exit;
}

/* ======================
   Generar nueva contraseña
====================== */
$newPass = strtoupper(bin2hex(random_bytes(4)));  // Generar nueva contraseña
$hash = password_hash($newPass, PASSWORD_BCRYPT);

$stmt = $conn->prepare("UPDATE usuarios SET clave_bcrypt = :c WHERE id = :id");
$stmt->execute([':c' => $hash, ':id' => $user['id']]);


/* ======================
   Enviar Mail (Brevo)
====================== */
$payload = [
    "sender" => [
        "name" => $fromName,
        "email" => $fromEmail
    ],
    "to" => [[
        "email" => $email,
        "name" => $user["nombre"]
    ]],
    "subject" => "Recuperación de contraseña - Santas Club",
    "htmlContent" =>
    "<p>Hola <strong>{$user['nombre']}</strong>,</p>
         <p>Tu nueva contraseña temporal es:</p>
         <h2>$newPass</h2>
         <p>Por seguridad, cámbiala al ingresar al sistema.</p>"
];

$ch = curl_init("https://api.brevo.com/v3/smtp/email");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Content-Type: application/json",
    "api-key: $brevoApiKey"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 400) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo enviar el correo']);
    exit;
}

echo json_encode(['message' => 'Contraseña temporal enviada al correo']);
