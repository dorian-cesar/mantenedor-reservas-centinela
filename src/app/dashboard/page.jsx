"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  BarChart3,
  MessageCircle,
  Calendar,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const sections = [
    { name: "Usuarios", icon: Users, path: "/dashboard/users" },
    { name: "Ciudades", icon: FileText, path: "/dashboard/cities" },
    { name: "Reportes", icon: BarChart3, path: "/dashboard/reports" },
  ];

  return (
    <div className="px-6 py-10 space-y-10">
      {/* SECCIONES DEL SISTEMA */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Secciones del sistema
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ name, icon: Icon, path }) => (
            <div
              key={name}
              className="cursor-pointer bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all"
              onClick={() => router.push(path)}
            >
              <div className="p-6 flex items-center space-x-4">
                <div className="bg-indigo-500 text-white rounded-xl p-3">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
