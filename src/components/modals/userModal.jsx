"use client"
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Lock, Shield, Building, IdCard } from 'lucide-react';
import SessionHelper from '@/utils/session';

export default function UserModal({ user, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rut: '',
        role: 'user',
    });
    const [loading, setLoading] = useState(false);
    const [superUser, setSuperUser] = useState(false);
    const passwordRef = useRef(null);

    useEffect(() => {
        const currentUser = SessionHelper.getUser();
        setSuperUser(String(currentUser?.role) === "superUser");
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                rut: user.rut || '',
                role: user.role || 'user',
            });
        } else {
            // crear -> limpiar formulario
            setFormData({
                name: '',
                email: '',
                password: '',
                rut: '',
                role: 'user',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Si estamos creando (no hay `user`) validamos password explícitamente
            if (!user) {
                if (!formData.password || formData.password.trim().length < 6) {
                    // mensaje claro al usuario
                    alert("La contraseña es obligatoria y debe tener al menos 6 caracteres.");
                    setLoading(false);
                    // enfocamos el input de password
                    if (passwordRef.current) passwordRef.current.focus();
                    return;
                }
            }

            // Construimos el payload de forma explícita:
            let dataToSend;
            if (user) {
                // edición: si se ingresó nueva contraseña la incluimos, sino no
                dataToSend = {
                    name: formData.name,
                    email: formData.email,
                    rut: formData.rut,
                    role: formData.role
                };
                if (formData.password && formData.password.trim().length >= 6) {
                    dataToSend.password = formData.password;
                }
            } else {
                // creación: enviamos todo (ya validado)
                dataToSend = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rut: formData.rut,
                    role: formData.role
                };
            }

            await onSave(dataToSend);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-400">
                    <h2 className="text-xl font-semibold">
                        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-12 py-3 border-2 border-gray-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200"
                                placeholder="Ej: Juan Pérez"
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-12 py-3 border-2 border-gray-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200"
                                placeholder="Ej: usuario@ejemplo.com"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {user
                                ? (superUser ? 'Cambiar Contraseña' : 'Bloqueado')
                                : 'Contraseña'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                ref={passwordRef}
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!user}
                                minLength={6}
                                disabled={!!user && !superUser}
                                className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl outline-none transition-all duration-200 
                                    ${user && !superUser
                                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'border-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'}
      `}
                                placeholder={user ? '• • • • • • • •' : 'Ingresa una contraseña'}
                                autoComplete={user ? "new-password" : "new-password"}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {user ? (superUser ? 'Deja vacío para mantener la contraseña actual' : 'No puedes cambiar la contraseña') : 'La contraseña debe tener al menos 6 caracteres'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rut
                        </label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                name="rut"
                                value={formData.rut}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-12 py-3 border-2 border-gray-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200"
                                placeholder="Ej: 12345678-9"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rol
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="w-full pl-11 pr-12 py-3 border-2 border-gray-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200"
                            >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border-2 border-gray-400 rounded-xl text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-linear-to-r from-sky-600 to-sky-800 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
