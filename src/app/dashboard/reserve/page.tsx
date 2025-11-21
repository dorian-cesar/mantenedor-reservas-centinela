"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  rut: string;
  email: string;
};

type BusService = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number[];
};

type Seat = {
  number: number;
  isAvailable: boolean;
  isBathroom: boolean;
};

const cities = [
  "Santiago",
  "Valparaíso",
  "Concepción",
  "La Serena",
  "Antofagasta",
  "Temuco",
  "Puerto Montt",
  "Iquique",
];

export default function ReservePage() {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [rut, setRut] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [busServices, setBusServices] = useState<BusService[]>([]);
  const [selectedService, setSelectedService] = useState<BusService | null>(
    null
  );
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isSearchingServices, setIsSearchingServices] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const formatRut = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) return cleaned;
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
  };

  const searchUser = async () => {
    if (!rut || rut.length < 3) {
      Swal.fire({
        title: "Error",
        text: "Por favor ingresa un RUT válido",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsSearchingUser(true);
    try {
      // Simulación de API call
      const response = await fetch(`/api/users/search?rut=${rut}`);
      const userData = await response.json();

      // Mock data para demostración
      const mockUser: User = {
        id: "1",
        name: "Juan Pérez",
        rut: rut,
        email: "juan.perez@email.com",
      };

      setUser(mockUser);
      Swal.fire({
        title: "Usuario encontrado",
        text: `Bienvenido ${mockUser.name}`,
        icon: "success",
        confirmButtonText: "Continuar",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo encontrar el usuario",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setIsSearchingUser(false);
    }
  };

  const searchBusServices = async () => {
    if (!origin || !destination || !date || !user) {
      Swal.fire({
        title: "Información incompleta",
        text: "Por favor completa todos los campos y busca tu usuario",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (origin === destination) {
      Swal.fire({
        title: "Error",
        text: "El origen y destino no pueden ser iguales",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsSearchingServices(true);
    try {
      // Simulación de API call
      const response = await fetch(
        `/api/bus-services?origin=${origin}&destination=${destination}&date=${format(
          date,
          "yyyy-MM-dd"
        )}`
      );
      const services = await response.json();

      const mockServices: BusService[] = [
        {
          id: "1",
          origin,
          destination,
          departureTime: "08:00",
          arrivalTime: "12:00",
          price: 15000,
          availableSeats: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 22, 24, 26,
            28, 30, 32, 34, 36,
          ],
        },
        {
          id: "2",
          origin,
          destination,
          departureTime: "14:00",
          arrivalTime: "18:00",
          price: 18000,
          availableSeats: [
            1, 3, 4, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35,
            37,
          ],
        },
        {
          id: "3",
          origin,
          destination,
          departureTime: "20:00",
          arrivalTime: "00:00",
          price: 20000,
          availableSeats: [
            2, 4, 6, 8, 10, 11, 13, 14, 16, 18, 19, 20, 22, 24, 26, 28, 30, 32,
            34, 36, 38,
          ],
        },
      ];

      setBusServices(mockServices);
      setSelectedService(null);
      setSelectedSeat(null);

      console.log("[v0] Services loaded:", mockServices.length);

      if (mockServices.length === 0) {
        Swal.fire({
          title: "Sin resultados",
          text: "No se encontraron servicios para esta ruta",
          icon: "info",
          confirmButtonText: "Entendido",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los servicios",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setIsSearchingServices(false);
    }
  };

  const reserveAndConfirmSeat = async () => {
    if (!selectedService || selectedSeat === null || !user) {
      Swal.fire({
        title: "Error",
        text: "Selecciona un servicio y un asiento",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsReserving(true);
    try {
      // Simulación de API call
      const reserveResponse = await fetch("/api/reservations/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          serviceId: selectedService.id,
          seatNumber: selectedSeat,
        }),
      });

      if (!reserveResponse.ok) throw new Error("Error en reserva");

      const reservation = await reserveResponse.json();

      // Simulación de API call
      const confirmResponse = await fetch("/api/reservations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
        }),
      });

      if (!confirmResponse.ok) throw new Error("Error en confirmación");

      setBusServices([]);
      setSelectedService(null);
      setSelectedSeat(null);

      setTimeout(() => {
        console.log("[v0] Showing success alert");
        Swal.fire({
          title: "¡Reserva exitosa!",
          html: `Asiento <strong>${selectedSeat}</strong> confirmado<br>${selectedService.origin} a ${selectedService.destination}`,
          icon: "success",
          confirmButtonText: "Perfecto",
          timer: 7000,
          timerProgressBar: true,
        });
      }, 300);
    } catch (error) {
      Swal.fire({
        title: "Error en la reserva",
        text: "No se pudo completar tu reserva. Por favor intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Entendido",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setIsReserving(false);
    }
  };

  const generateSeatLayout = (service: BusService) => {
    const totalSpaces = 40;
    const seats: Seat[] = [];

    // Generar 38 asientos con el patrón especial
    for (let i = 0; i < 38; i++) {
      const groupIndex = Math.floor(i / 4);
      const posInGroup = i % 4;

      // Patrón: posición 0->1, 1->2, 2->4, 3->3 en cada grupo
      let seatNumber;
      if (posInGroup === 0) seatNumber = groupIndex * 4 + 1;
      else if (posInGroup === 1) seatNumber = groupIndex * 4 + 2;
      else if (posInGroup === 2) seatNumber = groupIndex * 4 + 4;
      else seatNumber = groupIndex * 4 + 3;

      seats.push({
        number: seatNumber,
        isAvailable: service.availableSeats.includes(seatNumber),
        isBathroom: false,
      });
    }

    // Agregar 2 baños al final
    seats.push({ number: 39, isAvailable: false, isBathroom: true });
    seats.push({ number: 40, isAvailable: false, isBathroom: true });

    return seats;
  };

  const renderSeats = (service: BusService) => {
    const seats = generateSeatLayout(service);

    return (
      <div className="grid grid-cols-4 gap-2 mt-4 max-w-md mx-auto">
        {seats.map((seat) => (
          <Button
            key={seat.number}
            variant={
              selectedSeat === seat.number
                ? "default"
                : seat.isBathroom
                ? "secondary"
                : "outline"
            }
            className={cn(
              "h-14 font-semibold transition-all",
              !seat.isAvailable &&
                !seat.isBathroom &&
                "opacity-40 cursor-not-allowed",
              seat.isBathroom && "opacity-60 cursor-not-allowed",
              selectedSeat === seat.number && "ring-2 ring-primary scale-105"
            )}
            disabled={!seat.isAvailable || seat.isBathroom}
            onClick={(e) => {
              e.stopPropagation();
              if (seat.isAvailable && !seat.isBathroom) {
                setSelectedSeat(seat.number);
              }
            }}
          >
            {seat.isBathroom ? "🚻" : seat.number}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">
            Reserva tu Asiento
          </h1>
          <p className="text-muted-foreground text-pretty">
            Encuentra y reserva tu viaje en bus de manera fácil y rápida
          </p>
        </div>

        {busServices.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-semibold">Servicios Disponibles</h2>
            {busServices.map((service, index) => (
              <Card
                key={service.id}
                className={cn(
                  "transition-all animate-in slide-in-from-top-2 duration-300",
                  selectedService?.id === service.id && "ring-2 ring-primary"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedSeat(null);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {service.origin} → {service.destination}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Salida: {service.departureTime} • Llegada:{" "}
                        {service.arrivalTime}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${service.price.toLocaleString("es-CL")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {service.availableSeats.length} asientos disponibles
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {selectedService?.id === service.id && (
                  <CardContent onClick={(e) => e.stopPropagation()}>
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 text-center">
                        Selecciona tu asiento
                      </h3>
                      <div className="mb-4 text-center text-sm text-muted-foreground">
                        <p>Frente del bus ↑</p>
                      </div>
                      {renderSeats(service)}
                      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border rounded bg-background"></div>
                          <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border rounded bg-background opacity-40"></div>
                          <span>Ocupado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border rounded bg-secondary opacity-60"></div>
                          <span>Baño</span>
                        </div>
                      </div>

                      {selectedSeat && (
                        <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">
                              Asiento seleccionado: {selectedSeat}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total: ${service.price.toLocaleString("es-CL")}
                            </p>
                          </div>
                          <Button
                            onClick={reserveAndConfirmSeat}
                            disabled={isReserving}
                            size="lg"
                          >
                            {isReserving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reservando...
                              </>
                            ) : (
                              "Reservar y Confirmar"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Buscar usuario por RUT */}
        <Card>
          <CardHeader>
            <CardTitle>Identificación</CardTitle>
            <CardDescription>Ingresa tu RUT para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  maxLength={12}
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={searchUser}
                  disabled={isSearchingUser || !rut}
                  className="min-w-[120px]"
                >
                  {isSearchingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Viaje</CardTitle>
            <CardDescription>
              Selecciona origen, destino y fecha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Ciudad de Origen</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger id="origin" className="mt-1.5">
                    <SelectValue placeholder="Selecciona origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destination">Ciudad de Destino</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger id="destination" className="mt-1.5">
                    <SelectValue placeholder="Selecciona destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Fecha de Viaje</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date
                      ? format(date, "PPP", { locale: es })
                      : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={searchBusServices}
              disabled={isSearchingServices || !user}
              className="w-full"
              size="lg"
            >
              {isSearchingServices ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando servicios...
                </>
              ) : (
                "Buscar Servicios"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
