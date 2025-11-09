import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockInventario = [
  { id: 1, nombre: "Cerveza Nacional", stock: 450, minimo: 200, precio: 25, precioVenta: 45, estado: "ok" },
  { id: 2, nombre: "Cerveza Importada", stock: 180, minimo: 150, precio: 45, precioVenta: 75, estado: "bajo" },
  { id: 3, nombre: "Vodka Premium", stock: 45, minimo: 80, precio: 800, precioVenta: 1800, estado: "critico" },
  { id: 4, nombre: "Tequila Reposado", stock: 120, minimo: 60, precio: 950, precioVenta: 2200, estado: "ok" },
  { id: 5, nombre: "Whisky Especial", stock: 35, minimo: 40, precio: 1200, precioVenta: 2800, estado: "critico" },
  { id: 6, nombre: "Ron Añejo", stock: 90, minimo: 50, precio: 650, precioVenta: 1500, estado: "ok" },
];

const Inventario = () => {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ok":
        return { className: "bg-green-500/20 text-green-400 border-green-500/50", label: "Stock OK" };
      case "bajo":
        return { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", label: "Stock Bajo" };
      case "critico":
        return { className: "bg-destructive/20 text-destructive border-destructive/50", label: "Crítico" };
      default:
        return { className: "", label: "" };
    }
  };

  const totalValor = mockInventario.reduce((acc, item) => acc + (item.stock * item.precio), 0);
  const productosCriticos = mockInventario.filter(item => item.estado === "critico").length;
  const productosOk = mockInventario.filter(item => item.estado === "ok").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Inventario</h2>
          <p className="text-muted-foreground">Control de stock y productos</p>
        </div>
        <Button className="bg-gradient-primary shadow-neon hover:shadow-neon-intense transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-neon">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">${totalValor.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Crítico</p>
                <p className="text-2xl font-bold text-destructive">{productosCriticos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Stock OK</p>
                <p className="text-2xl font-bold text-green-400">{productosOk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de inventario */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="w-5 h-5 text-primary" />
            Lista de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Stock Actual</TableHead>
                <TableHead className="text-center">Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Precio Compra</TableHead>
                <TableHead className="text-right">Precio Venta</TableHead>
                <TableHead className="text-right">Margen</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventario.map((producto) => {
                const badge = getEstadoBadge(producto.estado);
                const margen = ((producto.precioVenta - producto.precio) / producto.precio * 100).toFixed(0);
                
                return (
                  <TableRow key={producto.id} className="border-border hover:bg-surface-elevated/50">
                    <TableCell className="font-medium text-foreground">{producto.nombre}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${
                        producto.stock < producto.minimo ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {producto.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{producto.minimo}</TableCell>
                    <TableCell>
                      <Badge className={badge.className}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-foreground">${producto.precio}</TableCell>
                    <TableCell className="text-right text-primary font-bold">${producto.precioVenta}</TableCell>
                    <TableCell className="text-right text-green-400 font-medium">+{margen}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary hover:border-primary">
                          Ingresar
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent hover:border-accent">
                          Egresar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventario;
