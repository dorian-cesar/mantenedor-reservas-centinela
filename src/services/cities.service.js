import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class CitiesService {
    static async getCities() {
        try {
            const response = await fetch(
                `${API_URL}/cities/origins`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${SessionHelper.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getUsers:', error);
            throw error;
        }
    }

    static async getMap() {
        try {
            const response = await fetch(
                `${API_URL}/cities/map`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${SessionHelper.getToken()}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getUsers:', error);
            throw error;
        }
    }
}
export default CitiesService;