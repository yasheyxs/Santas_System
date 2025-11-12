import React, { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle, Loader2, Printer, Ticket } from "lucide-react";
import { StatCounter } from "@/components/StatCounter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/services/api";

interface EventOption {
  id: number;
  name: string;
  capacity: number;
  date: string | null;
}

interface EntradaOption {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
}

interface VentaResumen {
  evento_id: number | null;
  entrada_id: number;
  total_vendido: number;
}

interface VentaEntradasResponse {
  eventos: {
    id: number;
    nombre: string;
    fecha: string | null;
    capacidad: number;
  }[];
  entradas: {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
  }[];
  ventas: VentaResumen[];
}

type StatCounterVariant = "primary" | "accent" | "success" | "default";

type VentasPorEvento = Record<string, Record<number, number>>;

export default function Entradas() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [entradas, setEntradas] = useState<EntradaOption[]>([]);
  const [ventasPorEvento, setVentasPorEvento] = useState<VentasPorEvento>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [sellingEntradaId, setSellingEntradaId] = useState<number | null>(null);
  const [cantidadVenta, setCantidadVenta] = useState<number>(1);
  const [incluyeTrago, setIncluyeTrago] = useState<boolean>(false);
  const [registrandoVenta, setRegistrandoVenta] = useState<boolean>(false);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
    []
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<VentaEntradasResponse>(
          "/venta_entradas.php"
        );

        const mappedEvents = data.eventos.map((evento) => ({
          id: evento.id,
          name: evento.nombre,
          capacity: evento.capacidad,
          date: evento.fecha,
        }));

        const mappedEntradas = data.entradas.map((entrada) => ({
          id: entrada.id,
          nombre: entrada.nombre,
          descripcion: entrada.descripcion,
          precio_base: Number(entrada.precio_base),
        }));

        const ventasMap: VentasPorEvento = {};
        data.ventas.forEach((venta) => {
          const eventKey =
            venta.evento_id !== null ? String(venta.evento_id) : "sin_evento";
          if (!ventasMap[eventKey]) {
            ventasMap[eventKey] = {};
          }
          ventasMap[eventKey][venta.entrada_id] = Number(
            venta.total_vendido ?? 0
          );
        });

        setEvents(mappedEvents);
        setEntradas(mappedEntradas);
        setVentasPorEvento(ventasMap);

        if (mappedEvents.length > 0) {
          setSelectedEvent((prev) => prev || String(mappedEvents[0].id));
        }
      } catch (error) {
        console.error("Error al cargar venta de entradas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos y entradas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const selectedEventData = events.find(
    (event) => String(event.id) === selectedEvent
  );
  const currentSales = selectedEvent
    ? ventasPorEvento[selectedEvent] ?? {}
    : {};

  const totalEntradas = Object.values(currentSales).reduce(
    (acc, value) => acc + value,
    0
  );

  const maxCapacity = selectedEventData?.capacity ?? 0;
  const variants: StatCounterVariant[] = ["primary", "accent", "success"];

  const handleCloseEvent = () => {
    if (!selectedEvent) {
      toast({
        title: "Seleccioná un evento",
        description: "Debes elegir un evento antes de cerrarlo.",
      });
      return;
    }
    setShowSummary(true);
  };

  const handleConfirmClose = () => {
    console.log("Evento cerrado:", {
      evento: selectedEventData?.name,
      resumen: currentSales,
      total: totalEntradas,
    });
    setShowSummary(false);
  };

  const abrirVenta = (entradaId: number) => {
    if (!selectedEvent) {
      toast({
        title: "Seleccioná un evento",
        description: "Debes elegir un evento antes de registrar una venta.",
        variant: "destructive",
      });
      return;
    }

    setSellingEntradaId(entradaId);
    setCantidadVenta(1);
    setIncluyeTrago(false);
  };

  const cerrarVenta = () => {
    setSellingEntradaId(null);
    setCantidadVenta(1);
    setIncluyeTrago(false);
  };

  const registrarVenta = async () => {
    if (!selectedEvent || sellingEntradaId === null) {
      toast({
        title: "Datos incompletos",
        description:
          "Seleccioná un evento y un tipo de entrada para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(cantidadVenta) || cantidadVenta <= 0) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser al menos 1.",
        variant: "destructive",
      });
      return;
    }

    const entrada = entradas.find((item) => item.id === sellingEntradaId);
    if (!entrada) {
      toast({
        title: "Entrada no encontrada",
        description: "No se pudo encontrar el tipo de entrada seleccionado.",
        variant: "destructive",
      });
      return;
    }

    setRegistrandoVenta(true);

    try {
      const payload = {
        evento_id: Number(selectedEvent),
        entrada_id: sellingEntradaId,
        cantidad: cantidadVenta,
        incluye_trago: incluyeTrago,
      };

      const { data } = await api.post("/venta_entradas.php", payload);
      const eventKey =
        data?.evento_id !== undefined && data?.evento_id !== null
          ? String(data.evento_id)
          : String(selectedEvent);
      const entradaKey = data?.entrada_id ?? sellingEntradaId;
      const cantidadRegistrada = data?.cantidad ?? cantidadVenta;

      setVentasPorEvento((prev) => {
        const previousEventSales = prev[eventKey] ?? {};
        return {
          ...prev,
          [eventKey]: {
            ...previousEventSales,
            [entradaKey]:
              (previousEventSales[entradaKey] ?? 0) + cantidadRegistrada,
          },
        };
      });

      toast({
        title: "Venta registrada",
        description: `${cantidadRegistrada} ${
          cantidadRegistrada === 1 ? "entrada" : "entradas"
        } de ${entrada.nombre} registradas correctamente.`,
      });

      cerrarVenta();
    } catch (error) {
      console.error("Error al registrar venta:", error);
      toast({
        title: "No se pudo registrar la venta",
        description: "Reintentá en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setRegistrandoVenta(false);
    }
  };

  const ventaAbierta = sellingEntradaId !== null;
  const entradaSeleccionada = entradas.find(
    (item) => item.id === sellingEntradaId
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Control de Entradas - Santas
          </h1>
          <p className="text-muted-foreground">
            Gestión en tiempo real de ventas por evento
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary" />
          <span className="font-medium text-foreground">Evento:</span>
        </div>
        <Select
          value={selectedEvent}
          onValueChange={(value) => setSelectedEvent(value)}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Seleccionar evento" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={String(event.id)}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        {loading ? (
          <div className="flex items-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando...
          </div>
        ) : selectedEvent ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Ventas Totales
              </p>
              <p className="text-5xl font-bold text-primary">
                {numberFormatter.format(totalEntradas)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="h-4 w-4" />
                Entradas vendidas para {selectedEventData?.name ?? "el evento"}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground">Capacidad Máxima</p>
              <p className="text-2xl font-semibold text-foreground">
                {maxCapacity > 0 ? numberFormatter.format(maxCapacity) : "—"}
              </p>
              <div className="mt-2">
                <div className="w-full md:w-48 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500"
                    style={{
                      width: maxCapacity
                        ? `${Math.min(
                            (totalEntradas / maxCapacity) * 100,
                            100
                          )}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            Seleccione un evento para comenzar
          </p>
        )}
      </div>

      {selectedEvent && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {entradas.map((entrada, index) => (
            <StatCounter
              key={entrada.id}
              title={entrada.nombre}
              subtitle={
                entrada.descripcion ||
                `Precio base: ${currencyFormatter.format(entrada.precio_base)}`
              }
              count={currentSales[entrada.id] ?? 0}
              variant={variants[index % variants.length]}
              actionLabel="Vender entrada"
              onAction={() => abrirVenta(entrada.id)}
            />
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleCloseEvent}
            disabled={!selectedEvent}
            className="px-12 py-6 bg-foreground text-background text-lg font-semibold hover:bg-foreground/90"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Cerrar Evento
          </Button>
        </div>
      )}

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resumen del Evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Evento:</strong> {selectedEventData?.name}
            </p>
            <p>
              <strong>Total vendidas:</strong>{" "}
              {numberFormatter.format(totalEntradas)}
            </p>
            <div className="pt-2 space-y-1">
              <p className="font-semibold text-foreground">
                Detalle por entrada:
              </p>
              {entradas.map((entrada) => (
                <div key={entrada.id} className="flex justify-between">
                  <span>{entrada.nombre}</span>
                  <span>
                    {numberFormatter.format(currentSales[entrada.id] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmClose}
              className="bg-primary text-white"
            >
              Confirmar Cierre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={ventaAbierta}
        onOpenChange={(open) => {
          if (!open) {
            cerrarVenta();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Evento seleccionado
              </p>
              <p className="font-semibold text-foreground">
                {selectedEventData?.name ?? "Sin evento"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Tipo de entrada</p>
              <p className="font-semibold text-foreground">
                {entradaSeleccionada?.nombre ?? "Sin selección"}
              </p>
              {entradaSeleccionada && (
                <p className="text-sm text-muted-foreground">
                  Precio base:{" "}
                  {currencyFormatter.format(entradaSeleccionada.precio_base)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                value={cantidadVenta}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isNaN(value)) {
                    setCantidadVenta(1);
                  } else {
                    setCantidadVenta(value <= 0 ? 1 : Math.floor(value));
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluye-trago"
                checked={incluyeTrago}
                onCheckedChange={(checked) => setIncluyeTrago(Boolean(checked))}
              />
              <Label htmlFor="incluye-trago">Incluye trago gratis</Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={cerrarVenta}
              disabled={registrandoVenta}
            >
              Cancelar
            </Button>
            <Button onClick={registrarVenta} disabled={registrandoVenta}>
              {registrandoVenta ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                  Registrando...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" /> Imprimir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
