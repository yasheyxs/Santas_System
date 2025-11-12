<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

date_default_timezone_set('America/Argentina/Cordoba');

$host = "aws-1-us-east-2.pooler.supabase.com";
$port = "5432";
$dbname = "postgres";
$user = "postgres.kxvogvgsgwfvtmidabyp";
$password = "lapicero30!";

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password;sslmode=require");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec("ALTER TABLE IF EXISTS public.ventas_entradas ADD COLUMN IF NOT EXISTS evento_id integer");
    $pdo->exec("ALTER TABLE IF EXISTS public.ventas_entradas ADD COLUMN IF NOT EXISTS incluye_trago boolean DEFAULT false");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $eventosStmt = $pdo->query("SELECT id, nombre, fecha, capacidad FROM eventos WHERE activo = true ORDER BY fecha ASC");
        $entradasStmt = $pdo->query("SELECT id, nombre, descripcion, precio_base FROM entradas WHERE activo = true ORDER BY nombre ASC");
        $ventasStmt = $pdo->query("SELECT evento_id, entrada_id, COALESCE(SUM(cantidad), 0) AS total_vendido FROM ventas_entradas GROUP BY evento_id, entrada_id");

        $eventos = array_map(function ($evento) {
            return [
                'id' => (int)$evento['id'],
                'nombre' => $evento['nombre'],
                'fecha' => $evento['fecha'],
                'capacidad' => isset($evento['capacidad']) ? (int)$evento['capacidad'] : null,
            ];
        }, $eventosStmt->fetchAll() ?: []);

        $entradas = array_map(function ($entrada) {
            return [
                'id' => (int)$entrada['id'],
                'nombre' => $entrada['nombre'],
                'descripcion' => $entrada['descripcion'],
                'precio_base' => isset($entrada['precio_base']) ? (float)$entrada['precio_base'] : 0,
            ];
        }, $entradasStmt->fetchAll() ?: []);

        $ventas = array_map(function ($venta) {
            return [
                'evento_id' => $venta['evento_id'] !== null ? (int)$venta['evento_id'] : null,
                'entrada_id' => (int)$venta['entrada_id'],
                'total_vendido' => isset($venta['total_vendido']) ? (int)$venta['total_vendido'] : 0,
            ];
        }, $ventasStmt->fetchAll() ?: []);

        echo json_encode([
            'eventos' => $eventos,
            'entradas' => $entradas,
            'ventas' => $ventas,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || !isset($input['entrada_id']) || !isset($input['cantidad'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Los campos entrada_id y cantidad son obligatorios.']);
            exit;
        }

        $entradaId = (int)$input['entrada_id'];
        $cantidad = (int)$input['cantidad'];
        $cantidad = $cantidad > 0 ? $cantidad : 1;
        $eventoId = isset($input['evento_id']) ? (int)$input['evento_id'] : null;
        $incluyeTrago = isset($input['incluye_trago']) ? (bool)$input['incluye_trago'] : false;

        // Obtener precio base de la entrada
        $entradaStmt = $pdo->prepare("SELECT precio_base FROM entradas WHERE id = :id AND activo = true");
        $entradaStmt->execute([':id' => $entradaId]);
        $entrada = $entradaStmt->fetch();

        if (!$entrada) {
            http_response_code(404);
            echo json_encode(['error' => 'Entrada no encontrada o inactiva.']);
            exit;
        }

        $precioUnitario = (float)$entrada['precio_base'];
        $total = $cantidad * $precioUnitario;

        // 🔧 Inserta la venta sin incluir total, ya que es una columna generada
        $insert = $pdo->prepare("
    INSERT INTO ventas_entradas (entrada_id, evento_id, cantidad, precio_unitario, incluye_trago)
    VALUES (:entrada_id, :evento_id, :cantidad, :precio_unitario, :incluye_trago)
    RETURNING id, entrada_id, evento_id, cantidad, precio_unitario, incluye_trago, total, fecha_venta
");

        $insert->execute([
            ':entrada_id' => $entradaId,
            ':evento_id' => $eventoId,
            ':cantidad' => $cantidad,
            ':precio_unitario' => $precioUnitario,
            ':incluye_trago' => $incluyeTrago
        ]);

        $venta = $insert->fetch();

        echo json_encode([
            'id' => (int)$venta['id'],
            'entrada_id' => (int)$venta['entrada_id'],
            'evento_id' => $venta['evento_id'] !== null ? (int)$venta['evento_id'] : null,
            'cantidad' => (int)$venta['cantidad'],
            'precio_unitario' => (float)$venta['precio_unitario'],
            'incluye_trago' => (bool)$venta['incluye_trago'],
            'fecha_venta' => $venta['fecha_venta'],
            'total' => (float)$venta['total']
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
