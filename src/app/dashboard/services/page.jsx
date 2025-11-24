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
    X
} from "lucide-react"
import Notification from "@/components/notification"

export default function ServicesPage() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState({ type: '', message: '' })

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

    // Eliminar servicios
    const handleDeleteServices = async () => {
        if (!filters.serviceNumber || !filters.startDate) {
            showNotification('error', 'Debe especificar número de servicio y fecha de inicio')
            return
        }

        if (!confirm(`¿Está seguro de eliminar todos los servicios ${filters.serviceNumber} desde ${filters.startDate}?`)) {
            return
        }

        try {
            const result = await ServicesService.deleteGeneratedServices(filters.serviceNumber, filters.startDate)
            showNotification('success', result.message || 'Servicios eliminados exitosamente')
            fetchServices(filters.page) // Recargar la página actual
        } catch (error) {
            console.error('Error deleting services:', error)
            showNotification('error', error.message || 'Error al eliminar servicios')
        }
    }

    return (
        <div className="w-full p-6">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Servicios Generados</h1>
                    <button
                        onClick={() => fetchServices(filters.page)}
                        className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        <span>Actualizar</span>
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
                    </div>
                    <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-4 w-full flex items-end">
                        <div className="w-full grid grid-cols-10 gap-3 items-end">
                            <div className="col-span-3">
                                <label className="text-xs text-gray-600">Número de servicio</label>
                                <input
                                    type="number"
                                    value={filters.serviceNumber}
                                    onChange={(e) => handleFilterChange('serviceNumber', e.target.value)}
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                    placeholder="Ej: 100"
                                />
                            </div>

                            <div className="col-span-3">
                                <label className="text-xs text-gray-600">Desde</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="col-span-2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 col-span-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        <span>Buscar</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl border col-span-1"
                                >
                                    Limpiar
                                </button>
                            </div>

                            <div className="col-span-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleDeleteServices}
                                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Borrar servicios</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Resultados */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                N° Servicio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Origen
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Destino
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Fecha
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    No se encontraron servicios
                                                </td>
                                            </tr>
                                        ) : (
                                            services.map((service) => (
                                                <tr key={service._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{service.serviceNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {service.serviceName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {service.origin}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {service.destination}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {service.date}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {services.length > 0 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handlePreviousPage}
                                            disabled={pagination.page === 1}
                                            className="flex items-center gap-2 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <span className="text-sm text-gray-600">
                                            Página {pagination.page} de {pagination.totalPages}
                                        </span>

                                        <button
                                            onClick={handleNextPage}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="flex items-center gap-2 px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {pagination.total} servicios encontrados
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}