import SessionHelper from "@/utils/session";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class LayoutService {
    static async getLayouts() {
        const res = await fetch(`${API_URL}/layouts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SessionHelper.getToken()}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error("Error al obtener layouts");
        return await res.json();
    }
}

export default LayoutService;
