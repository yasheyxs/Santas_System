import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Trash2, Phone, Mail, Instagram } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const mockClientes = [
  { id: 1, nombre: "Carlos Méndez", tipo: "VIP", telefono: "+52 55 1234 5678", email: "carlos@example.com", instagram: "@carlosm", visitas: 24, gasto: "$45,000" },
  { id: 2, nombre: "Ana Rodríguez", tipo: "Premium", telefono: "+52 55 8765 4321", email: "ana@example.com", instagram: "@anarodriguez", visitas: 18, gasto: "$32,500" },
  { id: 3, nombre: "Luis García", tipo: "Regular", telefono: "+52 55 5555 1234", email: "luis@example.com", instagram: "@luisgarcia", visitas: 12, gasto: "$18,000" },
  { id: 4, nombre: "María López", tipo: "VIP", telefono: "+52 55 9999 8888", email: "maria@example.com", instagram: "@marialopez", visitas: 32, gasto: "$68,000" },
  { id: 5, nombre: "Pedro Sánchez", tipo: "Regular", telefono: "+52 55 7777 6666", email: "pedro@example.com", instagram: "@pedros", visitas: 8, gasto: "$12,000" },
];

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<typeof mockClientes[0] | null>(null);

  const filteredClientes = mockClientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "VIP":
        return "bg-gradient-primary text-primary-foreground shadow-neon";
      case "Premium":
        return "bg-accent/20 text-accent border-accent";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Clientes</h2>
          <p className="text-muted-foreground">Gestiona tu base de clientes</p>
        </div>
        <Button className="bg-gradient-primary shadow-neon hover:shadow-neon-intense transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface-elevated border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Gasto Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} className="border-border hover:bg-surface-elevated/50">
                  <TableCell className="font-medium text-foreground">{cliente.nombre}</TableCell>
                  <TableCell>
                    <Badge className={getTipoBadgeColor(cliente.tipo)}>
                      {cliente.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {cliente.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {cliente.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground font-medium">{cliente.visitas}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-primary font-bold">{cliente.gasto}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-primary/10 hover:text-primary"
                            onClick={() => setSelectedCliente(cliente)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Detalles del Cliente</DialogTitle>
                            <DialogDescription>
                              Información completa y historial
                            </DialogDescription>
                          </DialogHeader>
                          {selectedCliente && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg">
                                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold shadow-neon">
                                  {selectedCliente.nombre.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-foreground">{selectedCliente.nombre}</h3>
                                  <Badge className={getTipoBadgeColor(selectedCliente.tipo)}>
                                    {selectedCliente.tipo}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-surface-elevated rounded-lg">
                                  <p className="text-sm text-muted-foreground">Visitas</p>
                                  <p className="text-2xl font-bold text-foreground">{selectedCliente.visitas}</p>
                                </div>
                                <div className="p-3 bg-surface-elevated rounded-lg">
                                  <p className="text-sm text-muted-foreground">Gasto Total</p>
                                  <p className="text-2xl font-bold text-primary">{selectedCliente.gasto}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-foreground">
                                  <Phone className="w-4 h-4 text-primary" />
                                  {selectedCliente.telefono}
                                </div>
                                <div className="flex items-center gap-2 text-foreground">
                                  <Mail className="w-4 h-4 text-primary" />
                                  {selectedCliente.email}
                                </div>
                                <div className="flex items-center gap-2 text-foreground">
                                  <Instagram className="w-4 h-4 text-accent" />
                                  {selectedCliente.instagram}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
