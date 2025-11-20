import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class CitiesService {
    static async getOrigins() {
        try {
            const res = await fetch(`${API_URL}/cities/origins`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al obtener orígenes');
            }

            const json = await res.json();
            return json.origins || [];
        } catch (err) {
            console.error('CitiesService.getOrigins error:', err);
            throw err;
        }
    }

    static async getDestinations(origin) {
        try {
            const encoded = encodeURIComponent(origin);
            const res = await fetch(`${API_URL}/cities/destinations/${encoded}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al obtener destinos');
            }

            const json = await res.json();
            // asumimos { origin: 'X', destinations: [...] }
            return json.destinations || [];
        } catch (err) {
            console.error('CitiesService.getDestinations error:', err);
            throw err;
        }
    }

    static async getMap() {
        try {
            const res = await fetch(`${API_URL}/cities/map`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => null);
                throw new Error(txt || 'Error al obtener mapa de ciudades');
            }

            const json = await res.json();
            return json || {};
        } catch (err) {
            console.error('CitiesService.getMap error:', err);
            throw err;
        }
    }
}

export default CitiesService;
