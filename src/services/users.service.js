import SessionHelper from '@/utils/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class UserService {
    static async getUsers() {
        try {
            const response = await fetch(`${API_URL}users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getUsers:', error);
            throw error;
        }
    }

    static async getUserByID(userID) {
        try {
            const response = await fetch(`${API_URL}users/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.mensaje || `Usuario ${userID} no encontrado`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getUserByID:', error);
            throw error;
        }
    }

    static async createUser(userData) {
        try {
            const response = await fetch(`${API_URL}users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensaje || 'Error al crear usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en createUser:', error);
            throw error;
        }
    }

    static async updateUser(id, userData) {
        try {
            const response = await fetch(`${API_URL}users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en updateUser:', error);
            throw error;
        }
    }

    static async updatePassword(id, nuevaPassword) {
        try {
            const response = await fetch(`${API_URL}users/${id}/password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nuevaPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensaje || 'Error al actualizar contraseña');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en updatePassword:', error);
            throw error;
        }
    }

    static async deactivateUser(id) {
        try {
            const response = await fetch(`${API_URL}users/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'inactivo' }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensaje || 'Error al desactivar usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en deactivateUser:', error);
            throw error;
        }
    }

    static async activateUser(id) {
        try {
            const response = await fetch(`${API_URL}users/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SessionHelper.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: 'activo' }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.mensaje || 'Error al activar usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en activateUser:', error);
            throw error;
        }
    }
}

export default UserService;