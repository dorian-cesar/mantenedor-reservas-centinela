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
}

export default ServicesService;
