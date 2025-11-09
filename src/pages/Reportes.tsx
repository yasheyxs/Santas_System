import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reportes = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Reportes</h2>
        <p className="text-muted-foreground">Genera y descarga reportes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-neon transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">Reporte de Ventas</h3>
                <p className="text-sm text-muted-foreground">Ventas del mes actual</p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary shadow-neon hover:shadow-neon-intense">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-neon transition-all">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent" />
              <div>
                <h3 className="font-bold text-foreground">Reporte de Inventario</h3>
                <p className="text-sm text-muted-foreground">Stock y movimientos</p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary shadow-neon hover:shadow-neon-intense">
              <Download className="w-4 h-4 mr-2" />
              Descargar Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reportes;
