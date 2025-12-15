import SessionHelper from "@/utils/session";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class TemplateService {
    static async getTemplates() {
        try {
            const res = await fetch(`${API_URL}/templates`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error("Error al obtener templates");
            return await res.json();
        } catch (error) {
            console.error("Error in getTemplates:", error);
            throw error;
        }
    }

    static async getTemplateById(id) {
        try {
            const res = await fetch(`${API_URL}/templates/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error("Error al obtener template");
            return await res.json();
        } catch (error) {
            console.error("Error in getTemplateById:", error);
            throw error;
        }
    }

    static async getTemplateByDays() {
        try {
            const res = await fetch(`${API_URL}/templates/byDay?activeOnly=true`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error("Error al obtener templates");
            return await res.json();
        } catch (error) {
            console.error("Error in getTemplateByDays:", error);
            throw error;
        }
    }

    static async getTemplatesBySpecificDay(day) {
        try {
            const res = await fetch(`${API_URL}/templates/day/${day}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SessionHelper.getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error("Error al obtener templates");
            return await res.json();
        } catch (error) {
            console.error("Error in getTemplatesBySpecificDay:", error);
            throw error;
        }
    }

    static async createTemplate(payload) {
        const res = await fetch(`${API_URL}/templates`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SessionHelper.getToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => null);
            throw new Error(txt || "Error al crear template");
        }
        return await res.json();
    }

    static async updateTemplate(id, payload) {
        const res = await fetch(`${API_URL}/templates/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${SessionHelper.getToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => null);
            throw new Error(txt || "Error al actualizar template");
        }
        return await res.json();
    }

    static async deleteTemplate(id) {
        const res = await fetch(`${API_URL}/templates/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${SessionHelper.getToken()}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => null);
            throw new Error(txt || "Error al eliminar template");
        }
        return await res.json();
    }

    static async toggleTemplate(id) {
        const res = await fetch(`${API_URL}/templates/${id}/toggle`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${SessionHelper.getToken()}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => null);
            throw new Error(txt || "Error al editar template");
        }
        return await res.json();
    }
}

export default TemplateService;
