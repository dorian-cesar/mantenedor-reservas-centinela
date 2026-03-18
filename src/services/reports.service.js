import SessionHelper from "@/utils/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ReportService {
  static async getServiceReport(id) {
    try {
      const response = await fetch(`${API_URL}/reports/service/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SessionHelper.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener reporte del servicio");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getServiceReport:", error);
      throw error;
    }
  }

  static async getDateRangeReport({
    startDate,
    endDate,
    origin,
    destination,
    page = 1,
    limit = 20,
  }) {
    try {
      const params = new URLSearchParams();

      // obligatorios
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      // opcionales
      if (origin) params.append("origin", origin);
      if (destination) params.append("destination", destination);
      params.append("page", page);
      params.append("limit", limit);

      const response = await fetch(
        `${API_URL}/reports/date?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${SessionHelper.getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Error al obtener reporte por rango de fechas");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getDateRangeReport:", error);
      throw error;
    }
  }

  static async getPassengersReport(id) {
    try {
      const response = await fetch(`${API_URL}/reports/user/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SessionHelper.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener reporte de pasajeros");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getPassengersReport:", error);
      throw error;
    }
  }

  static async getMassiveReport({ startDate, endDate, origin, destination }) {
    try {
      // 1. Obtener todos los servicios paginando de 100 en 100
      const allServices = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);
        params.append("page", currentPage);
        params.append("limit", 100);
        if (origin) params.append("origin", origin);
        if (destination) params.append("destination", destination);

        const response = await fetch(
          `${API_URL}/reports/date?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${SessionHelper.getToken()}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Error al obtener reporte masivo");

        const res = await response.json();
        const services = res.services || res.data || [];
        allServices.push(...services);

        totalPages = res.pagination?.totalPages ?? 1;
        currentPage++;
      } while (currentPage <= totalPages);

      // 2. Obtener detalle de cada servicio en chunks de 50
      const chunkSize = 25;
      const details = [];

      for (let i = 0; i < allServices.length; i += chunkSize) {
        const chunk = allServices.slice(i, i + chunkSize);
        const chunkDetails = await Promise.all(
          chunk.map((s) =>
            ReportService.getServiceReport(s.serviceId || s._id),
          ),
        );
        details.push(...chunkDetails);
      }

      return { details, startDate, endDate };
    } catch (error) {
      console.error("Error en getMassiveReport:", error);
      throw error;
    }
  }
}
export default ReportService;
