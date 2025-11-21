"use client";
import { useEffect, useState } from "react";
import {
    RefreshCcw,
    Users,
    Clock,
    MapPin,
    Calendar,
    Edit,
    Plus,
    XIcon,
} from "lucide-react";
import Notification from "@/components/notification";
import TemplateService from "@/services/template.service";
import TemplateModal from "@/components/modals/templateModal";
import ServicesService from "@/services/services.service";
import Swal from "sweetalert2";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState({});
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [expandedDays, setExpandedDays] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const dayNames = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 5000);
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleRefresh = () => {
        loadTemplates();
        showNotification("success", "Lista actualizada");
    };

    const toggleDay = (day) => {
        setExpandedDays((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const res = await TemplateService.getTemplateByDays();
            // esperar que la API retorne un objeto con keys: lunes,...domingo
            setTemplates(res || {});

            // Expandir automáticamente los días que tienen templates
            const initialExpanded = {};
            Object.keys(res || {}).forEach((day) => {
                if (res[day] && res[day].length > 0) {
                    initialExpanded[day] = true;
                }
            });
            setExpandedDays(initialExpanded);
        } catch (error) {
            console.error("Error cargando templates:", error);
            showNotification("error", "Error al cargar templates: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            await TemplateService.deleteTemplate(templateId);
            showNotification("success", "Template eliminada correctamente");
            loadTemplates();
        } catch (error) {
            console.error("Error eliminando template:", error);
            showNotification("error", "Error al eliminar template: " + (error.message || error));
        }
    }

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    const handleCreateTemplate = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };

    const handleSaveTemplate = async (data) => {
        try {
            let createdId;

            if (editingTemplate) {
                await TemplateService.updateTemplate(editingTemplate._id, data);
                showNotification("success", "Template actualizada correctamente");
                setShowModal(false);
                loadTemplates();
            } else {
                // Crear template
                const res = await TemplateService.createTemplate(data);
                createdId = res._id || res.id;

                showNotification("success", "Template creada correctamente");

                // Usar setTimeout para asegurar que el modal se cierre antes del SweetAlert
                setTimeout(async () => {
                    // Preguntar al usuario si quiere crear servicios ahora
                    const result = await Swal.fire({
                        title: "¿Crear servicios ahora?",
                        text: "¿Deseas crear servicios a partir de esta plantilla ahora mismo?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, crear servicios",
                        cancelButtonText: "No, después",
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        reverseButtons: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        customClass: {
                            popup: "rounded-lg"
                        }
                    });

                    if (result.isConfirmed) {
                        try {
                            await ServicesService.generateOne(createdId);
                            showNotification("success", "Servicios creados correctamente por 14 días");
                        } catch (err) {
                            console.error("Error creando services:", err);
                            showNotification("error", "Error al crear servicios: " + (err?.message || err));
                        }
                    }

                    // Recargar templates después de todo el proceso
                    loadTemplates();
                }, 1500); // Pequeño delay para asegurar el cierre del modal

                // Cerrar modal inmediatamente
                setShowModal(false);
            }
        } catch (error) {
            console.error("Error guardando template:", error);
            showNotification("error", error?.message || "Error guardando template");
            setShowModal(false); // Cerrar modal también en caso de error
        }
    };

    const getDayColor = (day) => {
        const colors = {
            lunes: "bg-blue-50 border-blue-200",
            martes: "bg-green-50 border-green-200",
            miercoles: "bg-yellow-50 border-yellow-200",
            jueves: "bg-purple-50 border-purple-200",
            viernes: "bg-orange-50 border-orange-200",
            sabado: "bg-red-50 border-red-200",
            domingo: "bg-pink-50 border-pink-200",
        };
        return colors[day] || "bg-gray-50 border-gray-200";
    };

    const getDayHeaderColor = (day) => {
        const colors = {
            lunes: "bg-blue-100 text-blue-800",
            martes: "bg-green-100 text-green-800",
            miercoles: "bg-yellow-100 text-yellow-800",
            jueves: "bg-purple-100 text-purple-800",
            viernes: "bg-orange-100 text-orange-800",
            sabado: "bg-red-100 text-red-800",
            domingo: "bg-pink-100 text-pink-800",
        };
        return colors[day] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="w-full p-4">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">Plantillas de Servicios</h2>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCreateTemplate}
                            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
                            aria-label="Nuevo usuario"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm hidden sm:inline">Nueva template</span>
                        </button>
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

                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <div className="p-4">

                            {/* Lista de templates por día (estilo tabla parecido a ReportsPage) */}
                            <div className="space-y-4">
                                {Object.keys(dayNames).map((day) => (
                                    <div key={day} className={`border rounded-lg overflow-hidden ${getDayColor(day)}`}>
                                        {/* Header del día */}
                                        <button
                                            onClick={() => toggleDay(day)}
                                            className={`w-full flex items-center justify-between p-4 ${getDayHeaderColor(day)} hover:opacity-90 transition-opacity`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5" />
                                                <span className="font-semibold text-lg">{dayNames[day]}</span>
                                                <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                                                    {templates[day]?.length || 0} servicios
                                                </span>
                                            </div>
                                            <div className={`transform transition-transform ${expandedDays[day] ? "rotate-180" : ""}`}>
                                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                                    <path d="M5 8.5L10 13.5L15 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Contenido del día */}
                                        {expandedDays[day] && (
                                            <div className="p-4">
                                                {!templates[day] || templates[day].length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                        <p>No hay servicios programados para este día</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Tabla para desktop */}
                                                        <div className="hidden md:block overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-gray-200 table-auto text-sm">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Código</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Nombre</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Origen</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Destino</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Hora</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Empresa</th>
                                                                        <th className="px-2 py-2 text-left text-xs font-bold uppercase">Acciones</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {templates[day].map((template) => (
                                                                        <tr key={template._id} className="hover:bg-gray-50 align-top transition-colors">
                                                                            <td className="px-2 py-2 whitespace-normal break-words max-w-[80px] text-sm">
                                                                                <div className="text-sm font-medium text-gray-500">#{template.serviceNumber}</div>
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal break-words max-w-[200px] text-sm">
                                                                                <div className="text-sm font-medium text-gray-900">{template.serviceName}</div>
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal break-words max-w-[140px] text-sm">
                                                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                                                    <MapPin className="h-4 w-4 text-green-600" />
                                                                                    <span>{template.origin}</span>
                                                                                </div>
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal break-words max-w-[140px] text-sm">
                                                                                <div className="text-sm text-gray-900">{template.destination}</div>
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal text-sm">
                                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                                                    <span>{template.time}</span>
                                                                                </div>
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal text-sm text-gray-500">
                                                                                {template.company || "-"}
                                                                            </td>

                                                                            <td className="px-2 py-2 whitespace-normal text-sm">
                                                                                <div className="flex items-center gap-2">
                                                                                    <button
                                                                                        // placeholder action: abrir detalle o editar
                                                                                        onClick={() => { handleEditTemplate(template) }}
                                                                                        className="bg-blue-200 text-blue-700 p-2 rounded-full hover:bg-blue-300"
                                                                                        title="Editar"
                                                                                    >
                                                                                        <Edit className="h-4 w-4" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteTemplate(template._id)}
                                                                                        className="text-red-600 hover:text-red-900 bg-red-200 p-2 rounded-full cursor-pointer"
                                                                                        aria-label={`Eliminar ${template.serviceName}`}
                                                                                        title={`Eliminar ${template.serviceName}`}
                                                                                    >
                                                                                        <XIcon className="h-5 w-5" />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Lista móvil */}
                                                        <div className="md:hidden space-y-3">
                                                            {templates[day].map((template) => (
                                                                <div key={template._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            #{template.serviceNumber}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">{template.time}</span>
                                                                    </div>

                                                                    <h3 className="font-semibold text-gray-900 mb-2">{template.serviceName}</h3>

                                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                                        <MapPin className="h-4 w-4 text-green-600" />
                                                                        <span>{template.origin} → {template.destination}</span>
                                                                    </div>

                                                                    <div className="text-sm text-gray-500">
                                                                        {template.company || ""}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Mensaje cuando no hay templates en ningún día */}
                            {Object.values(templates).every((dayTemplates) => !dayTemplates || dayTemplates.length === 0) && (
                                <div className="text-center py-12">
                                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas de servicios</h3>
                                    <p className="text-gray-500">No se encontraron servicios programados para ningún día.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <TemplateModal
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
