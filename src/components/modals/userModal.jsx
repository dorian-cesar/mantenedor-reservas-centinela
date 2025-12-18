"use client"

import { useEffect, useRef, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { User, Mail, Lock, Shield, IdCard } from "lucide-react"
import SessionHelper from "@/utils/session"

export default function UserModal({ user, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        rut: "",
        role: "user",
    })
    const [loading, setLoading] = useState(false)
    const [superUser, setSuperUser] = useState(false)
    const passwordRef = useRef(null)

    useEffect(() => {
        const currentUser = SessionHelper.getUser()
        setSuperUser(currentUser?.role?.toLowerCase() === "superuser")
    }, [])

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                rut: user.rut || "",
                role: user.role || "user",
            })
        }
    }, [user])

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!user && (!formData.password || formData.password.length < 6)) {
                alert("La contraseña es obligatoria y debe tener al menos 6 caracteres.")
                passwordRef.current?.focus()
                return
            }

            let payload = {
                name: formData.name,
                email: formData.email,
                rut: formData.rut,
                role: formData.role,
            }

            if (!user || formData.password.length >= 6) {
                payload.password = formData.password
            }

            await onSave(payload)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {user ? "Editar Usuario" : "Nuevo Usuario"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nombre */}
                    <div className="space-y-1">
                        <Label>Nombre completo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <Label>Correo electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                className="pl-10"
                                value={formData.email}
                                onChange={e => handleChange("email", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <Label>
                            {user
                                ? superUser
                                    ? "Cambiar contraseña"
                                    : "Contraseña (bloqueada)"
                                : "Contraseña"}
                        </Label>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={passwordRef}
                                type="password"
                                className="pl-10"
                                disabled={!!user && !superUser}
                                value={formData.password}
                                onChange={e => handleChange("password", e.target.value)}
                                placeholder={user ? "••••••••" : "Mínimo 6 caracteres"}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {user
                                ? superUser
                                    ? "Déjala vacía para mantener la actual"
                                    : "No puedes cambiar la contraseña"
                                : "Debe tener al menos 6 caracteres"}
                        </p>
                    </div>

                    {/* RUT */}
                    <div className="space-y-1">
                        <Label>RUT</Label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                value={formData.rut}
                                onChange={e => handleChange("rut", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="space-y-1">
                        <Label>Rol</Label>
                        <Select
                            value={formData.role}
                            onValueChange={value => handleChange("role", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Guardando..."
                                : user
                                    ? "Actualizar"
                                    : "Crear"}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}
