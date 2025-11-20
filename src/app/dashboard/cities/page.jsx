"use client";
import { useEffect, useState } from "react";
import { RefreshCcw, Users } from "lucide-react";
import Notification from "@/components/notification";
import CitiesService from "@/services/cities.service";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 5000);
  };

  useEffect(() => {
    loadCities();
  }, []);

  const handleRefresh = () => {
    loadCities();
    showNotification("success", "Lista actualizada");
  };

  const loadCities = async () => {
    try {
      setLoading(true);
      const res = await CitiesService.getMap();

      const formatted = Object.entries(res).map(([origin, destinations]) => ({
        origin,
        destinations,
      }));

      setCities(formatted);
    } catch (error) {
      showNotification("error", "Error al cargar ciudades: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4">
      <Notification type={notification.type} message={notification.message} />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Ciudades</h2>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
            aria-label="Refrescar"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Refrescar</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {/* Tabla para pantallas grandes */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Origen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Destinos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cities.map((city, idx) => (
                      <tr key={city.origin}>
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{city.origin}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {city.destinations.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista móvil */}
              <div className="md:hidden p-4">
                {cities.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron ciudades</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {cities.map((city, idx) => (
                      <li key={idx} className="border rounded-lg p-3">
                        <div className="text-sm font-medium">{city.origin}</div>
                        <div className="text-xs text-gray-500">
                          {city.destinations.join(", ")}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
