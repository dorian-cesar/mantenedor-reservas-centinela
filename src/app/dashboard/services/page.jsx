"use client"
import ServicesService from "@/services/services.service"
import { useState, useEffect } from "react"
import {
    Search,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Calendar,
    Filter,
    X,
    Loader2,
    AlertTriangle,
    ChevronDown,
    MoreHorizontal
} from "lucide-react"
import Notification from "@/components/notification"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { es } from "date-fns/locale"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"

import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"


export default function ServicesPage() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState({ type: '', message: '' })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteOneDialogOpen, setDeleteOneDialogOpen] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState(null)

    // Filtros
    const [filters, setFilters] = useState({
        serviceNumber: '',
        startDate: '',
        page: 1,
        limit: 20
    })

    // Paginación
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 20
    })

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification({ type: '', message: '' }), 5000)
    }

    // Cargar servicios
    const fetchServices = async (page = 1) => {
        try {
            setLoading(true)
            const data = await ServicesService.getGeneratedServices({
                ...filters,
                page
            })

            setServices(data.data || [])
            setPagination(data.pagination || {})
            setFilters(prev => ({ ...prev, page }))

        } catch (error) {
            console.error('Error fetching services:', error)
            showNotification('error', error.message || 'Error al cargar servicios')
            setServices([])
        } finally {
            setLoading(false)
        }
    }

    // Cargar servicios al montar el componente
    useEffect(() => {
        fetchServices(1)
    }, [])

    // Manejar cambios en filtros
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    // Buscar con filtros
    const handleSearch = (e) => {
        e?.preventDefault()
        fetchServices(1)
    }

    // Limpiar filtros
    const handleClearFilters = () => {
        setFilters({
            serviceNumber: '',
            startDate: '',
            page: 1,
            limit: 20
        })
        fetchServices(1)
    }

    // Paginación
    const handleNextPage = () => {
        if (pagination.page < pagination.totalPages) {
            fetchServices(pagination.page + 1)
        }
    }

    const handlePreviousPage = () => {
        if (pagination.page > 1) {
            fetchServices(pagination.page - 1)
        }
    }

    const handleDelete = async (id) => {
        if (!id) {
            showNotification('error', 'Debe especificar id de servicio')
            setDeleteOneDialogOpen(false)
            return
        }

        try {
            const result = await ServicesService.deleteServiceByID(id)
            showNotification('success', result.message || 'Servicio eliminado exitosamente')
            fetchServices(filters.page)
        } catch (error) {
            console.error('Error deleting service:', error)
            showNotification('error', error.message || 'Error al eliminar servicio')
        } finally {
            setDeleteOneDialogOpen(false)
        }
    }

    const openDeleteConfirm = (service) => {
        setServiceToDelete(service)
        setDeleteOneDialogOpen(true)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateLocal = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Notification type={notification.type} message={notification.message} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Servicios Generados</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los servicios generados automáticamente desde las plantillas
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => fetchServices(filters.page)}
                    className="gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        <CardTitle>Filtros de Búsqueda</CardTitle>
                    </div>
                    <CardDescription>
                        Filtra los servicios por número y fecha
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                            <div className="md:col-span-3 space-y-2">
                                <Label htmlFor="serviceNumber">Número de servicio</Label>
                                <Input
                                    id="serviceNumber"
                                    type="number"
                                    value={filters.serviceNumber}
                                    onChange={(e) => handleFilterChange('serviceNumber', e.target.value)}
                                    placeholder="Ej: 100"
                                    className="w-full"
                                />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <Label>Desde fecha</Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {filters.startDate
                                                    ? (filters.startDate)
                                                    : "Seleccionar fecha"}
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            locale={es}
                                            selected={
                                                filters.startDate
                                                    ? new Date(`${filters.startDate}T00:00:00`)
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                if (!date) return

                                                const formatted = formatDateLocal(date)

                                                setFilters(prev => ({
                                                    ...prev,
                                                    startDate: formatted,
                                                    page: 1
                                                }))
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="md:col-span-4 flex items-end gap-2">
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
                                    <X className="h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {filters.serviceNumber && filters.startDate ? (
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <span>
                                            Se están listando todos los servicios #{filters.serviceNumber} desde {formatDate(filters.startDate)}
                                        </span>
                                    </div>
                                ) : (
                                    <span>Especifica número y fecha para la busqueda</span>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Resultados */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Servicios encontrados</CardTitle>
                            <CardDescription>
                                {pagination.total > 0 ? (
                                    <>
                                        Mostrando {(pagination.page - 1) * pagination.limit + 1}-
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} servicios
                                    </>
                                ) : (
                                    "No hay servicios para mostrar"
                                )}
                            </CardDescription>
                        </div>
                        {services.length > 0 && (
                            <Badge variant="outline" className="text-sm">
                                Página {pagination.page} de {pagination.totalPages}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">No se encontraron servicios</h3>
                                <p className="text-gray-500 mt-1">
                                    {filters.serviceNumber || filters.startDate
                                        ? "Intenta con otros filtros de búsqueda"
                                        : "No hay servicios generados todavía"
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">N° Servicio</TableHead>
                                            <TableHead>Nombre del Servicio</TableHead>
                                            <TableHead>Origen</TableHead>
                                            <TableHead>Destino</TableHead>
                                            <TableHead className="w-[180px]">Fecha</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((service) => (
                                            <TableRow key={service._id} className="hover:bg-gray-50/50">
                                                <TableCell className="font-medium">
                                                    <Badge variant="secondary" className="font-mono">
                                                        #{service.serviceNumber}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <div className="truncate" title={service.serviceName}>
                                                        {service.serviceName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                        <span>{service.origin}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{service.destination}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm">{service.date}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                onClick={() => openDeleteConfirm(service)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Borrar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <AlertDialog open={deleteOneDialogOpen} onOpenChange={setDeleteOneDialogOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            ¿Eliminar este servicio?
                                        </AlertDialogTitle>

                                        <AlertDialogDescription>
                                            Esta acción eliminará permanentemente el siguiente servicio.
                                        </AlertDialogDescription>

                                        {serviceToDelete && (
                                            <div className="rounded-md border p-3 text-sm space-y-1 mt-3">
                                                <div><strong>N°:</strong> #{serviceToDelete.serviceNumber}</div>
                                                <div><strong>Nombre:</strong> {serviceToDelete.serviceName}</div>
                                                <div><strong>Fecha:</strong> {serviceToDelete.date}</div>
                                                <div>
                                                    <strong>Ruta:</strong> {serviceToDelete.origin} → {serviceToDelete.destination}
                                                </div>
                                            </div>
                                        )}
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>

                                        <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => handleDelete(serviceToDelete?._id)}
                                        >
                                            Sí, eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>


                            {/* Paginación */}
                            {services.length > 0 && (
                                <div className="flex items-center justify-between pt-6 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        {pagination.total} servicios en total
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handlePreviousPage}
                                            disabled={pagination.page === 1}
                                            className="h-8 w-8"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page >= pagination.totalPages - 2) {
                                                    pageNum = pagination.totalPages - 4 + i;
                                                } else {
                                                    pageNum = pagination.page - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pagination.page === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-8 w-8"
                                                        onClick={() => fetchServices(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleNextPage}
                                            disabled={pagination.page === pagination.totalPages}
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
        </div>
    )
}