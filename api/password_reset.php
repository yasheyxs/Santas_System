<?php
// --- CORS ---
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ======================
   Cargar .env
====================== */
$env = file_exists(__DIR__ . '/.env') ? parse_ini_file(__DIR__ . '/.env') : [];

function env($key, $default = null)
{
    global $env;
    return $env[$key] ?? $default;
}

/* ======================
   DB CONFIG
====================== */
$host = env("DB_HOST");
$port = env("DB_PORT");
$dbname = env("DB_NAME");
$dbuser = env("DB_USER");
$dbpass = env("DB_PASSWORD");

$brevoApiKey = env("BREVO_API_KEY");
$fromEmail = env("MAILER_FROM_ADDRESS");
$fromName = env("MAILER_FROM_NAME");

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$dbuser;password=$dbpass;sslmode=require");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo conectar a la base de datos']);
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
$newPass = strtoupper(bin2hex(random_bytes(4)));
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
