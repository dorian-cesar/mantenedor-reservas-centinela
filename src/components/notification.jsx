"use client";
import Swal from "sweetalert2";
import { useEffect } from "react";

export default function Notification({ type = "info", message, title, timer = 3000 }) {
    useEffect(() => {
        if (!message) return;

        const titles = {
            success: "¡Exito!",
            error: "¡Ups!",
            warning: "¡Atención!",
            info: "Información",
            question: "Confirmar"
        };

        const config = {
            success: {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#ffffff",
                iconColor: "#fff"
            },
            error: {
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "#ffffff",
                iconColor: "#fff"
            },
            warning: {
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                color: "#7c2d12",
                iconColor: "#ea580c"
            },
            info: {
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "#ffffff",
                iconColor: "#fff"
            },
            question: {
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: "#1e293b",
                iconColor: "#6366f1"
            }
        };

        Swal.fire({
            icon: type,
            title: title || titles[type],
            text: message,
            timer,
            showConfirmButton: false,
            timerProgressBar: true,
            toast: true,
            position: "top-end",
            background: config[type].background,
            color: config[type].color,
            iconColor: config[type].iconColor,
            showClass: {
                popup: "animate__animated animate__fadeInDown animate__faster"
            },
            hideClass: {
                popup: "animate__animated animate__fadeOutUp animate__faster"
            },
            customClass: {
                popup: "custom-toast-popup",
                title: "custom-toast-title",
                htmlContainer: "custom-toast-text",
                timerProgressBar: "custom-progress-bar"
            },
            didOpen: (toast) => {
                // Añadir estilos dinámicos
                const style = document.createElement('style');
                style.textContent = `
                    .custom-toast-popup {
                        border-radius: 16px !important;
                        padding: 20px !important;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                                    0 10px 10px -5px rgba(0, 0, 0, 0.04),
                                    0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
                        backdrop-filter: blur(10px);
                        min-width: 320px !important;
                    }
                    .custom-toast-title {
                        font-weight: 700 !important;
                        font-size: 18px !important;
                        letter-spacing: -0.02em !important;
                    }
                    .custom-toast-text {
                        font-size: 14px !important;
                        margin-top: 8px !important;
                        opacity: 0.95 !important;
                    }
                    .custom-progress-bar {
                        background: rgba(255, 255, 255, 0.4) !important;
                        height: 4px !important;
                    }
                    .swal2-icon {
                        transform: scale(0.85) !important;
                        border-width: 3px !important;
                    }
                `;
                if (!document.getElementById('custom-toast-styles')) {
                    style.id = 'custom-toast-styles';
                    document.head.appendChild(style);
                }
            }
        });
    }, [type, message, title, timer]);

    return null;
}
