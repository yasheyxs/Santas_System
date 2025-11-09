import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCog, Clock, DollarSign } from "lucide-react";

const mockPersonal = [
  { id: 1, nombre: "Juan Pérez", rol: "Bartender", turno: "Noche", estado: "activo", propinas: 850 },
  { id: 2, nombre: "María González", rol: "Mesera", turno: "Noche", estado: "activo", propinas: 720 },
  { id: 3, nombre: "Carlos Ramírez", rol: "Seguridad", turno: "Noche", estado: "activo", propinas: 0 },
  { id: 4, nombre: "Ana Martínez", rol: "Cajera", turno: "Tarde", estado: "descanso", propinas: 0 },
  { id: 5, nombre: "Luis Torres", rol: "DJ", turno: "Noche", estado: "activo", propinas: 1200 },
];

const Personal = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Personal</h2>
        <p className="text-muted-foreground">Gestión de empleados y turnos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPersonal.map((empleado) => (
          <Card key={empleado.id} className="bg-gradient-card border-border/50 shadow-card hover:shadow-neon transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{empleado.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{empleado.rol}</p>
                </div>
                <Badge className={empleado.estado === "activo" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                  {empleado.estado}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-foreground">Turno: {empleado.turno}</span>
                </div>
                {empleado.propinas > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span className="text-foreground">Propinas: ${empleado.propinas}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Personal;
