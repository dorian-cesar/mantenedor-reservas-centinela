"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Eye,
    X as XIcon,
    MapPin,
    Filter,
    Loader2,
    Calendar as CalendarIcon
} from "lucide-react";

import Notification from "@/components/notification";
import ReportService from "@/services/reports.service";
import CitiesService from "@/services/cities.service";

import ReportModal from "@/components/modals/reportModal";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const getDefaultRange = () => {
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 7);

    return {
        start: from,
        end: today,
    };
};

export default function ReportsPage() {
    // data & UI state
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });

    // cities
    const [origins, setOrigins] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [originsLoading, setOriginsLoading] = useState(false);
    const [destinationsLoading, setDestinationsLoading] = useState(false);

    // filtros
    const { start, end } = getDefaultRange();
    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [sort, setSort] = useState("date:asc");

    // paginación
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // detalle modal
    const [showDetail, setShowDetail] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: "", message: "" }), 5000);
    };

    // load origins once
    useEffect(() => {
        let mounted = true;
        const loadOrigins = async () => {
            try {
                setOriginsLoading(true);
                const data = await CitiesService.getOrigins();
                if (!mounted) return;
                setOrigins(data || []);
            } catch (err) {
                console.error("No se pudieron cargar orígenes:", err);
                showNotification("error", "No se pudieron cargar orígenes");
            } finally {
                if (mounted) setOriginsLoading(false);
            }
        };
        loadOrigins();
        return () => { mounted = false; };
    }, []);

    // load destinations when origin changes
    useEffect(() => {
        let mounted = true;
        const loadDestinations = async () => {
            if (!origin) {
                setDestinations([]);
                setDestination("");
                return;
            }
            try {
                setDestinationsLoading(true);
                const data = await CitiesService.getDestinations(origin);
                if (!mounted) return;
                setDestinations(data || []);
            } catch (err) {
                console.error("No se pudieron cargar destinos:", err);
                showNotification("error", "No se pudieron cargar destinos");
            } finally {
                if (mounted) setDestinationsLoading(false);
            }
        };
        loadDestinations();
        return () => { mounted = false; };
    }, [origin]);

    const buildQueryOptions = useCallback(() => ({
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        page,
        limit
    }), [startDate, endDate, origin, destination, page, limit]);

    // load reports (page param override)
    const loadReports = useCallback(async (usePage = 1) => {
        try {
            setLoading(true);
            const opts = { ...buildQueryOptions(), page: usePage };
            const res = await ReportService.getDateRangeReport(opts);

            // defensivo: algunos nombres posibles de respuesta
            const servicesList = res.services || res.data || [];
            setServices(servicesList);

            // paginación / periodo
            const period = res.period || {};
            setPage(period.page ? Number(period.page) : usePage);
            setLimit(period.limit ? Number(period.limit) : limit);

            // pagination object (backend)
            if (res.pagination && typeof res.pagination.totalItems === "number") {
                setTotalResults(res.pagination.totalItems);
                setTotalPages(res.pagination.totalPages || Math.max(1, Math.ceil(res.pagination.totalItems / (period.limit || limit))));
            }
        } catch (err) {
            console.error("Error cargando reportes:", err);
            showNotification("error", "Error al cargar reportes: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    }, [buildQueryOptions, limit]);

    // carga inicial de listados
    useEffect(() => {
        loadReports(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // recargar al cambiar de página
    useEffect(() => {
        // evita llamar en el primer render porque ya lo hizo el efecto anterior
        loadReports(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        setPage(1);
        await loadReports(1);
    };

    const handleRefresh = () => {
        loadReports(page);
        showNotification("success", "Listado actualizado");
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const handleClearFilters = () => {
        const { start, end } = getDefaultRange();

        setStartDate(start);
        setEndDate(end);
        setOrigin("");
        setDestination("");
        setSort("date:asc");
        setPage(1);

        loadReports(1);
    };

    const openServiceDetail = async (serviceId) => {
        try {
            setShowDetail(true);
            setDetailLoading(true);
            setSelectedServiceDetail(null);

            const res = await ReportService.getServiceReport(serviceId);
            setSelectedServiceDetail(res);
        } catch (err) {
            console.error("Error al obtener detalle:", err);
            showNotification("error", "No se pudo obtener detalle del servicio");
            setShowDetail(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setShowDetail(false);
        setSelectedServiceDetail(null);
        setDetailLoading(false);
    };

    const hasActiveFilters = () => {
        return startDate || endDate || origin || destination;
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes por Rango de Fechas</h1>
                        <p className="text-muted-foreground mt-1">
                            Consulta y analiza servicios dentro de un período específico
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Refrescar
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            <CardTitle>Filtros de búsqueda</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                                        Desde
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"
                                                    }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate
                                                    ? format(startDate, "PPP", { locale: es })
                                                    : "Selecciona una fecha"}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                locale={es}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                                        Hasta
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"
                                                    }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate
                                                    ? format(endDate, "PPP", { locale: es })
                                                    : "Selecciona una fecha"}
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                locale={es}
                                                disabled={(date) =>
                                                    startDate ? date < startDate : false
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="origin" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        Origen
                                    </Label>
                                    {originsLoading ? (
                                        <div className="h-10 flex items-center justify-center border rounded-md">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <Select value={origin} onValueChange={setOrigin}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos los orígenes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos los orígenes</SelectItem>
                                                {origins.map((o) => (
                                                    <SelectItem key={o} value={o}>{o}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Destino */}
                                <div className="space-y-2">
                                    <Label htmlFor="destination" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        Destino
                                    </Label>
                                    {destinationsLoading ? (
                                        <div className="h-10 flex items-center justify-center border rounded-md">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <Select
                                            value={destination}
                                            onValueChange={setDestination}
                                            disabled={!origin}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={origin ? "Selecciona destino" : "Primero selecciona origen"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos los destinos</SelectItem>
                                                {destinations.map((d) => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Botones de acción */}
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

                            {hasActiveFilters() && (
                                <>
                                    <Separator />
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-sm text-muted-foreground">Filtros aplicados:</span>
                                        {startDate && (
                                            <Badge variant="secondary" className="gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Desde: {format(startDate, "dd/MM/yyyy", { locale: es })}
                                                <button
                                                    onClick={() => setStartDate(null)}
                                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {endDate && (
                                            <Badge variant="secondary" className="gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                Hasta: {format(endDate, "dd/MM/yyyy", { locale: es })}
                                                <button
                                                    onClick={() => setEndDate(null)}
                                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {origin && origin !== 'todos' && (
                                            <Badge variant="secondary" className="gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Origen: {origin}
                                                <button
                                                    onClick={() => setOrigin("")}
                                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                        {destination && destination !== 'todos' && (
                                            <Badge variant="secondary" className="gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Destino: {destination}
                                                <button
                                                    onClick={() => setDestination("")}
                                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        )}
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Tabla de resultados */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Resultados del reporte</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {totalResults > 0
                                        ? `Mostrando ${services.length} de ${totalResults} servicios`
                                        : "No hay servicios para mostrar"
                                    }
                                </p>
                            </div>
                            {totalResults > 0 && (
                                <Badge variant="outline">
                                    Página {page} de {totalPages}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Filter className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {hasActiveFilters() ? "No se encontraron servicios" : "No hay servicios disponibles"}
                                </h3>
                                <p className="text-gray-500">
                                    {hasActiveFilters()
                                        ? "Intenta con otros criterios de búsqueda"
                                        : "No se encontraron servicios en el rango de fechas seleccionado"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Código</TableHead>
                                            <TableHead>Nombre del servicio</TableHead>
                                            <TableHead>Origen</TableHead>
                                            <TableHead>Destino</TableHead>
                                            <TableHead className="w-[120px]">Fecha</TableHead>
                                            <TableHead className="w-[80px]">Hora</TableHead>
                                            <TableHead className="w-[100px]">Pasajeros</TableHead>
                                            <TableHead className="w-[100px]">Disponibles</TableHead>
                                            <TableHead className="w-[80px] text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((s, idx) => (
                                            <TableRow key={s.serviceId || s._id || idx} className="hover:bg-gray-50/50">
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        #{s.serviceNumber}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px] truncate" title={s.serviceName}>
                                                        {s.serviceName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-green-600" />
                                                        <span>{s.origin}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{s.destination}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {s.date}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">{s.time}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={s.totalPassengers > 0 ? "default" : "outline"}
                                                        className={s.totalPassengers > 0 ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                                                    >
                                                        {s.totalPassengers ?? "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={s.availableSeats > 0 ? "default" : "outline"}
                                                        className={s.availableSeats > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                                    >
                                                        {s.availableSeats ?? "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openServiceDetail(s.serviceId || s._id)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>

                    {/* Paginación */}
                    {services.length > 0 && (
                        <div className="border-t px-6 py-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePreviousPage}
                                        disabled={page === 1 || loading}
                                        className="h-8 w-8"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium px-2">
                                        Página {page} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNextPage}
                                        disabled={page === totalPages || loading}
                                        className="h-8 w-8"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal de detalle */}
            {showDetail && (
                <ReportModal
                    loading={detailLoading}
                    report={selectedServiceDetail}
                    onClose={closeDetail}
                />
            )}
        </div>
    );
}