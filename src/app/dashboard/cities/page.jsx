"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  XIcon,
} from "lucide-react";
import Notification from "@/components/notification";
import CitiesService from "@/services/cities.service";
import UserModal from "@/components/modals/userModal";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [showModal, setShowModal] = useState(false);

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
      const res = await CitiesService.getCities();
      setCities(res.data);
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white border px-3 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
              aria-label="Refrescar"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Refrescar</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {/* Tabla para md+ */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cities.map((city, idx) => (
                      <tr key={city._id} className={`hover:bg-gray-50`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {(page - 1) * limit + idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {city.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {city.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(
                              city.role
                            )}`}
                          >
                            {city.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista para sm/md pequeños */}
              <div className="md:hidden p-4">
                {cities.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron ciudades</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {cities.map((city, idx) => (
                      <li key={city._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="text-sm font-medium">
                              {city.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {city.email}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadgeClass(
                                city.role
                              )}`}
                            >
                              {city.role}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cities.length === 0 && (
                <div className="text-center py-8 hidden md:block">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron ciudades</p>
                </div>
              )}
            </>
          )}
        </div>

        {cities > 0 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1 || loading}
                className="bg-linear-to-tr from-gray-400 to-gray-500 hover:from-gray-600 hover:to-gray-800 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-gray-600 font-medium">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                className="bg-linear-to-tr from-gray-400 to-gray-500 hover:from-gray-600 hover:to-gray-800 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm text-gray-500 hidden sm:block">
              {total} resultados
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
