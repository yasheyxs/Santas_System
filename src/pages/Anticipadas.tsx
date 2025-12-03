import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  Loader2,
  Printer,
  Search,
  Ticket,
  UserRoundPlus,
  CalendarDays,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AnticipadaResponse {
  id: number;
  nombre: string;
  dni?: string | null;
  entrada_id: number;
  evento_id?: number | null;
  cantidad?: number | null;
  incluye_trago?: boolean;
  entrada_nombre?: string | null;
  entrada_precio?: number | null;
  evento_nombre?: string | null;
}

interface AnticipadaItem {
  id: number;
  nombre: string;
  dni: string;
  entradaNombre: string;
  cantidad: number;
  incluyeTrago: boolean;
  eventoNombre: string;
}

interface EntradaOption {
  id: number;
  nombre: string;
  precio_base?: number | null;
}

interface EventoOption {
  id: number;
  nombre: string;
  fecha: string | null;
}

const normalizeEntradaName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const mapAnticipada = (item: AnticipadaResponse): AnticipadaItem => ({
  id: Number(item.id),
  nombre: item.nombre ?? "Sin nombre",
  dni: item.dni ?? "-",
  entradaNombre: item.entrada_nombre ?? "Anticipada",
  cantidad: Number(item.cantidad ?? 1),
  incluyeTrago: Boolean(item.incluye_trago),
  eventoNombre: item.evento_nombre ?? "—",
});

export default function Anticipadas() {
  const [anticipadas, setAnticipadas] = useState<AnticipadaItem[]>([]);
  const [entradasAnticipadas, setEntradasAnticipadas] = useState<
    EntradaOption[]
  >([]);
  const [eventos, setEventos] = useState<EventoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    entradaId: "",
    eventoId: "",
    cantidad: 1,
    incluyeTrago: false,
  });

  const fetchAnticipadas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AnticipadaResponse[]>("/anticipadas.php");
      const mapped: AnticipadaItem[] = (data ?? []).map(mapAnticipada);
      setAnticipadas(mapped);
    } catch (error) {
      console.error("Error cargando anticipadas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las anticipadas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    setOptionsLoading(true);
    try {
      const [entradasRes, eventosRes] = await Promise.all([
        api.get<EntradaOption[]>("/entradas.php"),
        api.get<EventoOption[]>("/eventos.php?upcoming=1"),
      ]);

      const anticipadasOptions = (entradasRes.data ?? []).filter(
        (entrada) => normalizeEntradaName(entrada.nombre) === "anticipada"
      );
      setEntradasAnticipadas(anticipadasOptions);

      if (!formData.entradaId && anticipadasOptions.length > 0) {
        setFormData((prev) => ({
          ...prev,
          entradaId: String(anticipadasOptions[0].id),
        }));
      }
      const mappedEventos = (eventosRes.data ?? []).map((evento) => ({
        id: Number(evento.id),
        nombre: evento.nombre,
        fecha: evento.fecha,
      }));
      setEventos(mappedEventos);
    } catch (error) {
      console.error("Error cargando opciones de anticipadas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos o entradas.",
        variant: "destructive",
      });
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnticipadas();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAnticipadas = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return anticipadas;
    return anticipadas.filter((item) =>
      `${item.nombre} ${item.dni} ${item.eventoNombre} ${item.entradaNombre}`
        .toLowerCase()
        .includes(query)
    );
  }, [anticipadas, search]);

  const totalPorImprimir = anticipadas.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const handlePrint = async (itemId: number) => {
    setPrintingId(itemId);
    try {
      const { data } = await api.post("/anticipadas.php", {
        accion: "imprimir",
        id: itemId,
      });

      const mensaje =
        typeof data?.mensaje === "string"
          ? data.mensaje
          : "Ticket enviado a impresión.";

      setAnticipadas((prev) => prev.filter((item) => item.id !== itemId));
      toast({
        title: "Ticket impreso",
        description: mensaje,
      });
    } catch (error) {
      console.error("Error al imprimir anticipada:", error);
      toast({
        title: "No se pudo imprimir",
        description: "Reintentá en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setPrintingId(null);
    }
  };

  const handleCreate = async () => {
    if (!formData.nombre.trim() || !formData.entradaId) {
      toast({
        title: "Datos incompletos",
        description: "Ingresá el nombre y seleccioná la entrada anticipada.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data } = await api.post("/anticipadas.php", {
        accion: "crear",
        nombre: formData.nombre.trim(),
        dni: formData.dni.trim(),
        entrada_id: Number(formData.entradaId),
        evento_id: formData.eventoId ? Number(formData.eventoId) : null,
        cantidad: formData.cantidad,
        incluye_trago: formData.incluyeTrago,
      });

      const nueva = data?.anticipada as AnticipadaResponse | undefined;

      if (nueva) {
        setAnticipadas((prev) => [mapAnticipada(nueva), ...prev]);
        toast({
          title: "Anticipada registrada",
          description: data?.mensaje ?? "Se agregó al listado.",
        });
        setFormData((prev) => ({
          ...prev,
          nombre: "",
          dni: "",
          cantidad: 1,
          incluyeTrago: false,
        }));
      }
    } catch (error) {
      console.error("Error al registrar anticipada:", error);
      toast({
        title: "No se pudo registrar",
        description: "Revisá los datos e intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedEntrada = entradasAnticipadas.find(
    (entrada) => String(entrada.id) === formData.entradaId
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Anticipadas
          </h1>
          <p className="text-muted-foreground">
            Gestioná las compras anticipadas y enviá los tickets a impresión.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRoundPlus className="h-5 w-5 text-primary" />
              Registrar nueva anticipada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre y apellido</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: María Pérez"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  placeholder="Opcional"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Entrada anticipada</Label>
                <Select
                  value={formData.entradaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, entradaId: value })
                  }
                  disabled={optionsLoading || entradasAnticipadas.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="No hay entradas anticipadas" />
                  </SelectTrigger>
                  <SelectContent>
                    {entradasAnticipadas.map((entrada) => (
                      <SelectItem key={entrada.id} value={String(entrada.id)}>
                        {entrada.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEntrada?.precio_base !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Precio actual: ${selectedEntrada.precio_base}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min={1}
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Evento</Label>
                <Select
                  value={formData.eventoId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      eventoId: value === "none" ? "" : value,
                    })
                  }
                  disabled={optionsLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sin evento asignado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin evento asignado</SelectItem>
                    {eventos.map((evento) => (
                      <SelectItem key={evento.id} value={String(evento.id)}>
                        {evento.nombre}
                        {evento.fecha
                          ? ` — ${new Date(evento.fecha).toLocaleDateString(
                              "es-AR"
                            )}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium">Incluye trago</p>
                  <p className="text-sm text-muted-foreground">
                    Agregá el beneficio al ticket impreso.
                  </p>
                </div>
                <Switch
                  checked={formData.incluyeTrago}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, incluyeTrago: checked })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                disabled={creating || optionsLoading || !formData.entradaId}
                className="min-w-[200px]"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Registrar anticipada"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              Resumen rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Anticipadas cargadas
              </p>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                <p className="text-2xl font-bold">{anticipadas.length}</p>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Tickets a imprimir
              </p>
              <p className="text-2xl font-bold">{totalPorImprimir}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">
                Filtrar listado
              </p>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, DNI o evento"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold">Pendientes de impresión</p>
            <p className="text-sm text-muted-foreground">
              Lista de personas con compras anticipadas listas para entregar.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center text-muted-foreground text-sm py-10">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando
            anticipadas...
          </div>
        ) : filteredAnticipadas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6">
            No hay anticipadas para mostrar.
          </p>
        ) : (
          <ScrollArea className="h-[480px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnticipadas.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {item.nombre}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anticipada registrada
                      </p>
                    </TableCell>
                    <TableCell>{item.dni}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.entradaNombre}</Badge>
                        {item.incluyeTrago && (
                          <Badge variant="outline">+ Trago</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {item.cantidad}
                    </TableCell>
                    <TableCell>{item.eventoNombre}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={printingId === item.id}
                        onClick={() => handlePrint(item.id)}
                      >
                        {printingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
