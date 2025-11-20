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
    Plus
} from 'lucide-react';
import Notification from '@/components/notification';
import UserService from "@/services/users.service";
import UserModal from "@/components/modals/userModal";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // paginación
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // fijo 10 por tu requerimiento
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    };

    useEffect(() => {
        loadUsers(page);
    }, [page]);

    const loadUsers = async (page = 1) => {
        try {
            setLoading(true);
            const res = await UserService.getUsers(page, 10); // ← ahora pasa page y limit
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

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleRefresh = () => {
        loadUsers(page);
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
            loadUsers(page);
        } catch (error) {
            showNotification('error', error.message);
        }
    }

    const handleActiveUser = async (user) => {
        try {
            await UserService.activeUser(user._id, { "activo": true });
            showNotification('success', `Usuario ${user.name} activado correctamente`);
            loadUsers(page);
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
            loadUsers(page);
        } catch (error) {
            showNotification('error', error.message);
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCreateUser}
                                className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                                aria-label="Refrescar"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="text-sm hidden sm:inline">Nuevo Usuario</span>
                            </button>
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
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Rol</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user, idx) => (
                                            <tr key={user._id} className={`hover:bg-gray-50`}>
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
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-200 p-2 rounded-full cursor-pointer"
                                                            aria-label={`Editar ${user.name}`}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
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

                            {/* Lista para sm/md pequeños */}
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
                                                    <div>
                                                        <div className="text-sm font-medium">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                    <div>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(user.role)}`}>
                                                            {user.role}
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
                                    <p className="text-gray-500">No se encontraron usuarios</p>
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
                            {total} resultados
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
