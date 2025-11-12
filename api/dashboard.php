<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(['error' => 'Método no permitido']);
        exit;
    }

    // --- Parámetros ---
    $dayParam   = $_GET['day']   ?? null;
    $monthParam = $_GET['month'] ?? null;
    $limitUp    = isset($_GET['limitUpcoming']) ? max(1, (int)$_GET['limitUpcoming']) : 3;
    $export     = $_GET['export'] ?? null;

    // --- Rango mensual ---
    if ($monthParam && preg_match('/^\d{4}-\d{2}$/', $monthParam)) {
        [$y, $m] = explode('-', $monthParam);
        $monthStart = "$y-$m-01";
        $monthEnd   = date('Y-m-d', strtotime("$monthStart +1 month"));
    } else {
        $monthStart = date('Y-m-01');
        $monthEnd   = date('Y-m-d', strtotime("$monthStart +1 month"));
    }

    // === 1. Métricas del mes ===
    $metricsSql = "
        SELECT
            COUNT(DISTINCT e.id) AS eventos_mes,
            COALESCE(SUM(ve.cantidad), 0) AS entradas_mes,
            COALESCE(SUM(ve.total), 0) AS recaudacion_mes,
            ROUND(AVG((COALESCE(ve.cantidad,0)*100.0)/NULLIF(e.capacidad,0))) AS ocupacion_promedio
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON e.id = ve.evento_id
        WHERE e.fecha >= :mstart::date AND e.fecha < :mend::date AND e.activo = TRUE
    ";
    $st = $pdo->prepare($metricsSql);
    $st->execute([':mstart' => $monthStart, ':mend' => $monthEnd]);
    $m = $st->fetch() ?: ['eventos_mes' => 0, 'entradas_mes' => 0, 'recaudacion_mes' => 0, 'ocupacion_promedio' => 0];

    $metrics = [
        'eventosMes'        => (int)$m['eventos_mes'],
        'entradasMes'       => (int)$m['entradas_mes'],
        'recaudacionMes'    => (float)$m['recaudacion_mes'],
        'ocupacionPromedio' => $m['ocupacion_promedio'] !== null ? (int)$m['ocupacion_promedio'] : 0,
    ];

    // === 2. Noche en curso ===
    $currentSql = "
        SELECT e.id, e.nombre AS event_name,
               TO_CHAR(e.fecha, 'DD Mon YYYY') AS fecha_txt,
               COALESCE(SUM(ve.cantidad),0) AS entradas_vendidas,
               COALESCE(SUM(ve.total),0) AS recaudacion,
               ROUND((COALESCE(SUM(ve.cantidad),0)*100.0)/NULLIF(e.capacidad,0)) AS ocupacion
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON ve.evento_id = e.id
        WHERE DATE(e.fecha) = CURRENT_DATE
        GROUP BY e.id, e.nombre, e.fecha, e.capacidad
        ORDER BY e.fecha DESC
        LIMIT 1
    ";
    $currentNightRow = $pdo->query($currentSql)->fetch();
    $currentNight = $currentNightRow ? [
        'eventName'        => $currentNightRow['event_name'],
        'fecha'            => $currentNightRow['fecha_txt'],
        'horaInicio'       => '23:00',
        'horaFinEstimada'  => '05:30',
        'entradasVendidas' => (int)$currentNightRow['entradas_vendidas'],
        'recaudacion'      => (float)$currentNightRow['recaudacion'],
        'ocupacion'        => (int)($currentNightRow['ocupacion'] ?? 0),
        'consumoPromedio'  => 0,
        'barrasActivas'    => 0,
        'mesasReservadas'  => 0
    ] : null;

    // === 3. Próximos eventos ===
    $upcomingSql = "
    SELECT 
        e.id,
        e.nombre AS name,  -- 👈 cambiado a name para mantener consistencia
        TO_CHAR(e.fecha, 'YYYY-MM-DD HH24:MI:SS') AS date_text,
        COALESCE(SUM(ve.total),0) AS recaudacion,
        ROUND((COALESCE(SUM(ve.cantidad),0)*100.0)/NULLIF(e.capacidad,0)) AS ocupacion
    FROM eventos e
    LEFT JOIN ventas_entradas ve ON ve.evento_id = e.id
    WHERE e.fecha > NOW() AND e.activo = TRUE
    GROUP BY e.id, e.nombre, e.fecha, e.capacidad
    ORDER BY e.fecha ASC
    LIMIT :limitUp
";
    $up = $pdo->prepare($upcomingSql);
    $up->bindValue(':limitUp', $limitUp, PDO::PARAM_INT);
    $up->execute();

    $upcomingEvents = array_map(function ($r) {
        return [
            'id'          => (string)$r['id'],
            'name'        => $r['name'],        // ✅ ahora coincide con pastEvents
            'date'        => str_replace(' ', 'T', $r['date_text']),
            'recaudacion' => (float)$r['recaudacion'],
            'ocupacion'   => (int)($r['ocupacion'] ?? 0)
        ];
    }, $up->fetchAll() ?: []);



    // === 4. Eventos pasados ===
    $params = [];
    $where  = "e.fecha < NOW()";
    if ($dayParam && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dayParam)) {
        $where = "DATE(e.fecha) = :day::date";
        $params[':day'] = $dayParam;
    }

    $pastSql = "
        SELECT e.id, e.nombre AS name, TO_CHAR(e.fecha, 'YYYY-MM-DD HH24:MI:SS') AS date_text,
               COALESCE(SUM(ve.cantidad),0) AS entradas_vendidas,
               COALESCE(SUM(ve.total),0) AS recaudacion,
               ROUND((COALESCE(SUM(ve.cantidad),0)*100.0)/NULLIF(e.capacidad,0)) AS ocupacion
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON ve.evento_id = e.id
        WHERE $where
        GROUP BY e.id, e.nombre, e.fecha, e.capacidad
        ORDER BY e.fecha DESC
    ";
    $pst = $pdo->prepare($pastSql);
    $pst->execute($params);
    $pastEvents = array_map(fn($r) => [
        'id' => (string)$r['id'],
        'name' => $r['name'],
        'date' => str_replace(' ', 'T', $r['date_text']),
        'entradasVendidas' => (int)$r['entradas_vendidas'],
        'recaudacion' => (float)$r['recaudacion'],
        'ocupacion' => (int)($r['ocupacion'] ?? 0),
        'consumoPromedio' => 0,
        'barrasActivas' => 0,
        'mesasReservadas' => 0
    ], $pst->fetchAll() ?: []);

    // === 5. Resumen mensual ===
    $monthlySql = "
        SELECT TO_CHAR(:mstart::date, 'TMMonth YYYY') AS month_label,
               COUNT(DISTINCT e.id) AS total_eventos,
               COALESCE(SUM(ve.cantidad),0) AS total_entradas,
               COALESCE(SUM(ve.total),0) AS recaudacion,
               ROUND(AVG((COALESCE(ve.cantidad,0)*100.0)/NULLIF(e.capacidad,0))) AS ocupacion_promedio
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON e.id = ve.evento_id
        WHERE e.fecha >= :mstart::date AND e.fecha < :mend::date
    ";
    $ms = $pdo->prepare($monthlySql);
    $ms->execute([':mstart' => $monthStart, ':mend' => $monthEnd]);
    $mr = $ms->fetch();
    $monthlySummary = $mr ? [
        'monthLabel' => trim($mr['month_label']),
        'totalEventos' => (int)$mr['total_eventos'],
        'totalEntradas' => (int)$mr['total_entradas'],
        'recaudacion' => (float)$mr['recaudacion'],
        'ocupacionPromedio' => (int)($mr['ocupacion_promedio'] ?? 0),
        'mejorNoche' => null
    ] : null;

    // === 6. Ventas semanales ===
    $salesStmt = $pdo->query("
        SELECT TO_CHAR(DATE(e.fecha),'Dy') AS name, COALESCE(SUM(ve.total),0) AS ventas
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON e.id = ve.evento_id
        WHERE e.fecha >= NOW() - INTERVAL '7 day'
        GROUP BY 1 ORDER BY MIN(e.fecha)
    ");
    $salesData = array_map(fn($r) => ['name' => $r['name'], 'ventas' => (float)$r['ventas']], $salesStmt->fetchAll() ?: []);

    // === 7. Asistencia semanal ===
    $attendanceStmt = $pdo->query("
        SELECT TO_CHAR(DATE(e.fecha),'Dy') AS name, COALESCE(SUM(ve.cantidad),0) AS asistencia
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON e.id = ve.evento_id
        WHERE e.fecha >= NOW() - INTERVAL '7 day'
        GROUP BY 1 ORDER BY MIN(e.fecha)
    ");
    $attendanceData = array_map(fn($r) => ['name' => $r['name'], 'asistencia' => (int)$r['asistencia']], $attendanceStmt->fetchAll() ?: []);

    // === 8. Actividad reciente ===
    $recentStmt = $pdo->query("
        SELECT e.nombre AS type, TO_CHAR(e.fecha,'DD Mon HH24:MI') AS time
        FROM eventos e ORDER BY e.fecha DESC LIMIT 5
    ");
    $recentActivity = [];
    foreach ($recentStmt->fetchAll() as $i => $r) {
        $recentActivity[] = [
            'id' => $i + 1,
            'type' => $r['type'],
            'description' => 'Evento registrado en el sistema.',
            'time' => $r['time'],
            'color' => 'text-primary'
        ];
    }

    // === 9. Distribución por evento ===
    $categoryStmt = $pdo->query("
        SELECT e.nombre AS name,
               ROUND((COALESCE(SUM(ve.total),0)/NULLIF((SELECT SUM(total) FROM ventas_entradas),0))*100,2) AS value
        FROM eventos e
        LEFT JOIN ventas_entradas ve ON e.id = ve.evento_id
        GROUP BY e.nombre
        ORDER BY value DESC
        LIMIT 5
    ");
    $colors = ['#7C3AED', '#3B82F6', '#22C55E', '#EAB308', '#EF4444'];
    $categoryData = [];
    foreach ($categoryStmt->fetchAll() as $i => $r) {
        $categoryData[] = [
            'name' => $r['name'],
            'value' => (float)$r['value'],
            'color' => $colors[$i % count($colors)]
        ];
    }

    // === Salida final ===
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        'metrics' => $metrics,
        'currentNight' => $currentNight,
        'upcomingEvents' => $upcomingEvents,
        'pastEvents' => $pastEvents,
        'monthlySummary' => $monthlySummary,
        'salesData' => $salesData,
        'attendanceData' => $attendanceData,
        'categoryData' => $categoryData,
        'recentActivity' => $recentActivity
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(['error' => $e->getMessage()]);
}
