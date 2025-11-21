"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import SessionHelper from "@/utils/session";
import Notification from "./notification";

import { ChevronDown } from "lucide-react";

export default function Navbar({ onMenuToggle, className = "" }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [user, setUser] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  const handleSessionExpired = () => {
    SessionHelper.logout();
    router.replace("/");
  };

  useEffect(() => {
    setIsClient(true);
    const u = SessionHelper.getUser();
    setUser(u);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkSession = () => {
      if (!SessionHelper.isValidSession()) {
        handleSessionExpired();
        return;
      }

      const minutesLeft = SessionHelper.getSessionTimeLeft();

      console.log("Minutes left:", minutesLeft); // Para debug

      if (minutesLeft > 0 && minutesLeft <= 15) {
        setShowSessionWarning(true);
        handleSessionExpired();
      } else {
        setShowSessionWarning(false);
      }
    };

    const interval = setInterval(checkSession, 30000);
    checkSession();

    return () => clearInterval(interval);
  }, [isClient, router]);

  const handleLogout = async () => {
    await SessionHelper.logout();
    router.replace("/");
  };

  const getPageTitle = () => {
    const routes = {
      "/dashboard": "Dashboard",
      "/dashboard/users": "Gestión de Usuarios",
      "/dashboard/cities": "Origenes y Destinos",
      "/dashboard/reserve": "Reservar Asientos",
      "/dashboard/reports": "Reportes y Exportación",
      "/messages": "Mensajes",
      "/calendar": "Calendario",
      "/settings": "Configuración",
      "/help": "Ayuda y Soporte",
    };
    return routes[pathname] || "Dashboard";
  };

  const getUserInitials = () => {
    if (!user) return "US";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "US";
  };

  return (
    <>
      {showSessionWarning && (
        <Notification
          type="warning"
          message={`Tu sesión está por expirar. Por favor, guarda tu trabajo.`}
          title="Sesión próxima a expirar"
          timer={5000}
        />
      )}
      <div
        className={`bg-linear-to-r from-white to-sky-200 border-b border-gray-200 h-22 ${className}`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>

                {/* Renderizar mensaje de bienvenida solo en cliente para evitar mismatch */}
                {isClient && (
                  <p className="text-sm text-gray-500 mt-1">
                    Bienvenido de vuelta, {user?.name?.split(" ")[0] || "Usuario"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50/30 transition-colors duration-200 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "Usuario Sistema"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "Admin"}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || "Usuario Sistema"} · {user?.role || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "admin@sistema.com"}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          handleLogout();
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for dropdown */}
        {isProfileOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileOpen(false)}
          />
        )}
      </div>
    </>
  );
}
