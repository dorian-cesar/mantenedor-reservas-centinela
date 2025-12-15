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
    Check,
    ChevronLeft,
    ChevronRight
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState({});
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [activeDay, setActiveDay] = useState("lunes");

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
                await TemplateService.updateTemplate(editingTemplate._id, data);
                showNotification("success", "Template actualizada correctamente");
                setShowModal(false);
                loadTemplates();
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
                            showNotification("success", "Servicios creados correctamente por 14 días");
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

    const DayTabContent = ({ day }) => {
        const dayTemplates = templates[day] || [];
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

        if (dayTemplates.length === 0) {
            return (
                <Card className={`${colors.bg} ${colors.border} border-2`}>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas para este día</h3>
                        <p className="text-gray-500 mb-6">Crea una nueva plantilla para comenzar</p>
                        <Button onClick={handleCreateTemplate} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva plantilla
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className={`h-5 w-5`} />
                                <CardTitle>
                                    {dayNames[day]}
                                    <Badge variant="outline" className="ml-2 bg-white">
                                        {dayTemplates.length} servicios
                                    </Badge>
                                </CardTitle>
                            </div>
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
                                    {dayTemplates.map((template) => (
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
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div>
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
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


                <CardContent className="px-0">
                    <Tabs defaultValue="lunes" value={activeDay} onValueChange={setActiveDay}>
                        <ScrollArea className="w-full">
                            <TabsList className="mb-6 h-12 w-full justify-start">
                                {Object.keys(dayNames).map((day) => (
                                    <TabsTrigger
                                        key={day}
                                        value={day}
                                        className="relative h-10 px-4 data-[state=active]:shadow-none"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{dayNames[day]}</span>
                                            {getDayTemplatesCount(day) > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                                                >
                                                    {getDayTemplatesCount(day)}
                                                </Badge>
                                            )}
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </ScrollArea>

                        {Object.keys(dayNames).map((day) => (
                            <TabsContent key={day} value={day} className="mt-0">
                                <DayTabContent day={day} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
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