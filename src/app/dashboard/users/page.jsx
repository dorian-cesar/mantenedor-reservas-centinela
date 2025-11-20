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
    Search
} from 'lucide-react';
import Notification from '@/components/notification';
import UserService from "@/services/users.service";
import UserModal from "@/components/modals/userModal";

import SessionHelper from "@/utils/session";

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
    const [roleFilter, setRoleFilter] = useState('');

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
        try {
            setLoading(true);
            const res = await UserService.getUsers(page, 10, query, role);
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

    const handleRoleFilterChange = (e) => {
        const role = e.target.value;
        setRoleFilter(role);
        setPage(1);
        loadUsers(1, searchQuery, role);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setRoleFilter('');
        setPage(1);
        loadUsers(1, '', '');
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

    const handleDesactiveUser = async (user) => {
        try {
            await UserService.activeUser(user._id, { "activo": false });
            showNotification('success', `Usuario ${user.name} desactivado correctamente`);
            loadUsers(page, searchQuery, roleFilter);
        } catch (error) {
            showNotification('error', error.message);
        }
    }

    const handleActiveUser = async (user) => {
        try {
            await UserService.activeUser(user._id, { "activo": true });
            showNotification('success', `Usuario ${user.name} activado correctamente`);
            loadUsers(page, searchQuery, roleFilter);
        } catch (error) {
            showNotification('error', error.message);
        }
    }

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

    const handleExportCSV = async () => {
        try {
            setLoading(true);
            // Exportar con filtros aplicados
            const res = await UserService.getAllUsers(searchQuery, roleFilter);
            const allUsers = (res && res.data) ? res.data : [];

            if (!allUsers || allUsers.length === 0) {
                showNotification("error", "No hay usuarios para exportar");
                return;
            }

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

            showNotification("success", `Exportados ${allUsers.length} usuarios`);
        } catch (error) {
            console.error("Error exportando CSV:", error);
            showNotification("error", "Error exportando usuarios: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const roleBadgeClass = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'admin' || r === 'superUser') {
            return 'bg-blue-200 text-blue-800';
        }
        return 'bg-gray-200 text-black';
    };

    return (
        <div className="w-full p-4">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Usuarios</h2>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                            aria-label="Exportar"
                        >
                            <ArrowDownToLine className="h-4 w-4" />
                            <span className="text-sm hidden sm:inline">Exportar (CSV)</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {superUser && (
                                <button
                                    onClick={handleCreateUser}
                                    className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                                    aria-label="Nuevo usuario"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="text-sm hidden sm:inline">Nuevo Usuario</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                                aria-label="Refrescar"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                <span className="text-sm hidden sm:inline">Refrescar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtros de Búsqueda */}
                <div className="bg-white rounded-xl shadow p-4 md:p-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Búsqueda por nombre, email o RUT */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Buscar (nombre, email o RUT)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ej: 12345678-9"
                                    className="w-full border rounded-lg px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Filtro por rol */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Filtrar por rol
                            </label>
                            <select
                                value={roleFilter}
                                onChange={handleRoleFilterChange}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos los roles</option>
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Search className="h-4 w-4" />
                                <span>Buscar</span>
                            </button>
                            
                            {(searchQuery || roleFilter) && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <XIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Limpiar</span>
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Mostrar filtros activos */}
                    {(searchQuery || roleFilter) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Búsqueda: "{searchQuery}"
                                    <button 
                                        onClick={() => {
                                            setSearchQuery('');
                                            loadUsers(1, '', roleFilter);
                                        }}
                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {roleFilter && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Rol: {roleFilter}
                                    <button 
                                        onClick={() => {
                                            setRoleFilter('');
                                            loadUsers(1, searchQuery, '');
                                        }}
                                        className="hover:bg-green-200 rounded-full p-0.5"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabla de usuarios */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            {/* Tabla para md+ */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Usuario</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Correo</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">RUT</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Rol</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user, idx) => (
                                            <tr key={user._id} className={`${!user.activo ? 'bg-gray-200 hover:bg-gray-300 ' : 'bg-white hover:bg-gray-50'}`}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {(page - 1) * limit + idx + 1}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600 font-mono">{user.rut || 'N/A'}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {user.activo ? 'Activo' : 'Inactivo'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {superUser && (
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-200 p-2 rounded-full cursor-pointer"
                                                                aria-label={`Editar ${user.name}`}
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        {user.activo
                                                            ? <button
                                                                onClick={() => handleDesactiveUser(user)}
                                                                className="text-red-600 hover:text-red-900 bg-red-200 p-2 rounded-full cursor-pointer"
                                                                aria-label={`Desactivar ${user.name}`}
                                                                title={`Desactivar ${user.name}`}
                                                            >
                                                                <XIcon className="h-5 w-5" />
                                                            </button>
                                                            : <button
                                                                onClick={() => handleActiveUser(user)}
                                                                className="text-emerald-800 hover:text-emerald-900 bg-emerald-200 p-2 rounded-full cursor-pointer"
                                                                aria-label={`Activar ${user.name}`}
                                                                title={`Activar ${user.name}`}
                                                            >
                                                                <Check className="h-5 w-5" />
                                                            </button>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Lista para móviles */}
                            <div className="md:hidden p-4">
                                {users.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No se encontraron usuarios</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {users.map((user, idx) => (
                                            <li key={user._id} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                        <div className="text-xs text-gray-400 font-mono mt-1">{user.rut || 'N/A'}</div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                        <span className={`text-xs ${user.activo ? 'text-green-600' : 'text-red-600'}`}>
                                                            {user.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {users.length === 0 && (
                                <div className="text-center py-8 hidden md:block">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchQuery || roleFilter 
                                            ? "No se encontraron usuarios con los filtros aplicados" 
                                            : "No se encontraron usuarios"
                                        }
                                    </p>
                                    {(searchQuery || roleFilter) && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {total > 0 && (
                    <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 1 || loading}
                                className="bg-linear-to-tr from-gray-400 to-gray-500 hover:from-gray-600 hover:to-gray-800 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                aria-label="Página anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="text-sm text-gray-600 font-medium">
                                Página {page} de {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages || loading}
                                className="bg-linear-to-tr from-gray-400 to-gray-500 hover:from-gray-600 hover:to-gray-800 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 hidden sm:block">
                            {total} resultado{total !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </div>
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