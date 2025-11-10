import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Role,
  User,
  createUser,
  deleteUser,
  listRoles,
  listUsers,
  updateUser,
} from "@/services/users";

interface FormState {
  nombre: string;
  telefono: string;
  email: string;
  rolId: string;
  activo: boolean;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  telefono: "",
  email: "",
  rolId: "",
  activo: true,
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado. Por favor vuelve a intentarlo.";
};

export default function Usuarios() {
  const [formState, setFormState] = useState<FormState>(EMPTY_FORM);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reloading, setReloading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const roleById = useMemo(() => {
    const map = new Map<number, string>();
    roles.forEach((role) => {
      map.set(role.id, role.nombre);
    });
    return map;
  }, [roles]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        listRoles(),
        listUsers(),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error al cargar datos iniciales de usuarios", error);
      toast({
        title: "Error al cargar datos",
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const refreshUsers = async () => {
    setReloading(true);
    try {
      const usersData = await listUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error al actualizar usuarios", error);
      toast({
        title: "No fue posible actualizar el listado",
        description: getErrorMessage(error),
      });
    } finally {
      setReloading(false);
    }
  };

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setEditingUserId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nombre = formState.nombre.trim();
    const telefono = formState.telefono.trim();
    const email = formState.email.trim();
    const rolIdNumber = Number(formState.rolId);

    if (!nombre || !telefono || !rolIdNumber) {
      toast({
        title: "Datos incompletos",
        description: "Nombre, teléfono y rol son obligatorios.",
      });
      return;
    }

    const payload = {
      nombre,
      telefono,
      email: email.length > 0 ? email : null,
      rolId: rolIdNumber,
      activo: formState.activo,
    };

    setSubmitting(true);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, payload);
        toast({
          title: "Usuario actualizado",
          description: "Los cambios fueron guardados correctamente.",
        });
      } else {
        await createUser(payload);
        toast({
          title: "Usuario creado",
          description: "El nuevo usuario se guardó en la base de datos.",
        });
      }

      await refreshUsers();
      resetForm();
    } catch (error) {
      console.error("Error al guardar usuario", error);
      toast({
        title: "No se pudo guardar el usuario",
        description: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormState({
      nombre: user.nombre,
      telefono: user.telefono,
      email: user.email ?? "",
      rolId: user.rolId ? String(user.rolId) : "",
      activo: user.activo,
    });
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar a ${user.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(user.id);

    try {
      await deleteUser(user.id);
      toast({
        title: "Usuario eliminado",
        description: `${user.nombre} fue eliminado correctamente.`,
      });
      if (editingUserId === user.id) {
        resetForm();
      }
      await refreshUsers();
    } catch (error) {
      console.error("Error al eliminar usuario", error);
      toast({
        title: "No se pudo eliminar",
        description: getErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isLoadingUsers = loading || reloading;
  const isEditing = editingUserId !== null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Configura perfiles de acceso para administradores, cajas o barras y
            promotores.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Editar usuario" : "Crear nuevo usuario"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Actualiza los datos del usuario seleccionado."
                : "Completa la información para otorgar acceso personalizado al sistema."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="user-name">Nombre completo</Label>
                  <Input
                    id="user-name"
                    value={formState.nombre}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        nombre: event.target.value,
                      }))
                    }
                    placeholder="Ingresar nombre"
                    className="h-12 text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-phone">Teléfono</Label>
                  <Input
                    id="user-phone"
                    value={formState.telefono}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        telefono: event.target.value,
                      }))
                    }
                    placeholder="Ej: +54 9 11 5555-5555"
                    className="h-12 text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-email">Correo electrónico</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="usuario@santasclub.com"
                    className="h-12 text-base"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-role">Rol</Label>
                  <Select
                    value={formState.rolId}
                    onValueChange={(value) =>
                      setFormState((prev) => ({ ...prev, rolId: value }))
                    }
                  >
                    <SelectTrigger id="user-role" className="h-12 text-base">
                      <SelectValue
                        placeholder={
                          roles.length === 0
                            ? "Sin roles disponibles"
                            : "Seleccionar rol"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No hay roles configurados
                        </div>
                      ) : (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 sm:col-span-2"></div>
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Usuario activo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Habilita o deshabilita el acceso cuando sea necesario.
                    </p>
                  </div>
                  <Switch
                    checked={formState.activo}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({ ...prev, activo: checked }))
                    }
                    aria-label="Estado del usuario"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  {isEditing ? "Cancelar" : "Limpiar"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-primary gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? "Guardar cambios" : "Guardar usuario"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Usuarios registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando usuarios...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No hay usuarios registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground">
                          {user.nombre}
                        </TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell>
                          {roleById.get(user.rolId) ?? user.rolNombre ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.activo
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-muted bg-muted text-muted-foreground"
                            }
                          >
                            {user.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.fechaCreacion)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(user)}
                              disabled={submitting || deletingId === user.id}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(user)}
                              disabled={submitting || deletingId === user.id}
                              className="h-8 w-8"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
