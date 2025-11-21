"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";

export default function ReservePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [rut, setRut] = useState("");
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(false);

  const notify = (icon, title, text = "") =>
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#3b82f6",
    });

  const handleFindUser = async () => {
    if (!rut.trim()) {
      return notify(
        "warning",
        "Falta el RUT",
        "Ingresa un RUT antes de continuar"
      );
    }

    try {
      const res = await fetch(`/api/users/find?rut=${rut}`);
      const data = await res.json();

      if (!data.user) {
        return notify("error", "Usuario no encontrado");
      }

      setUserData(data.user);
      notify("success", "Usuario encontrado");
    } catch (err) {
      notify("error", "Error buscando el usuario");
    }
  };

  const handleSearchServices = async () => {
    if (!origin || !destination || !date || !userData) {
      return notify("warning", "Datos incompletos");
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        date,
      });

      const res = await fetch(`/api/services/search?${params.toString()}`);
      const data = await res.json();

      setServices(data.services || []);
    } catch (err) {
      notify("error", "Error buscando servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleReserveSeat = async () => {
    if (!selectedService || !selectedSeat || !userData)
      return notify("warning", "Debes seleccionar un asiento");

    try {
      // Reservar
      await fetch(`/api/seats/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService._id,
          seat: selectedSeat,
          userId: userData._id,
        }),
      });

      // Confirmar
      await fetch(`/api/seats/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService._id,
          seat: selectedSeat,
          userId: userData._id,
        }),
      });

      notify("success", "Asiento reservado y confirmado exitosamente");

      setSelectedSeat(null);
      setSelectedService(null);
      setServices([]);
    } catch (err) {
      notify("error", "No se pudo reservar");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reservar Asiento</h1>

      {/* FORMULARIO */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow">
        <input
          type="text"
          placeholder="Ciudad Origen"
          className="border p-2 rounded"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />

        <input
          type="text"
          placeholder="Ciudad Destino"
          className="border p-2 rounded"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="RUT pasajero"
            className="border p-2 rounded w-full"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
          <button
            onClick={handleFindUser}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Buscar
          </button>
        </div>
      </div>

      {userData && (
        <p className="mb-4 text-green-600 font-semibold">
          Pasajero: {userData.name}
        </p>
      )}

      <button
        onClick={handleSearchServices}
        className="bg-indigo-600 text-white px-6 py-2 rounded mb-6"
      >
        Buscar Servicios
      </button>

      {/* LISTA DE SERVICIOS */}
      {loading && <p>Cargando servicios...</p>}

      {services.length > 0 && (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service._id}
              className={`p-4 border rounded-xl cursor-pointer ${
                selectedService?._id === service._id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedService(service)}
            >
              <p className="font-semibold text-lg">
                {service.origin} → {service.destination}
              </p>
              <p className="text-sm text-gray-600">
                {dayjs(service.date).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SELECCIÓN DE ASIENTOS */}
      {selectedService && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-3">
            Selecciona un asiento — {selectedService.busPlate}
          </h2>

          <div className="grid grid-cols-6 gap-3">
            {selectedService.seats.map((seat) => (
              <button
                key={seat.number}
                disabled={seat.taken}
                onClick={() => setSelectedSeat(seat.number)}
                className={`px-3 py-2 rounded border ${
                  seat.taken
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : selectedSeat === seat.number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {seat.number}
              </button>
            ))}
          </div>

          <button
            onClick={handleReserveSeat}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded w-full"
          >
            Confirmar Reserva
          </button>
        </div>
      )}
    </div>
  );
}
