"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Home, Truck, List } from "lucide-react";
import SessionHelper from "@/utils/session";
import LayoutService from "@/services/layout.service";

export default function TemplateModal({ template, onSave, onClose }) {
    const [formData, setFormData] = useState({
        origin: "",
        destination: "",
        startDate: "",
        time: "",
        company: "",
        layout: "",
        daysOfWeek: [], // [1..7]
    });
    const [layouts, setLayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [superUser, setSuperUser] = useState(false);

    useEffect(() => {
        const currentUser = SessionHelper.getUser();
        setSuperUser(String(currentUser?.role) === "superUser");
        loadLayouts();
    }, []);

    useEffect(() => {
        if (template) {
            setFormData({
                origin: template.origin || "",
                destination: template.destination || "",
                startDate: template.startDate ? template.startDate.split("T")[0] : "",
                time: template.time || "",
                company: template.company || "",
                layout: template.layout?._id || template.layout || "",
                daysOfWeek: (template.daysOfWeek || []).slice(),
            });
        }
    }, [template]);

    const loadLayouts = async () => {
        try {
            const res = await LayoutService.getLayouts();
            setLayouts(res || []);
        } catch (error) {
            console.error("Error cargando layouts:", error);
        }
    };

    const toggleDay = (num) => {
        setFormData(prev => {
            const arr = new Set(prev.daysOfWeek || []);
            if (arr.has(num)) arr.delete(num); else arr.add(num);
            return { ...prev, daysOfWeek: Array.from(arr).sort() };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validaciones básicas
            if (!formData.origin || !formData.destination || !formData.startDate || !formData.time || !formData.layout || (formData.daysOfWeek || []).length === 0) {
                alert("Completa todos los campos obligatorios");
                setLoading(false);
                return;
            }

            await onSave({
                origin: formData.origin,
                destination: formData.destination,
                startDate: formData.startDate,
                time: formData.time,
                company: formData.company,
                layout: formData.layout,
                daysOfWeek: formData.daysOfWeek
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">{template ? 'Editar Template' : 'Nuevo Template'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Origen</label>
                            <div className="relative">
                                <Home className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input name="origin" value={formData.origin} onChange={handleChange} required className="w-full pl-10 px-3 py-3 border rounded-xl" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Destino</label>
                            <input name="destination" value={formData.destination} onChange={handleChange} required className="w-full pl-3 px-3 py-3 border rounded-xl" />
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Fecha de inicio (creación del servicio)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full pl-10 px-3 py-3 border rounded-xl" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Hora de salida</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input name="time" value={formData.time} onChange={handleChange} required placeholder="HH:MM" className="w-full pl-10 px-3 py-3 border rounded-xl" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Compañía</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <input name="company" value={formData.company} onChange={handleChange} className="w-full pl-10 px-3 py-3 border rounded-xl" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Layout (bus)</label>
                            <div className="relative">
                                <List className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                <select name="layout" value={formData.layout} onChange={handleChange} required className="w-full pl-10 px-3 py-3 border rounded-xl">
                                    <option value="">Selecciona un layout</option>
                                    {layouts.map(l => <option key={l._id} value={l._id}>{l.name} — {l.capacidad} asientos</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-2">Días de la semana</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { n: 1, label: 'Lun' }, { n: 2, label: 'Mar' }, { n: 3, label: 'Mié' }, { n: 4, label: 'Jue' }, { n: 5, label: 'Vie' }, { n: 6, label: 'Sáb' }, { n: 7, label: 'Dom' }
                            ].map(d => (
                                <button type="button" key={d.n}
                                    onClick={() => toggleDay(d.n)}
                                    className={`px-3 py-1 rounded-full border ${formData.daysOfWeek.includes(d.n) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-2 px-4 border rounded-xl text-gray-700">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 px-4 bg-linear-to-r from-sky-600 to-sky-800 text-white rounded-xl">
                            {loading ? "Guardando..." : (template ? "Actualizar" : "Crear")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
