import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, CreditCard, Banknote, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const productos = [
  { id: 1, nombre: "Cerveza Nacional", precio: 45, categoria: "Bebidas" },
  { id: 2, nombre: "Cerveza Importada", precio: 75, categoria: "Bebidas" },
  { id: 3, nombre: "Vodka Shot", precio: 65, categoria: "Bebidas" },
  { id: 4, nombre: "Tequila Shot", precio: 70, categoria: "Bebidas" },
  { id: 5, nombre: "Whisky Shot", precio: 120, categoria: "Premium" },
  { id: 6, nombre: "Cocktail Especial", precio: 150, categoria: "Premium" },
  { id: 7, nombre: "Botella Vodka", precio: 1800, categoria: "Botellas" },
  { id: 8, nombre: "Botella Tequila", precio: 2200, categoria: "Botellas" },
  { id: 9, nombre: "Entrada General", precio: 250, categoria: "Entradas" },
  { id: 10, nombre: "Entrada VIP", precio: 500, categoria: "Entradas" },
];

interface CarritoItem {
  producto: typeof productos[0];
  cantidad: number;
}

const Ventas = () => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | null>(null);

  const agregarAlCarrito = (producto: typeof productos[0]) => {
    const itemExistente = carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }]);
    }
    
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  const modificarCantidad = (id: number, delta: number) => {
    setCarrito(carrito.map(item =>
      item.producto.id === id
        ? { ...item, cantidad: Math.max(0, item.cantidad + delta) }
        : item
    ).filter(item => item.cantidad > 0));
  };

  const subtotal = carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const procesarVenta = () => {
    if (carrito.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    
    if (!metodoPago) {
      toast.error("Selecciona un método de pago");
      return;
    }

    toast.success(`Venta procesada: $${total.toFixed(2)} - ${metodoPago}`);
    setCarrito([]);
    setMetodoPago(null);
  };

  const categorias = [...new Set(productos.map(p => p.categoria))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Punto de Venta</h2>
        <p className="text-muted-foreground">Sistema POS rápido</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos */}
        <Card className="lg:col-span-2 bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categorias.map(categoria => (
              <div key={categoria} className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-primary rounded"></div>
                  {categoria}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productos.filter(p => p.categoria === categoria).map(producto => (
                    <Button
                      key={producto.id}
                      onClick={() => agregarAlCarrito(producto)}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                    >
                      <span className="font-semibold text-foreground">{producto.nombre}</span>
                      <span className="text-xl font-bold text-primary">${producto.precio}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Carrito */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="w-5 h-5 text-accent" />
              Carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {carrito.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {carrito.map((item) => (
                    <div key={item.producto.id} className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.producto.nombre}</p>
                        <p className="text-xs text-primary font-bold">${item.producto.precio}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => modificarCantidad(item.producto.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-foreground">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => modificarCantidad(item.producto.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span className="font-medium text-foreground">${iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Método de pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={metodoPago === "efectivo" ? "default" : "outline"}
                      className={metodoPago === "efectivo" ? "bg-gradient-primary shadow-neon" : ""}
                      onClick={() => setMetodoPago("efectivo")}
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Efectivo
                    </Button>
                    <Button
                      variant={metodoPago === "tarjeta" ? "default" : "outline"}
                      className={metodoPago === "tarjeta" ? "bg-gradient-primary shadow-neon" : ""}
                      onClick={() => setMetodoPago("tarjeta")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Tarjeta
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={procesarVenta}
                  className="w-full bg-gradient-primary shadow-neon hover:shadow-neon-intense transition-all"
                  size="lg"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Procesar Venta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ventas;
