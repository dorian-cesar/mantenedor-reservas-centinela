"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SessionHelper from "@/utils/session";
import {
  Home,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  Mail,
  Calendar,
  HelpCircle,
  LogOut,
  Building2,
  Ticket,
  Bus
} from "lucide-react";

export default function Sidebar({ className = "" }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [superUser, setSuperUser] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        setUser({ name: userData, email: "" });
      }
    }
    const currentUser = SessionHelper.getUser();
    setSuperUser(String(currentUser?.role) === "superUser");
  }, []);

  const adminItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Users size={20} />, label: "Usuarios", href: "/dashboard/users" },
    {
      icon: <Ticket size={20} />,
      label: "Reservar Asiento",
      href: "/dashboard/reserve",
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Reportes",
      href: "/dashboard/reports",
    },
  ];

  const superUserItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Users size={20} />, label: "Usuarios", href: "/dashboard/users" },
    {
      icon: <Building2 size={20} />,
      label: "Ciudades",
      href: "/dashboard/cities",
    },
    {
      icon: <Ticket size={20} />,
      label: "Reservar Asiento",
      href: "/dashboard/reserve",
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Reportes",
      href: "/dashboard/reports",
    },
    { icon: <Calendar size={20} />, label: "Templates", href: "/dashboard/templates" },
    { icon: <Bus size={20} />, label: "Servicios", href: "/dashboard/services" },
  ];

  const adminBottomMenuItems = [
  ];

  const superUserBottomMenuItems = [
    // { icon: <Settings size={20} />, label: "Configuración", href: "/settings" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    await SessionHelper.logout();
    router.replace("/");
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
    <div
      className={`flex flex-col bg-linear-to-b from-slate-900 to-black border-gray-800 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
        } ${className}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-22">
        {!isCollapsed && (
          <div className="flex items-center justify-center w-full space-x-2">
            <img src="/wit-logo.png" alt="logo wit" className="h-10" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {(superUser ? superUserItems : adminItems).map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-xl px-3 py-3 transition-all
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-100 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4  space-y-1">
        {(superUser ? superUserBottomMenuItems : adminBottomMenuItems).map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center rounded-xl px-3 py-3 transition-all duration-200 group ${isActive
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "text-gray-100 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}

        <div>
          {superUser && !isCollapsed && (
            <p className="text-xs text-gray-700 text-center">
              v.2.0.4
            </p>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center rounded-xl px-3 py-3 text-red-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <LogOut size={20} />
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-medium text-sm">Cerrar Sesión</span>
            )}
          </button>
        </div>

      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {user?.name || "Usuario Sistema"}
              </p>
              <p className="text-xs text-gray-100 truncate">
                {user?.email || "usuario@sistema.cl"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
