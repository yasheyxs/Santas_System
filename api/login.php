<?php
// Mostrar errores en el navegador para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// --- CORS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// **Nuevo enfoque**: Mostrar el contenido del archivo .env para depuración
$envFilePath = __DIR__ . '/../.env';  // Asegúrate de que esta ruta sea correcta

// Verificar si el archivo .env existe y mostrar su contenido
$envExists = file_exists($envFilePath);

// Cargar las variables de entorno manualmente sin phpdotenv
if ($envExists) {
    $envContent = file_get_contents($envFilePath);
    foreach (explode("\n", $envContent) as $line) {
        // Solo cargar líneas que tengan '='
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));  // Establecer la variable de entorno manualmente
        }
    }
}

// Verificar que las variables de entorno se cargaron correctamente
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

// Si alguna de las variables es false, muestra un error detallado
if (!$host || !$port || !$dbname || !$user || !$password) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Faltan variables de entorno necesarias',
        'details' => [
            'DB_HOST' => $host ? $host : 'no definido',
            'DB_PORT' => $port ? $port : 'no definido',
            'DB_NAME' => $dbname ? $dbname : 'no definido',
            'DB_USER' => $user ? $user : 'no definido',
            'DB_PASSWORD' => $password ? 'definido' : 'no definido'
        ]
    ]);
    exit;
}

// Conexión a la base de datos
try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password;sslmode=require");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar a la base de datos', 'details' => $e->getMessage()]);
    exit;
}

// Obtener datos de la solicitud
$input = json_decode(file_get_contents('php://input'), true);
$telefono = isset($input['telefono']) ? trim($input['telefono']) : '';
$clave = $input['password'] ?? '';

if ($telefono === '' || $clave === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Teléfono y contraseña son obligatorios']);
    exit;
}

try {
    // Consultar el usuario en la base de datos
    $stmt = $conn->prepare("SELECT id, telefono, nombre, email, rol_id, activo, clave_bcrypt FROM usuarios WHERE telefono = :telefono LIMIT 1");
    $stmt->execute([':telefono' => $telefono]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !$usuario['activo']) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }

    // Verificar la contraseña
    if (empty($usuario['clave_bcrypt']) || !password_verify($clave, $usuario['clave_bcrypt'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }

    // Eliminar la contraseña del usuario antes de devolverlo
    unset($usuario['clave_bcrypt']);

    // Generar el token (puedes cambiar a JWT si prefieres)
    $token = bin2hex(random_bytes(32));

    echo json_encode([
        'token' => $token,
        'user' => $usuario,
    ]);
} catch (PDOException $e) {
    // Captura errores en la validación de las credenciales
    http_response_code(500);
    echo json_encode(['error' => 'Error al validar las credenciales', 'details' => $e->getMessage()]);
}
