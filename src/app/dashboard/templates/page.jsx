"use client";
import { useEffect, useState, useMemo } from "react";
import {
    RefreshCcw,
    Users,
    Clock,
    MapPin,
    Calendar,
    Edit,
    Plus,
    XIcon,
    Check,
    Search,
    X
} from "lucide-react";
import Notification from "@/components/notification";
import TemplateService from "@/services/template.service";
import TemplateModal from "@/components/modals/templateModal";
import ServicesService from "@/services/services.service";
import Swal from "sweetalert2";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState({});
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [activeDay, setActiveDay] = useState("lunes");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");



    const dayNames = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    const dayColors = {
        lunes: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
        martes: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
        miercoles: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
        jueves: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
        viernes: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
        sabado: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
        domingo: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
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

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const res = await TemplateService.getTemplateByDays();
            setTemplates(res || {});
        } catch (error) {
            console.error("Error cargando templates:", error);
            showNotification("error", "Error al cargar templates: " + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (template) => {
        const action = template.active ? "desactivar" : "activar";

        const result = await Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} template?`,
            text: `¿Estás seguro de querer ${action} esta plantilla?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await TemplateService.toggleTemplate(template._id);
            showNotification(
                "success",
                `Template ${template.active ? "desactivada" : "activada"} correctamente`
            );
            loadTemplates();
        } catch (error) {
            console.error(`Error ${action} template:`, error);
            showNotification(
                "error",
                `Error al ${action} template: ` + (error.message || error)
            );
        }
    };

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
                const result = await TemplateService.updateTemplate(editingTemplate._id, data);
                createdId = editingTemplate._id;
                showNotification("success", "Template actualizada correctamente");
                setShowModal(false);

                setTimeout(async () => {
                    const updateResult = await Swal.fire({
                        title: "¿Actualizar servicios existentes?",
                        html: `
                            <div class="text-left">
                                <p>¿Deseas actualizar los servicios generados a partir de hoy en base a esta plantilla?</p>
                                <div class="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                                    <p><strong>Cambios realizados:</strong></p>
                                    <ul class="mt-2 space-y-1">
                                        ${data.origin && data.origin !== editingTemplate.origin ? `<li>• Origen: ${editingTemplate.origin} → ${data.origin}</li>` : ''}
                                        ${data.destination && data.destination !== editingTemplate.destination ? `<li>• Destino: ${editingTemplate.destination} → ${data.destination}</li>` : ''}
                                        ${data.time && data.time !== editingTemplate.time ? `<li>• Hora: ${editingTemplate.time} → ${data.time}</li>` : ''}
                                        ${!data.origin && !data.destination && !data.time ? `<li>• Sin cambios en ruta/hora</li>` : ''}
                                    </ul>
                                </div>
                            </div>
                        `,
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Sí, actualizar servicios",
                        cancelButtonText: "No, mantener como están",
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        reverseButtons: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    });

                    if (updateResult.isConfirmed) {
                        try {
                            // Preparar parámetros para la API de actualización
                            const updateParams = {
                                fromDate: new Date().toISOString().split("T")[0], // Hoy
                            };

                            // Solo incluir los campos que cambiaron
                            if (data.origin && data.origin !== editingTemplate.origin) {
                                updateParams.origin = data.origin;
                            }
                            if (data.destination && data.destination !== editingTemplate.destination) {
                                updateParams.destination = data.destination;
                            }
                            if (data.time && data.time !== editingTemplate.time) {
                                updateParams.time = data.time;
                            }

                            if (updateParams.origin || updateParams.destination || updateParams.time) {
                                const newOrigin = updateParams.origin || editingTemplate.origin;
                                const newDestination = updateParams.destination || editingTemplate.destination;
                                const newTime = updateParams.time || editingTemplate.time;

                                updateParams.serviceName = `#${editingTemplate.serviceNumber} ${newOrigin} → ${newDestination} ${newTime}`;
                            }

                            // Si hay al menos un campo para actualizar
                            if (Object.keys(updateParams).length > 1) { // updateAll más al menos un campo
                                const updateSwal = Swal.fire({
                                    title: "Actualizando servicios...",
                                    html: "Por favor espera mientras se actualizan los servicios existentes",
                                    allowOutsideClick: false,
                                    didOpen: () => {
                                        Swal.showLoading();
                                    }
                                });

                                try {
                                    const updateResult = await ServicesService.updateGeneratedServices(
                                        editingTemplate.serviceNumber,
                                        updateParams
                                    );

                                    await updateSwal.close();

                                    if (updateResult.success) {
                                        Swal.fire({
                                            title: "¡Servicios actualizados!",
                                            html: `
                                                <div class="text-left">
                                                    <p>Se actualizaron ${updateResult.updatedCount || 0} servicios</p>
                                                    ${updateResult.sampleUpdated && updateResult.sampleUpdated.length > 0 ? `
                                                        <div class="mt-3 p-3 bg-green-50 rounded-md text-sm">
                                                            <p class="font-medium">Ejemplos actualizados:</p>
                                                            <ul class="mt-2 space-y-2">
                                                                ${updateResult.sampleUpdated.map(service => `
                                                                    <li class="border-l-2 border-green-500 pl-2">
                                                                        <div class="font-medium">${service.date}</div>
                                                                        <div class="text-gray-600 text-xs line-through">${service.oldServiceName}</div>
                                                                        <div class="text-green-600 text-sm">→ ${service.newServiceName}</div>
                                                                    </li>
                                                                `).join('')}
                                                            </ul>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            `,
                                            icon: "success",
                                            confirmButtonText: "Entendido"
                                        });

                                        showNotification("success", `Servicios actualizados: ${updateResult.updatedCount} servicios modificados`);
                                    } else {
                                        throw new Error(updateResult.error || "Error al actualizar servicios");
                                    }

                                } catch (updateError) {
                                    await updateSwal.close();
                                    throw updateError;
                                }
                            } else {
                                // No hay campos para actualizar
                                Swal.fire({
                                    title: "Sin cambios",
                                    text: "No se detectaron cambios en origen, destino o hora que requieran actualización de servicios.",
                                    icon: "info",
                                    confirmButtonText: "Entendido"
                                });
                            }

                        } catch (err) {
                            console.error("Error actualizando servicios:", err);
                            Swal.fire({
                                title: "Error al actualizar servicios",
                                text: err.message || "Ocurrió un error al intentar actualizar los servicios",
                                icon: "error",
                                confirmButtonText: "Entendido"
                            });
                        }
                    }

                    loadTemplates();
                }, 1000);
            } else {
                const res = await TemplateService.createTemplate(data);
                createdId = res._id || res.id;

                showNotification("success", "Template creada correctamente");

                setTimeout(async () => {
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
                    });

                    if (result.isConfirmed) {
                        try {
                            await ServicesService.generateOne(createdId);
                            showNotification("success", "Servicios creados correctamente");
                        } catch (err) {
                            console.error("Error creando services:", err);
                            showNotification("error", "Error al crear servicios: " + (err?.message || err));
                        }
                    }

                    loadTemplates();
                }, 1500);

                setShowModal(false);
            }
        } catch (error) {
            console.error("Error guardando template:", error);
            showNotification("error", error?.message || "Error guardando template");
            setShowModal(false);
        }
    };

    const getDayTemplatesCount = (day) => {
        return templates[day]?.length || 0;
    };

    const filteredTemplatesByDay = useMemo(() => {
        if (!searchQuery) return templates;

        const q = searchQuery.toLowerCase();
        const result = {};

        Object.keys(templates).forEach((day) => {
            result[day] = (templates[day] || []).filter(t =>
                t.serviceNumber?.toString().includes(q) ||
                t.serviceName?.toLowerCase().includes(q) ||
                t.origin?.toLowerCase().includes(q) ||
                t.destination?.toLowerCase().includes(q) ||
                t.company?.toLowerCase().includes(q)
            );
        });

        return result;
    }, [templates, searchQuery]);

    const DayTabContent = ({ day }) => {
        const filteredTemplates = filteredTemplatesByDay[day] || [];
        const colors = dayColors[day] || dayColors.lunes;

        if (loading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            );
        }

        if (filteredTemplates.length === 0) {
            return (
                <Card className={`${colors.bg} ${colors.border} border-2`}>
                    <CardContent className="flex flex-col items-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">No hay resultados</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-5 w-5`} />
                            <CardTitle>
                                {dayNames[day]}
                                <Badge variant="outline" className="ml-2 bg-white">
                                    {filteredTemplates.length} de {filteredTemplates.length} plantillas
                                </Badge>
                            </CardTitle>
                        </div>

                        {filteredTemplates.length === 0 && searchTerm && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchTerm("")}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Limpiar filtro
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative h-[500px] overflow-auto rounded-md border">
                        <Table className="min-w-[1100px]">
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="w-[100px]">Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Origen</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTemplates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Search className="h-12 w-12 text-gray-300" />
                                                <p className="text-gray-500">No se encontraron plantillas que coincidan con "{searchTerm}"</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSearchTerm("")}
                                                    className="mt-2"
                                                >
                                                    Limpiar búsqueda
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTemplates.map((template) => (
                                        <TableRow
                                            key={template._id}
                                            className={!template.active ? "bg-gray-100 hover:bg-gray-200" : ""}
                                        >
                                            <TableCell className="whitespace-nowrap font-medium">
                                                <Badge variant="outline" className="bg-white">
                                                    #{template.serviceNumber}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="max-w-[260px] whitespace-normal break-words">
                                                <div className="font-medium">{template.serviceName}</div>
                                            </TableCell>

                                            <TableCell className="max-w-[220px] whitespace-normal break-words">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                                                    <span>{template.origin}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[220px] whitespace-normal break-words">
                                                {template.destination}
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span>{template.time}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                {template.company || (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    variant={template.active ? "default" : "secondary"}
                                                    className={template.active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                                                >
                                                    {template.active ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditTemplate(template)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Editar plantilla</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleToggle(template)}
                                                                    className={
                                                                        template.active
                                                                            ? "text-red-600 hover:text-red-700 hover:bg-red-100"
                                                                            : "text-green-600 hover:text-green-700 hover:bg-green-100"
                                                                    }
                                                                >
                                                                    {template.active ? (
                                                                        <XIcon className="h-4 w-4" />
                                                                    ) : (
                                                                        <Check className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{template.active ? "Desactivar" : "Activar"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </CardContent>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Plantillas de Servicios</h2>
                        <p className="text-muted-foreground mt-1">
                            Gestiona las plantillas de servicios organizadas por día de la semana
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refrescar
                        </Button>
                        <Button onClick={handleCreateTemplate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva plantilla
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="search" className="text-sm font-medium">
                                    Buscar plantillas
                                </Label>
                            </div>
                            <div className="relative flex gap-5 items-center">
                                <Input
                                    placeholder="Buscar servicio..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setSearchQuery(searchInput.trim());
                                        }
                                    }}
                                />

                                <Button onClick={() => setSearchQuery(searchInput.trim())}>
                                    Buscar
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchInput("");
                                        setSearchQuery("");
                                    }}
                                >
                                    Limpiar
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Filtra plantillas por número (#), nombre, origen, destino o empresa
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <Tabs defaultValue="lunes" value={activeDay} onValueChange={setActiveDay}>
                            <ScrollArea className="w-full">
                                <TabsList className="mb-6 h-12 w-full justify-start">
                                    {Object.keys(dayNames).map((day) => {
                                        const dayTemplates = templates[day] || [];
                                        const totalCount = templates[day]?.length || 0;
                                        const filteredCount = filteredTemplatesByDay[day]?.length || 0;

                                        return (
                                            <TabsTrigger
                                                key={day}
                                                value={day}
                                                className="relative h-10 px-4 data-[state=active]:shadow-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{dayNames[day]}</span>
                                                    {totalCount > 0 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-1 h-5 min-w-5 rounded-full p-0 text-xs flex items-center justify-center"
                                                        >
                                                            {searchInput ? (
                                                                <>
                                                                    <span className="text-green-600">{filteredCount}</span>
                                                                    <span className="text-gray-400">/</span>
                                                                    <span>{totalCount}</span>
                                                                </>
                                                            ) : (
                                                                totalCount
                                                            )}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </ScrollArea>

                            {Object.keys(dayNames).map((day) => (
                                <TabsContent key={day} value={day} className="mt-0">
                                    <DayTabContent day={day} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Modal */}
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