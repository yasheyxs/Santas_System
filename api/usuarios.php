<?php
// === CORS ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// === CONEXIÓN A SUPABASE ===
$host = "aws-1-us-east-2.pooler.supabase.com";
$port = "5432";
$dbname = "postgres";
$user = "postgres.kxvogvgsgwfvtmidabyp";
$password = "lapicero30!";

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password;sslmode=require");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al conectar a la base: ' . $e->getMessage()]);
    exit;
}

// === DETERMINAR MÉTODO ===
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // 🔹 LISTAR USUARIOS
    case 'GET':
        $stmt = $conn->query("SELECT * FROM usuarios ORDER BY id ASC");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios);
        break;

    // 🔹 CREAR USUARIO
    case 'POST':
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input || empty($input['nombre']) || empty($input['telefono']) || empty($input['rolId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos obligatorios.']);
            exit;
        }

        $nombre = $input['nombre'];
        $telefono = $input['telefono'];
        $email = $input['email'] ?? null;
        $rolId = $input['rolId'];
        $activo = isset($input['activo']) ? (int)$input['activo'] : 1;

        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, telefono, email, rol_id, activo, fecha_creacion)
                                VALUES (:nombre, :telefono, :email, :rol_id, :activo, NOW())
                                RETURNING *");
        $stmt->execute([
            ':nombre' => $nombre,
            ':telefono' => $telefono,
            ':email' => $email,
            ':rol_id' => $rolId,
            ':activo' => $activo,
        ]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($usuario);
        break;

    // 🔹 ACTUALIZAR USUARIO
    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el parámetro id']);
            exit;
        }
        $id = (int)$_GET['id'];
        $input = json_decode(file_get_contents("php://input"), true);

        $nombre = $input['nombre'] ?? null;
        $telefono = $input['telefono'] ?? null;
        $email = $input['email'] ?? null;
        $rolId = $input['rolId'] ?? null;
        $activo = isset($input['activo']) ? (int)$input['activo'] : 1;

        $stmt = $conn->prepare("UPDATE usuarios 
                                SET nombre = :nombre, telefono = :telefono, email = :email, rol_id = :rol_id, activo = :activo
                                WHERE id = :id RETURNING *");
        $stmt->execute([
            ':nombre' => $nombre,
            ':telefono' => $telefono,
            ':email' => $email,
            ':rol_id' => $rolId,
            ':activo' => $activo,
            ':id' => $id
        ]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($usuario);
        break;

    // 🔹 ELIMINAR USUARIO
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el parámetro id']);
            exit;
        }
        $id = (int)$_GET['id'];
        $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['message' => 'Usuario eliminado correctamente']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
