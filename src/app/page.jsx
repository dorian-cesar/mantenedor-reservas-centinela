"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation";

import Notification from "@/components/notification";
import SessionHelper from "@/utils/session";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notification, setNotification] = useState({ type: '', message: '' });

  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  }

  const showNotification = ({ type, message }) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      showNotification({ type: "error", message: "Por favor completa todos los campos" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.token || data.status === 200)) {
        const rol = data.user.role;
        if (rol !== "admin" && rol !== "superUser") {
          showNotification({ type: "warning", message: "Acceso denegado, contacte un administrador." });
          setLoading(false);
          return;
        }
        if (data.token) {
          const sessionResult = await SessionHelper.loginSession(
            data.token,
            data.user
          );

          if (sessionResult.success) {
            showNotification({ type: "success", message: "Inicio de sesión exitoso" });
            setTimeout(() => {
              router.replace("/dashboard");
            }, 1500);
          } else {
            showNotification({ type: "error", message: sessionResult.error });
          }
        }
        return;
      }
      showNotification({ type: "error", message: data.mensaje || "Credenciales inválidas" });
    } catch (err) {
      console.error("fetch error:", err);
      showNotification({ type: "error", message: "Error al conectar con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Notification type={notification.type} message={notification.message} />
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">Inicia Sesión</h2>
            <p className="text-gray-500">Ingresa a tu cuenta</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="• • • • • • • •"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          <div className="text-center space-y-3 pt-4">
            <a href="#" className="block text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}