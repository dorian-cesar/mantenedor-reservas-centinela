"use client"
import { useEffect, useState } from "react"
import {
    Users,
    Edit,
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    Check,
    XIcon,
    Plus,
    ArrowDownToLine,
    Search,
    Filter,
    Loader2,
    Shield,
    Mail,
    User as UserIcon,
    FileText,
    Download
} from 'lucide-react';
import Notification from '@/components/notification';
import UserService from "@/services/users.service";
import UserModal from "@/components/modals/userModal";
import SessionHelper from "@/utils/session";
import * as XLSX from "xlsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [superUser, setSuperUser] = useState(false)

    // paginación y filtros
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    };

    useEffect(() => {
        loadUsers(page);
        const currentUser = SessionHelper.getUser();
        setSuperUser(String(currentUser?.role) === "superUser");
    }, [page]);

    const loadUsers = async (page = 1, query = searchQuery, role = roleFilter) => {
        const normalizedRole = role === 'all' ? '' : role;
        try {
            setLoading(true);
            const res = await UserService.getUsers(page, 10, query, normalizedRole);
            setUsers(res.data);
            setTotal(res.pagination.total);
            setTotalPages(res.pagination.totalPages);
            setPage(res.pagination.page);
        } catch (error) {
            showNotification('error', 'Error al cargar usuarios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        setPage(1);
        loadUsers(1, searchQuery, roleFilter);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setPage(1);
        loadUsers(1, '', 'all');
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleRefresh = () => {
        loadUsers(page, searchQuery, roleFilter);
        showNotification('success', 'Lista actualizada');
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleToggleUserStatus = async (user) => {
        try {
            const newStatus = !user.activo;
            await UserService.activeUser(user._id, { "activo": newStatus });
            showNotification('success', `Usuario ${user.name} ${newStatus ? 'activado' : 'desactivado'} correctamente`);
            loadUsers(page, searchQuery, roleFilter);
        } catch (error) {
            showNotification('error', error.message);
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            if (editingUser) {
                await UserService.updateUser(editingUser._id, userData);
                showNotification('success', 'Usuario actualizado correctamente');
            } else {
                await UserService.createUser(userData);
                showNotification('success', 'Usuario creado correctamente');
            }
            setShowModal(false);
            loadUsers(page, searchQuery, roleFilter);
        } catch (error) {
            showNotification('error', error.message);
        }
    };

    const handleExport = async (format) => {
        try {
            setLoading(true);
            const res = await UserService.getAllUsers(searchQuery, roleFilter);
            const allUsers = (res && res.data) ? res.data : [];

            if (!allUsers || allUsers.length === 0) {
                showNotification("error", "No hay usuarios para exportar");
                return;
            }

            if (format === 'csv') {
                const headers = ["_id", "name", "email", "role", "rut", "activo"];
                const csvRows = [
                    headers.join(","),
                    ...allUsers.map(u =>
                        headers.map(h => {
                            const val = u[h];
                            return `"${String(val ?? "").replace(/"/g, '""')}"`;
                        }).join(",")
                    )
                ];

                const csvContent = csvRows.join("\n");
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `usuarios_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (format === 'xlsx') {
                const headers = ["_id", "name", "email", "role", "rut", "activo"];
                const rows = [headers];

                allUsers.forEach(u => {
                    const row = headers.map(h => {
                        let val = u[h];
                        if (h === "activo") {
                            if (typeof val === "boolean") val = val ? "Sí" : "No";
                            if (val === 1) val = "Sí";
                            if (val === 0) val = "No";
                        }
                        if (val === null || val === undefined) val = "";
                        return String(val);
                    });
                    rows.push(row);
                });

                const worksheet = XLSX.utils.aoa_to_sheet(rows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
                const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                const blob = new Blob([wbout], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `usuarios_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            showNotification("success", `Exportados ${allUsers.length} usuarios en formato ${format.toUpperCase()}`);
        } catch (error) {
            console.error(`Error exportando ${format}:`, error);
            showNotification("error", `Error exportando usuarios: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeVariant = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'admin' || r === 'superuser') return 'default';
        if (r === 'user') return 'secondary';
        return 'outline';
    };

    const getStatusBadgeVariant = (activo) => {
        return activo ? 'default' : 'destructive';
    };

    const getStatusText = (activo) => {
        return activo ? 'Activo' : 'Inactivo';
    };

    const activeFiltersCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (roleFilter) count++;
        return count;
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Notification type={notification.type} message={notification.message} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra los usuarios del sistema y sus permisos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('csv')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar Excel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {superUser && (
                        <Button onClick={handleCreateUser} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleRefresh} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        <CardTitle>Filtros de búsqueda</CardTitle>
                    </div>
                    <CardDescription>
                        Filtra usuarios por diferentes criterios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="flex gap-10">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Buscar usuario</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Nombre, email o RUT..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Select value={roleFilter} onValueChange={setRoleFilter} className="mb-0">
                                        <SelectTrigger className="mb-0">
                                            <SelectValue placeholder="Todos los roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los roles</SelectItem>
                                            <SelectItem value="user">Usuario</SelectItem>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit" className="gap-2 flex-1">
                                    <Search className="h-4 w-4" />
                                    Buscar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="gap-2"
                                >
                                    <XIcon className="h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </div>

                        {activeFiltersCount() > 0 && (
                            <div className="pt-2">
                                <Separator className="mb-4" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Filtros activos:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {searchQuery && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Search className="h-3 w-3" />
                                                    "{searchQuery}"
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            loadUsers(1, '', roleFilter);
                                                        }}
                                                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            )}
                                            {roleFilter && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    {roleFilter}
                                                    <button
                                                        onClick={() => {
                                                            setRoleFilter('');
                                                            loadUsers(1, searchQuery, '',);
                                                        }}
                                                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                    >
                                                        <XIcon className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Resultados y tabla */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Usuarios ({total})</CardTitle>
                            <CardDescription>
                                {users.length > 0 ? (
                                    <>Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} usuarios</>
                                ) : (
                                    "No hay usuarios para mostrar"
                                )}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeFiltersCount() > 0 ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {activeFiltersCount() > 0
                                    ? "Intenta con otros criterios de búsqueda"
                                    : "Comienza creando el primer usuario del sistema"
                                }
                            </p>
                            {superUser && activeFiltersCount() === 0 && (
                                <Button onClick={handleCreateUser} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Crear primer usuario
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">#</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Correo</TableHead>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user, idx) => (
                                            <TableRow key={user._id} className={!user.activo ? "bg-gray-50 hover:bg-gray-100" : ""}>
                                                <TableCell className="font-medium">
                                                    {(page - 1) * limit + idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <UserIcon className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">ID: {user._id.slice(-6)}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono">{user.rut || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(user.activo)}>
                                                        {getStatusText(user.activo)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {superUser && (
                                                            <>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleEditUser(user)}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Editar usuario</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleToggleUserStatus(user)}
                                                                                className={
                                                                                    user.activo
                                                                                        ? "text-red-600 hover:text-red-700 hover:bg-red-100"
                                                                                        : "text-green-600 hover:text-green-700 hover:bg-green-100"
                                                                                }
                                                                            >
                                                                                {user.activo ? (
                                                                                    <XIcon className="h-4 w-4" />
                                                                                ) : (
                                                                                    <Check className="h-4 w-4" />
                                                                                )}
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{user.activo ? "Desactivar" : "Activar"}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        {total} usuario{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handlePreviousPage}
                                            disabled={page === 1}
                                            className="h-8 w-8"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium px-2">
                                                Página {page} de {totalPages}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleNextPage}
                                            disabled={page === totalPages}
                                            className="h-8 w-8"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <UserModal
                    user={editingUser}
                    onSave={handleSaveUser}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}