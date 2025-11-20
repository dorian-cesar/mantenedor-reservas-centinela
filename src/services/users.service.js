import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class UserService {
    static async getUsers(page = 1, limit = 10) {
        try {
            const response = await fetch(
                `${API_URL}/users?page=${page}&limit=${limit}`,
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

    static async updateUser(id, payload) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${SessionHelper.getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text().catch(() => null);
            throw new Error(txt || 'Error al actualizar usuario');
        }

        return await response.json();
    }

    static async activeUser(id, isActive) {
        const response = await fetch(`${API_URL}/users/${id}/activo`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SessionHelper.getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(isActive)
        });

        if (!response.ok) {
            const txt = await response.text().catch(() => null);
            throw new Error(txt || 'Error al actualizar usuario');
        }

        return await response.json();
    }

    static async createUser(payload) {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SessionHelper.getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text().catch(() => null);
            throw new Error(txt || 'Error al crear usuario');
        }

        return await response.json();
    }
}
export default UserService;