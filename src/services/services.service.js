import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ServicesService {
    static async generateOne(id) {
        try {
            const res = await fetch(`${API_URL}/services/generateOne/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al crear servicios');
            }

            const json = await res.json();
            return json;
        } catch (err) {
            console.error('generateOne error:', err);
            throw err;
        }
    }

    static async searchServices(origin, destination, date) {
        try {
            const res = await fetch(`${API_URL}/services/search?origin=${origin}&destination=${destination}&date=${date}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al cargar servicios');
            }

            const json = await res.json();
            return json;
        } catch (err) {
            console.error('searchServices error:', err);
            throw err;
        }
    }

    static async getGeneratedServices(filters = {}) {
        try {
            const {
                serviceNumber,
                startDate,
                endDate,
                origin,
                destination,
                page = 1,
                limit = 20
            } = filters;

            // Construir query string
            const params = new URLSearchParams();

            if (serviceNumber) params.append('serviceNumber', serviceNumber);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (origin) params.append('origin', origin);
            if (destination) params.append('destination', destination);
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`${API_URL}/services/generated?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al cargar servicios');
            }

            const json = await res.json();
            return json;
        } catch (err) {
            console.error('getGeneratedServices error:', err);
            throw err;
        }
    }

    static async deleteGeneratedServices(serviceNumber, fromDate) {
        try {
            const res = await fetch(`${API_URL}/services/generated/${serviceNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromDate: fromDate,
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al eliminar servicios');
            }

            const json = await res.json();
            return json;
        } catch (err) {
            console.error('deleteGeneratedServices error:', err);
            throw err;
        }
    }

    static async deleteServiceByID(serviceId, force = false) {
        const query = force ? '?force=true' : '';

        const res = await fetch(
            `${API_URL}/services/${serviceId}${query}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!res.ok) {
            const json = await res.json().catch(() => null);
            const error = new Error(json?.error || 'Error al eliminar servicio');
            error.status = res.status;
            throw error;
        }

        return res.json();
    }

    static async updateGeneratedServices(serviceNumber, params) {
        try {
            const response = await fetch(`${API_URL}/services/update/${serviceNumber}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error in updateGeneratedServices:', error);
            throw error;
        }
    }
}

export default ServicesService;
