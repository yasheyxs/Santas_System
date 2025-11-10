import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import {
  Ticket,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ========================
// Tipos
// ========================
type Variant = "primary" | "accent" | "success" | "warning" | "default";

interface Metrics {
  entradas: number | null;
  recaudacion: number | null;
  ocupacion: number | null;
  stock: number | null;
}

interface EventItem {
  id?: string | number;
  title: string;
  date: string;
  ocupacion: number;
}

type StockStatus = "bajo" | "ok" | "critico";

interface StockItem {
  id?: string | number;
  product: string;
  stock: number;
  min: number;
  status: StockStatus;
}

interface GlobalSummary {
  totalEntradas: number | null;
  totalRecaudacion: number | null;
  ocupacionPromedio: number | null;
}

// (Opcional) Estructura de respuesta del backend
interface DashboardResponse {
  metrics: Metrics;
  events: EventItem[];
  stock: StockItem[];
  globalSummary: GlobalSummary;
}

export default function Index() {
  const [metrics, setMetrics] = useState<Metrics>({
    entradas: null,
    recaudacion: null,
    ocupacion: null,
    stock: null,
  });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [globalSummary, setGlobalSummary] = useState<GlobalSummary>({
    totalEntradas: null,
    totalRecaudacion: null,
    ocupacionPromedio: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Ejemplo: Cargar datos reales del backend
    // fetch("/api/dashboard")
    //   .then((res) => res.json() as Promise<DashboardResponse>)
    //   .then((data) => {
    //     setMetrics(data.metrics ?? {});
    //     setEvents(Array.isArray(data.events) ? data.events : []);
    //     setStockItems(Array.isArray(data.stock) ? data.stock : []);
    //     setGlobalSummary(data.globalSummary ?? {
    //       totalEntradas: null,
    //       totalRecaudacion: null,
    //       ocupacionPromedio: null,
    //     });
    //   })
    //   .catch((err) => console.error("Error al cargar dashboard:", err))
    //   .finally(() => setLoading(false));

    setLoading(false); // eliminar cuando se integre la API real
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Dashboard Santas
          </h1>
          <p className="text-muted-foreground text-lg">
            Control en tiempo real de todas las operaciones
          </p>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Entradas Vendidas"
          value={
            loading ? "—" : metrics.entradas !== null ? metrics.entradas : "—"
          }
          icon={Ticket}
          variant={"primary" as Variant}
        />
        <MetricCard
          title="Recaudación Estimada"
          value={
            loading
              ? "—"
              : metrics.recaudacion !== null
                ? `$${(metrics.recaudacion / 1000).toFixed(1)}K`
                : "—"
          }
          icon={DollarSign}
          variant={"accent" as Variant}
        />
        <MetricCard
          title="Ocupación"
          value={
            loading
              ? "—"
              : metrics.ocupacion !== null
                ? `${metrics.ocupacion}%`
                : "—"
          }
          icon={TrendingUp}
          variant={"success" as Variant}
        />
        <MetricCard
          title="Alertas de Stock"
          value={loading ? "—" : metrics.stock !== null ? metrics.stock : "—"}
          icon={AlertCircle}
          variant={
            metrics.stock && metrics.stock > 0
              ? ("warning" as Variant)
              : ("default" as Variant)
          }
        />
      </div>

      {/* EVENTOS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : events.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay eventos próximos
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id ?? `${event.title}-${event.date}`}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {event.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {event.ocupacion}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* RESUMEN GLOBAL */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Resumen Global - Santas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Cargando datos globales...
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Entradas Hoy
                </p>
                <p className="text-4xl font-bold text-primary">
                  {globalSummary.totalEntradas ?? "—"}
                </p>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Recaudación Total
                </p>
                <p className="text-4xl font-bold text-accent">
                  {globalSummary.totalRecaudacion !== null
                    ? `$${(globalSummary.totalRecaudacion / 1000).toFixed(1)}K`
                    : "—"}
                </p>
              </div>
              <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Ocupación Promedio
                </p>
                <p className="text-4xl font-bold text-success">
                  {globalSummary.ocupacionPromedio !== null
                    ? `${globalSummary.ocupacionPromedio}%`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
