"use client";
import Swal from "sweetalert2";
import { useEffect } from "react";

export default function Notification({ type = "info", message, title, timer = 2000 }) {
    useEffect(() => {
        if (!message) return;

        const titles = {
            success: "Éxito",
            error: "Error",
            warning: "Atención",
            info: "Información",
            question: "Confirmar"
        };

        const bgColors = {
            success: "#D1FAE5",
            error: "#FECACA",
            warning: "#FEF3C7",
            info: "#DBEAFE",
            question: "#E0E7FF"
        }

        const textColors = {
            success: "#065F46",
            error: "#7F1D1D",
            warning: "#78350F",
            info: "#1E3A8A",
            question: "#3730A3"
        }

        Swal.fire({
            icon: type,
            title: title || titles[type],
            text: message,
            timer,
            showConfirmButton: false,
            timerProgressBar: true,
            toast: true,
            position: "top-end",
            background: bgColors[type],
            color: textColors[type],
        });
    }, [type, message, title, timer]);

    return null;
}
