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

    static async getAllUsers(options = {}) {
        try {
            const qs = (params) =>
                Object.entries(params || {})
                    .filter(([k, v]) => v !== undefined && v !== null && String(v) !== "")
                    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                    .join("&");

            // 1) pedir solo para obtener total (puede ser limit=1)
            const firstUrl = `${API_URL}/users?${qs({ page: 1, limit: 1, ...options })}`;
            const firstRes = await fetch(firstUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json",
                },
            });
            if (!firstRes.ok) throw new Error("Error al obtener total de usuarios");
            const firstJson = await firstRes.json();
            const total = firstJson.pagination?.total ?? 0;
            if (total === 0) {
                return { success: true, data: [], pagination: firstJson.pagination || { total: 0 } };
            }

            // 2) pedir todo usando limit=total (respeta filtros)
            const allUrl = `${API_URL}/users?${qs({ page: 1, limit: total, ...options })}`;
            const allRes = await fetch(allUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json",
                },
            });
            if (!allRes.ok) throw new Error("Error al obtener todos los usuarios");
            const allJson = await allRes.json();
            return allJson;
        } catch (error) {
            console.error("Error en getAllUsers:", error);
            throw error;
        }
    }
}
export default UserService;