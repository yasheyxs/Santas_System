import { useEffect, useMemo, useRef, useState } from "react";
import { KPICard } from "@/components/KPICard";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Activity,
  Package,
  FileSpreadsheet,
  FileText,
  MoonStar,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import CalendarView from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Metrics {
  eventosMes: number;
  entradasMes: number;
  recaudacionMes: number;
  ocupacionPromedio: number;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  entradasVendidas: number;
  recaudacion: number;
  ocupacion: number;
  consumoPromedio: number;
  barrasActivas: number;
  mesasReservadas: number;
}

interface CurrentNight {
  eventName: string;
  fecha: string;
  horaInicio: string;
  horaFinEstimada: string;
  entradasVendidas: number;
  recaudacion: number;
  ocupacion: number;
}

interface MonthlySummary {
  monthLabel: string;
  totalEventos: number;
  totalEntradas: number;
  recaudacion: number;
  ocupacionPromedio: number;
  mejorNoche: string | null;
}

interface DashboardResponse {
  metrics: Metrics;
  currentNight: CurrentNight | null;
  upcomingEvents: EventData[];
  pastEvents: EventData[];
  monthlySummary: MonthlySummary;
}

export default function Dashboard(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [openSummary, setOpenSummary] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);

  const fetchDashboard = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/dashboard.php${query}`
      );
      const json = (await res.json()) as DashboardResponse;
      setData(json);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (v: number) =>
    `$${new Intl.NumberFormat("es-AR").format(v)}`;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const eventsMerged = useMemo(() => {
    if (!data) return [];
    const list: EventData[] = [];
    if (data.currentNight) {
      list.push({
        id: "actual",
        name: data.currentNight.eventName,
        date: new Date().toISOString().split("T")[0],
        entradasVendidas: data.currentNight.entradasVendidas,
        recaudacion: data.currentNight.recaudacion,
        ocupacion: data.currentNight.ocupacion,
        consumoPromedio: 0,
        barrasActivas: 0,
        mesasReservadas: 0,
      });
    }
    return [
      ...list,
      ...data.upcomingEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      ...data.pastEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    ];
  }, [data]);

  // ---- Calendario filtrable ----
  const findEventByDate = (date: Date) => {
    if (!data) return null;
    const target = date.toISOString().split("T")[0];
    return data.pastEvents.find((e) => e.date === target) || null;
  };

  const lastClickRef = useRef<{ date: Date; time: number } | null>(null);
  const handleDayClick = (date: Date) => {
    const now = Date.now();
    const last = lastClickRef.current;
    const sameDay = last && last.date.toDateString() === date.toDateString();
    const isDouble = sameDay && now - (last?.time ?? 0) < 400;

    if (isDouble) {
      const event = findEventByDate(date);
      if (event) {
        setSelectedEvent(event);
        setOpenSummary(true);
      } else {
        fetchDashboard(`?day=${date.toISOString().slice(0, 10)}`);
      }
    }
    lastClickRef.current = { date, time: now };
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Santas
          </h2>
          <p className="text-muted-foreground">
            Seguimiento de ventas, eventos y ocupación
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              window.open("http://localhost:8000/api/dashboard.php?export=csv")
            }
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button
            onClick={() =>
              window.open("http://localhost:8000/api/dashboard.php?export=pdf")
            }
          >
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Eventos del Mes"
          value={data.metrics.eventosMes.toString()}
          icon={Calendar}
        />
        <KPICard
          title="Entradas Vendidas"
          value={data.metrics.entradasMes.toLocaleString("es-AR")}
          icon={TrendingUp}
        />
        <KPICard
          title="Recaudación Mensual"
          value={formatCurrency(data.metrics.recaudacionMes)}
          icon={DollarSign}
        />
        <KPICard
          title="Ocupación Promedio"
          value={`${data.metrics.ocupacionPromedio}%`}
          icon={Activity}
        />
      </div>

      {/* Noche en curso */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MoonStar className="w-5 h-5 text-primary" /> Noche en curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.currentNight ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {data.currentNight.fecha}
                </p>
                <p className="text-xl font-semibold">
                  {data.currentNight.eventName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-lg font-semibold">
                  {data.currentNight.entradasVendidas}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocupación</p>
                <Progress value={data.currentNight.ocupacion} className="h-2" />
                <p className="text-xs mt-1 text-muted-foreground">
                  {data.currentNight.ocupacion}% de capacidad
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay evento activo en este momento.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Calendario de eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Calendario de eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-neutral-900 text-neutral-100 p-3 shadow-sm">
            <CalendarView
              className="w-full dark-calendar"
              locale="es-AR"
              value={calendarDate || new Date()}
              onClickDay={handleDayClick}
              tileContent={({ date }) => {
                const e = findEventByDate(date);
                return e ? (
                  <div className="mt-1 h-1 w-1 mx-auto rounded-full bg-blue-400" />
                ) : null;
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Doble clic sobre un día para ver el resumen de esa noche.
          </p>
        </CardContent>
      </Card>

      {/* Listado de eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Eventos y resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventsMerged.map((e, index) => (
            <div
              key={`${e.id}-${index}`}
              className="flex justify-between items-center border border-border rounded-lg p-3 hover:bg-surface/10 transition-all"
            >
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(e.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(e.recaudacion)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(e);
                    setOpenSummary(true);
                  }}
                >
                  Ver resumen
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal resumen */}
      <Dialog open={openSummary} onOpenChange={setOpenSummary}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? selectedEvent.name : "Resumen de la noche"}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Fecha: {formatDate(selectedEvent.date)}
              </p>
              <p>Entradas: {selectedEvent.entradasVendidas}</p>
              <p>Recaudación: {formatCurrency(selectedEvent.recaudacion)}</p>
              <Progress value={selectedEvent.ocupacion} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Ocupación {selectedEvent.ocupacion}%
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estilo calendario */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .dark-calendar {
            background-color: #111827;
            color: #e5e7eb;
            border-radius: 0.5rem;
          }
          .dark-calendar .react-calendar__tile--now {
            background-color: rgba(147,51,234,0.15) !important;
          }
          .dark-calendar .react-calendar__tile--active {
            background-color: rgba(59,130,246,0.25) !important;
          }
        `,
        }}
      />
    </div>
  );
}
