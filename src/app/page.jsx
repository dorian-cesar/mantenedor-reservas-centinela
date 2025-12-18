"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import Notification from "@/components/notification"
import SessionHelper from "@/utils/session"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [notification, setNotification] = useState({ type: "", message: "" })

  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const showNotification = ({ type, message }) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: "", message: "" }), 5000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      showNotification({ type: "error", message: "Por favor completa todos los campos" })
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && (data.token || data.status === 200)) {
        const role = data?.user?.role

        if (role !== "admin" && role !== "superUser") {
          showNotification({
            type: "warning",
            message: "Acceso denegado, contacte un administrador.",
          })
          return
        }

        if (data.token) {
          const sessionResult = await SessionHelper.loginSession(
            data.token,
            data.user
          )

          if (sessionResult.success) {
            showNotification({
              type: "success",
              message: "Inicio de sesión exitoso",
            })
            setTimeout(() => router.replace("/dashboard"), 1500)
          } else {
            showNotification({
              type: "error",
              message: sessionResult.error,
            })
          }
        }
        return
      }

      showNotification({
        type: "error",
        message: data.message || "Credenciales inválidas",
      })
    } catch (err) {
      console.error("fetch error:", err)
      showNotification({
        type: "error",
        message: "Error al conectar con el servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Notification type={notification.type} message={notification.message} />

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Inicia Sesión</CardTitle>
          <CardDescription>
            Ingresa con tus credenciales
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center pt-2">
              <a
                href="#"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

          </form>
        </CardContent>
      </Card>

      <div className="absolute bottom-5 right-5 w-15 h-auto">
        <img src="/logo-wit-dark.png" alt="Logo Wit" />
      </div>
    </div>
  )
}
