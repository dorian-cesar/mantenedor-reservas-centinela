class SessionHelper {
    static async loginSession(token, userData) {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Guardar en cookies para el middleware
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`; // 24 horas
                document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Strict`;
            }

            return { success: true };
        } catch (error) {
            console.error('Error saving session:', error);
            return { success: false, error: 'Error al guardar la sesión' };
        }
    }

    // Cerrar sesión
    static async logout() {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Eliminar cookies
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }

            return { success: true };
        } catch (error) {
            console.error('Error logging out:', error);
            return { success: false, error: 'Error al cerrar sesión' };
        }
    }

    // Obtener token
    static getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    // Obtener datos del usuario
    static getUser() {
        if (typeof window !== 'undefined') {
            try {
                const user = localStorage.getItem('user');
                return user ? JSON.parse(user) : null;
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Verificar si el usuario está autenticado
    static isAuthenticated() {
        if (typeof window !== 'undefined') {
            const token = this.getToken();
            return !!token;
        }
        return false;
    }

    // Validar token (podrías expandir esto para verificar expiración)
    static async validateToken() {
        try {
            const token = this.getToken();
            if (!token) {
                return { valid: false, error: 'No token found' };
            }

            // Aquí podrías hacer una llamada al API para verificar el token
            // Por ahora solo verificamos que exista
            return { valid: true };
        } catch (error) {
            console.error('Error validating token:', error);
            return { valid: false, error: 'Error validating token' };
        }
    }

    // Actualizar datos del usuario
    static updateUser(updatedUserData) {
        try {
            if (typeof window !== 'undefined') {
                const currentUser = this.getUser();
                const mergedUser = { ...currentUser, ...updatedUserData };
                localStorage.setItem('user', JSON.stringify(mergedUser));

                // Actualizar cookie también
                document.cookie = `user=${encodeURIComponent(JSON.stringify(mergedUser))}; path=/; max-age=86400; SameSite=Strict`;
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating user data:', error);
            return { success: false, error: 'Error al actualizar datos del usuario' };
        }
    }

    // Obtener headers para requests autenticados
    static getAuthHeaders() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }

    static isTokenExpired() {
        try {
            const token = this.getToken();
            if (!token) return true;

            // Decodificar el token JWT (parte del payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    // Verificar sesión completa (token existe y no está expirado)
    static isValidSession() {
        return this.isAuthenticated() && !this.isTokenExpired();
    }

    // Obtener tiempo restante de sesión en minutos
    static getSessionTimeLeft() {
        try {
            const token = this.getToken();
            if (!token) return 0;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const timeLeft = payload.exp - currentTime;

            return Math.max(0, Math.floor(timeLeft / 60)); // minutos restantes
        } catch (error) {
            return 0;
        }
    }
}

export default SessionHelper;