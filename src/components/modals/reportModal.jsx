import { X as XIcon, ArrowRight } from "lucide-react";

export default function ReportModal({ report, loading, onClose }) {

    const exportCSV = () => {
        if (!report) return;

        const rows = [
            ["Código Servicio", "Origen", "Destino", "Hora de salida", "Nombre", "Apellido", "Correo"]
        ];

        report.passengers?.forEach(p => {
            const [firstName, ...lastNameParts] = p.passengerName.split(" ");
            const lastName = lastNameParts.join(" ");
            rows.push([
                report.serviceInfo.serviceNumber,
                report.serviceInfo.origin,
                report.serviceInfo.destination,
                report.serviceInfo.time,
                firstName,
                lastName,
                p.passengerEmail
            ]);
        });

        // Convertir a CSV
        const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");

        // Crear Blob y descargar
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `servicio_${report.serviceInfo.serviceNumber}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        {loading ? (<h3 className="text-lg font-semibold">Detalle del servicio...</h3>) : <h3 className="text-lg font-semibold">Detalle del servicio #{report.serviceInfo?.serviceNumber}</h3>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-auto">
                    {!report ? (
                        <div className="text-center py-6 text-gray-500">Cargando detalle...</div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <div className="text-sm text-gray-500">Servicio</div>
                                <div className="text-lg font-medium">{report.serviceInfo?.serviceName}</div>
                                <div className="text-md text-gray-500">{report.serviceInfo?.date} - {report.serviceInfo?.time}</div>
                                <div className="text-md text-gray-500 flex items-center gap-4">{report.serviceInfo?.origin}{<ArrowRight size={15} />}{report.serviceInfo?.destination}</div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm font-semibold mb-2">Resumen</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">Total asientos</div>
                                        <div className="text-lg font-medium">{report.summary?.totalSeats ?? "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">Confirmados</div>
                                        <div className="text-lg font-medium">{report.summary?.confirmedPassengers ?? "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">Reservados</div>
                                        <div className="text-lg font-medium">{report.summary?.reservedSeats ?? "-"}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500">Disponibles</div>
                                        <div className="text-lg font-medium">{report.summary?.availableSeats ?? "-"}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-semibold mb-2">Pasajeros</div>
                                {report.passengers?.length === 0 ? (
                                    <div className="text-gray-500">No hay pasajeros</div>
                                ) : (
                                    <div className="space-y-2">
                                        {report.passengers.map((p, i) => (
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
                    <button onClick={exportCSV} className="px-4 py-2 rounded-xl border">Exportar (CSV)</button>
                </div>
            </div>
        </div>
    )
};