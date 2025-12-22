"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Home, Truck, List, Check, Bus, ChevronDownIcon, CalendarDays } from "lucide-react";
import SessionHelper from "@/utils/session";
import LayoutService from "@/services/layout.service";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { es } from "date-fns/locale"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar as CalendarComponent } from "@/components/ui/calendar";


export default function TemplateModal({ template, onSave, onClose }) {

    const [openStartDate, setOpenStartDate] = useState(false);
    const [openEndDate, setOpenEndDate] = useState(false);
    const [hasEndDate, setHasEndDate] = useState(false);

    const [formData, setFormData] = useState({
        origin: "",
        destination: "",
        startDate: undefined,
        endDate: undefined,
        time: "",
        company: "",
        layout: "",
        daysOfWeek: [],
    });
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [layoutsLoading, setLayoutsLoading] = useState(true);
    const [superUser, setSuperUser] = useState(false);

    useEffect(() => {
        const currentUser = SessionHelper.getUser();
        setSuperUser(String(currentUser?.role) === "superUser");
        loadLayouts();
    }, []);

    useEffect(() => {
        if (template) {
            const templateEndDate = template.endDate
                ? new Date(template.endDate)
                : undefined;

            setFormData({
                origin: template.origin || "",
                destination: template.destination || "",
                startDate: template.startDate
                    ? new Date(template.startDate)
                    : undefined,
                endDate: templateEndDate,
                time: template.time || "",
                company: template.company || "",
                layout: template.layout?._id || template.layout || "",
                daysOfWeek: (template.daysOfWeek || []).slice(),
            });

            // Si tiene endDate, activar el switch
            setHasEndDate(templateEndDate !== undefined);
        }
    }, [template]);

    const loadLayouts = async () => {
        try {
            setLayoutsLoading(true);
            const res = await LayoutService.getLayouts();
            setLayouts(res || []);
        } catch (error) {
            console.error("Error cargando layouts:", error);
        } finally {
            setLayoutsLoading(false);
        }
    };

    const toggleDay = (num) => {
        setFormData(prev => {
            const arr = new Set(prev.daysOfWeek || []);
            if (arr.has(num)) arr.delete(num); else arr.add(num);
            return { ...prev, daysOfWeek: Array.from(arr).sort() };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.origin || !formData.destination || !formData.startDate || !formData.time || !formData.layout || (formData.daysOfWeek || []).length === 0) {
                alert("Completa todos los campos obligatorios");
                setLoading(false);
                return;
            }

            // Validar que endDate no sea anterior a startDate
            if (hasEndDate && formData.endDate) {
                if (formData.endDate < formData.startDate) {
                    alert("La fecha de fin no puede ser anterior a la fecha de inicio");
                    setLoading(false);
                    return;
                }
            }

            const dataToSave = {
                origin: formData.origin,
                destination: formData.destination,
                startDate: formData.startDate
                    ? formData.startDate.toISOString().split("T")[0]
                    : null,
                time: formData.time,
                company: formData.company,
                layout: formData.layout,
                daysOfWeek: formData.daysOfWeek,
            };

            // Solo enviar endDate si está activado y tiene valor
            if (hasEndDate && formData.endDate) {
                dataToSave.endDate = formData.endDate.toISOString().split("T")[0];
            } else {
                // Si el switch está desactivado, enviar null explícitamente
                dataToSave.endDate = null;
            }

            await onSave(dataToSave);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEndDateToggle = (checked) => {
        setHasEndDate(checked);
        if (!checked) {
            // Si se desactiva, limpiar la fecha de fin
            setFormData(prev => ({ ...prev, endDate: undefined }));
        }
    };

    const dayOptions = [
        { n: 1, label: 'Lunes' },
        { n: 2, label: 'Martes' },
        { n: 3, label: 'Miércoles' },
        { n: 4, label: 'Jueves' },
        { n: 5, label: 'Viernes' },
        { n: 6, label: 'Sábado' },
        { n: 7, label: 'Domingo' },
    ];

    const formatTime24h = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 4);

        let hours = digits.slice(0, 2);
        let minutes = digits.slice(2, 4);

        if (hours.length === 2) {
            const h = parseInt(hours, 10);
            if (h > 23) hours = "23";
        }

        if (minutes.length === 2) {
            const m = parseInt(minutes, 10);
            if (m > 59) minutes = "59";
        }

        if (digits.length <= 2) {
            return hours;
        }

        return `${hours}:${minutes}`;
    };

    const isPastDay = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const getServicesCount = () => {
        if (!formData.startDate || !formData.daysOfWeek.length) return 0;

        if (hasEndDate && formData.endDate) {
            // Calcular cuántos días hay entre startDate y endDate
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // Contar cuántos de esos días son días seleccionados
            let count = 0;
            for (let i = 0; i < diffDays; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);
                const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
                if (formData.daysOfWeek.includes(dayOfWeek)) {
                    count++;
                }
            }
            return count;
        } else {
            // Sin endDate: mostrar para 2 semanas (14 días)
            return formData.daysOfWeek.length * 2;
        }
    };

    const formatDateDMY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0].split("-").reverse().join("-");
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {template
                                    ? 'Modifica los detalles de esta plantilla de servicio'
                                    : 'Crea una nueva plantilla para generar servicios automáticamente'
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                <ScrollArea className="max-h-[70vh]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Bus className="h-5 w-5 text-blue-600" />
                                    Información del servicio
                                </CardTitle>
                                <CardDescription>
                                    Detalles principales del recorrido
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="origin" className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-gray-500" />
                                            Origen *
                                        </Label>
                                        <Input
                                            id="origin"
                                            name="origin"
                                            value={formData.origin}
                                            onChange={handleChange}
                                            placeholder="Ciudad de origen"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="destination">
                                            Destino *
                                        </Label>
                                        <Input
                                            id="destination"
                                            name="destination"
                                            value={formData.destination}
                                            onChange={handleChange}
                                            placeholder="Ciudad de destino"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time" className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            Hora de salida *
                                        </Label>
                                        <Input
                                            id="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    time: formatTime24h(e.target.value),
                                                }))
                                            }
                                            placeholder="HH:MM"
                                            maxLength={5}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company" className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-gray-500" />
                                            Compañía *
                                        </Label>
                                        <Input
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Nombre de la empresa"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Programación
                                </CardTitle>
                                <CardDescription>
                                    Define cuándo se ejecutarán los servicios
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        Fecha de inicio *
                                    </Label>
                                    <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full md:w-auto justify-between"
                                            >
                                                {formData.startDate
                                                    ? formatDateDMY(formData.startDate)
                                                    : "Seleccionar fecha"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                locale={es}
                                                selected={formData.startDate}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        startDate: date,
                                                    }));
                                                    setOpenStartDate(false);
                                                }}
                                                initialFocus
                                                disabled={isPastDay}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <p className="text-xs text-gray-500 mt-1">
                                        La generación de servicios comenzará a partir de esta fecha
                                    </p>
                                </div>

                                {/* Campo para fecha de fin */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="hasEndDate" className="flex items-center gap-2 cursor-pointer">
                                            <CalendarDays className="h-4 w-4 text-gray-500" />
                                            Establecer fecha de fin
                                        </Label>
                                        <Switch
                                            id="hasEndDate"
                                            checked={hasEndDate}
                                            onCheckedChange={handleEndDateToggle}
                                        />
                                    </div>

                                    {hasEndDate && (
                                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                                            <Label htmlFor="endDate" className="flex items-center gap-2 text-sm">
                                                Fecha de fin
                                            </Label>
                                            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full md:w-auto justify-between"
                                                    >
                                                        {formData.endDate
                                                            ? formatDateDMY(formData.endDate)
                                                            : "Seleccionar fecha"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        locale={es}
                                                        selected={formData.endDate}
                                                        onSelect={(date) => {
                                                            if (!date) return;
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                endDate: date,
                                                            }));
                                                            setOpenEndDate(false);
                                                        }}
                                                        initialFocus
                                                        disabled={(date) =>
                                                            isPastDay(date) ||
                                                            (formData.startDate && date < formData.startDate)
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Los servicios se generarán hasta esta fecha inclusive
                                            </p>
                                            {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    ⚠️ La fecha de fin no puede ser anterior a la fecha de inicio
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {!hasEndDate && (
                                        <p className="text-xs text-gray-500 pl-4">
                                            Los servicios se generarán indefinidamente
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label>Días de la semana *</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {dayOptions.map((day) => (
                                            <Button
                                                key={day.n}
                                                type="button"
                                                variant={formData.daysOfWeek.includes(day.n) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleDay(day.n)}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary">
                                            {formData.daysOfWeek.length} día(s) seleccionado(s)
                                        </Badge>
                                        <p className="text-xs text-gray-500">
                                            Se generarán {getServicesCount()} servicios
                                            {hasEndDate && formData.endDate ?
                                                ` hasta el ${formData.endDate.toLocaleDateString()}` :
                                                " en 2 semanas (por defecto)"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuración del bus */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <List className="h-5 w-5 text-purple-600" />
                                    Configuración del bus
                                </CardTitle>
                                <CardDescription>
                                    Selecciona el layout para los asientos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="layout" className="flex items-center gap-2">
                                        <List className="h-4 w-4 text-gray-500" />
                                        Layout del bus *
                                    </Label>
                                    {layoutsLoading ? (
                                        <div className="space-y-2">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ) : (
                                        <Select
                                            value={formData.layout}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, layout: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un layout" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {layouts.map((layout) => (
                                                    <SelectItem key={layout._id} value={layout._id}>
                                                        <div className="flex items-center justify-between">
                                                            <span>{layout.name}</span>
                                                            <Badge variant="outline" className="ml-2">
                                                                {layout.capacidad} asientos
                                                            </Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen y acciones */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Resumen</h3>
                                    <p className="text-sm text-gray-600">
                                        Revisa la información antes de guardar
                                    </p>
                                </div>
                                <Badge variant={template ? "outline" : "default"}>
                                    {template ? "Editando" : "Nueva"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-gray-500">Recorrido:</p>
                                    <p className="font-medium">
                                        {formData.origin || "—"} → {formData.destination || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500">Hora:</p>
                                    <p className="font-medium">{formData.time || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500">Inicia:</p>
                                    <p className="font-medium">
                                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500">Finaliza:</p>
                                    <p className="font-medium">
                                        {hasEndDate && formData.endDate
                                            ? new Date(formData.endDate).toLocaleDateString()
                                            : "Indefinido"}
                                    </p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-gray-500">Días seleccionados:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.daysOfWeek.length > 0 ? (
                                            formData.daysOfWeek.map(dayNum => {
                                                const day = dayOptions.find(d => d.n === dayNum);
                                                return (
                                                    <Badge key={dayNum} variant="outline" className="text-xs">
                                                        {day?.label}
                                                    </Badge>
                                                );
                                            })
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-gray-500">Servicios a generar:</p>
                                    <p className="font-medium text-blue-600">{getServicesCount()} servicios</p>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Guardando...
                                    </>
                                ) : template ? (
                                    "Actualizar plantilla"
                                ) : (
                                    "Crear plantilla"
                                )}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}