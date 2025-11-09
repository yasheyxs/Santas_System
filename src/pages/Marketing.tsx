import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Star } from "lucide-react";

const topClientes = [
  { nombre: "María López", visitas: 32, gasto: 68000 },
  { nombre: "Carlos Méndez", visitas: 24, gasto: 45000 },
  { nombre: "Ana Rodríguez", visitas: 18, gasto: 32500 },
];

const Marketing = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Marketing</h2>
        <p className="text-muted-foreground">Promociones y clientes destacados</p>
      </div>

      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-accent" />
            Top Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topClientes.map((cliente, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold shadow-neon">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cliente.nombre}</p>
                    <p className="text-sm text-muted-foreground">{cliente.visitas} visitas</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary">${cliente.gasto.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketing;
