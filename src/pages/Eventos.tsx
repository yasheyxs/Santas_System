import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Music, Users, Clock, MapPin } from "lucide-react";

const mockEventos = [
  {
    id: 1,
    nombre: "Noche de Electrónica",
    fecha: "2025-11-15",
    hora: "22:00",
    dj: "DJ Pulse",
    capacidad: 500,
    reservados: 380,
    estado: "confirmado",
    ubicacion: "Salón Principal"
  },
  {
    id: 2,
    nombre: "Fiesta Reggaeton",
    fecha: "2025-11-16",
    hora: "23:00",
    dj: "DJ Latino",
    capacidad: 450,
    reservados: 420,
    estado: "confirmado",
    ubicacion: "Salón Principal"
  },
  {
    id: 3,
    nombre: "VIP Exclusive Night",
    fecha: "2025-11-22",
    hora: "21:00",
    dj: "DJ Exclusive",
    capacidad: 200,
    reservados: 145,
    estado: "pendiente",
    ubicacion: "Área VIP"
  },
  {
    id: 4,
    nombre: "Rock en Español",
    fecha: "2025-11-23",
    hora: "22:30",
    dj: "Live Band",
    capacidad: 400,
    reservados: 280,
    estado: "confirmado",
    ubicacion: "Salón Principal"
  },
];

const Eventos = () => {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "pendiente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "finalizado":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-destructive";
    if (porcentaje >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Eventos y Reservas</h2>
          <p className="text-muted-foreground">Gestiona eventos y reservaciones</p>
        </div>
        <Button className="bg-gradient-primary shadow-neon hover:shadow-neon-intense transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Calendario visual simplificado */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Calendario de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEventos.map((evento) => {
              const ocupacion = Math.round((evento.reservados / evento.capacidad) * 100);
              return (
                <Card key={evento.id} className="bg-surface-elevated border-border/50 hover:shadow-neon transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg text-foreground">{evento.nombre}</h3>
                      <Badge className={getEstadoBadge(evento.estado)}>
                        {evento.estado}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(evento.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {evento.hora}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Music className="w-4 h-4 text-accent" />
                        {evento.dj}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-accent" />
                        {evento.ubicacion}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Ocupación</span>
                        <span className={`text-sm font-bold ${getOcupacionColor(ocupacion)}`}>
                          {ocupacion}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-darker rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-primary shadow-neon transition-all"
                          style={{ width: `${ocupacion}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {evento.reservados} / {evento.capacidad}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary">
                        Ver detalles
                      </Button>
                      <Button size="sm" className="flex-1 bg-primary/20 text-primary hover:bg-primary/30">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-neon">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos Este Mes</p>
                <p className="text-2xl font-bold text-foreground">{mockEventos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shadow-pink">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reservados</p>
                <p className="text-2xl font-bold text-foreground">1,225</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Music className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximo Evento</p>
                <p className="text-lg font-bold text-foreground">En 2 días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Eventos;
