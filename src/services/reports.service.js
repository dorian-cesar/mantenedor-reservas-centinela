import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ReportService {
    static async getServiceReport(id) {
        try {
            const response = await fetch(
                `${API_URL}/reports/service/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${SessionHelper.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener reporte del servicio');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getServiceReport:', error);
            throw error;
        }
    }

    static async getDateRangeReport({
        startDate,
        endDate,
        origin,
        destination,
        page = 1,
        limit = 20
    }) {
        try {
            const params = new URLSearchParams();

            // obligatorios
            params.append("startDate", startDate);
            params.append("endDate", endDate);

            // opcionales
            if (origin) params.append("origin", origin);
            if (destination) params.append("destination", destination);
            params.append("page", page);
            params.append("limit", limit);

            const response = await fetch(
                `${API_URL}/reports/date?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${SessionHelper.getToken()}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || "Error al obtener reporte por rango de fechas");
            }

            return await response.json();
        } catch (error) {
            console.error("Error en getDateRangeReport:", error);
            throw error;
        }
    }

    static async getPassengersReport(id) {
        try {
            const response = await fetch(
                `${API_URL}/reports/user/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${SessionHelper.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener reporte de pasajeros');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getPassengersReport:', error);
            throw error;
        }
    }
}
export default ReportService;