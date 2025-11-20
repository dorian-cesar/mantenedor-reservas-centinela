"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Search,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Eye,
    X as XIcon
} from "lucide-react";

import Notification from "@/components/notification";
import ReportService from "@/services/reports.service";
import CitiesService from "@/services/cities.service";

import ReportModal from "@/components/modals/reportModal";

function formatDateInput(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return dt.toISOString().split("T")[0];
}

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
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return formatDateInput(d);
    });
    const [endDate, setEndDate] = useState(() => formatDateInput(new Date()));
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [partial, setPartial] = useState(false);
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
                // opcional: seleccionar primer destino automáticamente si hay uno
                // if (data && data.length) setDestination(data[0]);
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
        startDate,
        endDate,
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
            if (res.pagination && typeof res.pagination.total === "number") {
                setTotalResults(res.pagination.total);
                setTotalPages(res.pagination.totalPages || Math.max(1, Math.ceil(res.pagination.total / (period.limit || limit))));
            } else {
                // fallback: approximaciones
                const totalServicesEstimate = res.summary && typeof res.summary.totalServices === "number"
                    ? res.summary.totalServices
                    : servicesList.length;
                setTotalResults(totalServicesEstimate);
                setTotalPages(Math.max(1, Math.ceil(totalServicesEstimate / limit)));
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

    return (
        <div className="w-full p-4">
            <Notification type={notification.type} message={notification.message} />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">Reportes por rango de fechas</h2>

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

                {/* filtros */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-xl shadow p-4 w-full flex items-end"
                >
                    <div className="w-full grid grid-cols-10 gap-3 items-end">
                        <div className="col-span-2">
                            <label className="text-xs text-gray-600">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-gray-600">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="mt-1 w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-gray-600">Origen</label>
                            {originsLoading ? (
                                <div className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-500">Cargando...</div>
                            ) : (
                                <select
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">-- Todos los orígenes --</option>
                                    {origins.map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-gray-600">Destino</label>
                            {destinationsLoading ? (
                                <div className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-500">Cargando...</div>
                            ) : (
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="mt-1 w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">-- Todos los destinos --</option>
                                    {destinations.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            )}
                        </div>



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
                            onClick={() => {
                                setStartDate(formatDateInput(new Date(new Date().setDate(new Date().getDate() - 7))));
                                setEndDate(formatDateInput(new Date()));
                                setOrigin("");
                                setDestination("");
                                setPartial(false);
                                setSort("date:asc");
                                setPage(1);
                                loadReports(1);
                            }}
                            className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl border col-span-1"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>

                <div className="bg-white rounded-xl shadow-xl">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 table-auto text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Código</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Nombre</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Origen</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Destino</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Fecha</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Hora</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Pasajeros</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Disponibles</th>
                                            <th className="px-2 py-2 text-left text-xs font-bold uppercase">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {services.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-8 text-gray-500">No hay servicios</td>
                                            </tr>
                                        ) : services.map((s, idx) => (
                                            <tr key={s.serviceId || s._id || idx} className="hover:bg-gray-50 align-top">
                                                <td className="px-2 py-2 whitespace-normal break-words max-w-[80px] text-sm">
                                                    <div className="text-sm font-medium text-gray-500">#{s.serviceNumber}</div>
                                                </td>
                                                <td className="px-2 py-2 whitespace-normal break-words max-w-[180px] text-sm">
                                                    <div className="text-sm font-medium text-gray-900">{s.serviceName}</div>
                                                </td>
                                                <td className="px-2 py-2 whitespace-normal break-words max-w-[130px] text-sm">
                                                    <div className="text-sm text-gray-900">{s.origin}</div>
                                                </td>
                                                <td className="px-2 py-2 whitespace-normal break-words max-w-[130px] text-sm">
                                                    <div className="text-sm text-gray-900">{s.destination}</div>
                                                </td>
                                                <td className="px-2 py-2 whitespace-normal text-sm">{s.date}</td>
                                                <td className="px-2 py-2 whitespace-normal text-sm">{s.time}</td>
                                                <td className="px-2 py-2 whitespace-normal text-sm">{s.totalPassengers ?? "-"}</td>
                                                <td className="px-2 py-2 whitespace-normal text-sm">{s.availableSeats ?? "-"}</td>
                                                <td className="px-2 py-2 whitespace-normal text-sm">
                                                    <button
                                                        onClick={() => openServiceDetail(s.serviceId || s._id)}
                                                        className="bg-blue-200 text-blue-700 p-2 rounded-full hover:bg-blue-300"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* paginación */}
                {services.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 1 || loading}
                                className="bg-gray-200 text-gray-800 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="text-sm text-gray-600 font-medium">
                                Página {page} de {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={page === totalPages || loading}
                                className="bg-gray-200 text-gray-800 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            {totalResults} resultados
                        </div>
                    </div>
                )}
            </div>

            {showDetail && (
                <ReportModal
                    loading={detailLoading}
                    report={selectedServiceDetail}
                    onClose={closeDetail}
                />
            )}

            {/* {showDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">Detalle del servicio</h3>
                                {detailLoading && <div className="text-sm text-gray-500">Cargando...</div>}
                            </div>
                            <button onClick={closeDetail} className="p-2 rounded-md hover:bg-gray-100">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 max-h-[70vh] overflow-auto">
                            {!selectedServiceDetail ? (
                                <div className="text-center py-6 text-gray-500">Cargando detalle...</div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500">Servicio</div>
                                        <div className="text-lg font-medium">{selectedServiceDetail.serviceInfo?.serviceName}</div>
                                        <div className="text-xs text-gray-500">#{selectedServiceDetail.serviceInfo?.serviceNumber} — {selectedServiceDetail.serviceInfo?.date} {selectedServiceDetail.serviceInfo?.time}</div>
                                        <div className="text-xs text-gray-500">{selectedServiceDetail.serviceInfo?.origin} → {selectedServiceDetail.serviceInfo?.destination}</div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm font-semibold mb-2">Resumen</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500">Total asientos</div>
                                                <div className="text-lg font-medium">{selectedServiceDetail.summary?.totalSeats ?? "-"}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500">Confirmados</div>
                                                <div className="text-lg font-medium">{selectedServiceDetail.summary?.confirmedPassengers ?? "-"}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500">Reservados</div>
                                                <div className="text-lg font-medium">{selectedServiceDetail.summary?.reservedSeats ?? "-"}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-500">Disponibles</div>
                                                <div className="text-lg font-medium">{selectedServiceDetail.summary?.availableSeats ?? "-"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-semibold mb-2">Pasajeros</div>
                                        {selectedServiceDetail.passengers?.length === 0 ? (
                                            <div className="text-gray-500">No hay pasajeros</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedServiceDetail.passengers.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                                                        <div>
                                                            <div className="text-sm font-medium">{p.passengerName}</div>
                                                            <div className="text-xs text-gray-500">{p.passengerEmail}</div>
                                                        </div>
                                                        <div className="text-sm text-gray-800">
                                                            <div>{p.seatNumber}</div>
                                                            <div className="text-xs text-gray-500">{p.status}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button onClick={closeDetail} className="px-4 py-2 rounded-xl border">Cerrar</button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );

}
