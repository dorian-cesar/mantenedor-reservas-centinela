"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CitiesService from "@/services/cities.service";

type User = {
  id: string;
  name: string;
  rut: string;
  email: string;
};

type BusService = {
  _id: string;
  template: {
    _id: string;
    origin: string;
    destination: string;
    time: string;
    company: string;
    serviceName: string;
    serviceNumber: number;
  };
  date: string;
  origin: string;
  destination: string;
  busLayout: {
    _id: string;
    name: string;
    pisos: number;
    capacidad: number;
    tipo_Asiento_piso_1: string;
    floor1: {
      seatMap: string[][];
      _id: string;
    };
    floor2: {
      seatMap: string[][];
      _id: string;
    };
  };
  seats: {
    seatNumber: string;
    reserved: boolean;
    confirmed: boolean;
    _id: string;
  }[];
  serviceName: string;
  serviceNumber: number;
};

type Seat = {
  number: string;
  isAvailable: boolean;
  isBathroom: boolean;
};

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
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [isSearchingServices, setIsSearchingServices] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [citiesMap, setCitiesMap] = useState<Record<string, string[]>>({});
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const map = await CitiesService.getMap();
        setCitiesMap(map);
        setOrigins(Object.keys(map).sort());
      } catch (error) {
        console.error("Error cargando ciudades:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar las ciudades",
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    if (origin) {
      setDestinations(citiesMap[origin] || []);
      setDestination("");
    }
  }, [origin, citiesMap]);

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

    const rutClean = rut.replace(/\./g, "");
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "No autenticado",
        text: "Debes iniciar sesión para continuar",
        icon: "error",
        confirmButtonText: "Ir al login",
      });
      return;
    }

    setIsSearchingUser(true);

    try {
      const response = await fetch(`/api/users/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rut: rutClean }),
        cache: "no-store",
      });

      const res = await response.json();

      const foundUser = res?.data?.[0];

      if (!response.ok || !foundUser) {
        Swal.fire({
          title: "Usuario no encontrado",
          text: res.error ?? "No se pudo encontrar el usuario",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const normalizedUser: User = {
        id: foundUser._id,
        name: foundUser.name,
        rut: foundUser.rut,
        email: foundUser.email,
      };

      setUser(normalizedUser);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al buscar el usuario",
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

    setIsSearchingServices(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/bus-services?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}&date=${format(
          date,
          "yyyy-MM-dd"
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Error cargando servicios");
      const data = await response.json();

      if (!data.length) {
        Swal.fire({
          title: "Sin resultados",
          text: "No se encontraron servicios para esta ruta",
          icon: "info",
          confirmButtonText: "Entendido",
        });
        setBusServices([]);
        return;
      }

      setBusServices(data);
      setSelectedService(null);
      setSelectedSeat(null);

      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (error) {
      console.error(error);
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
    if (!selectedService || !selectedSeat || !user) {
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
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const reserveResponse = await fetch("/api/reservations/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          serviceId: selectedService._id,
          seatNumber: selectedSeat,
        }),
      });

      if (!reserveResponse.ok) {
        const errorData = await reserveResponse.json();
        throw new Error(errorData.error || "Error en reserva");
      }

      const reserveData = await reserveResponse.json();
      const reservationId = reserveData.reservation?._id;

      if (!reservationId) {
        console.log("Respuesta completa de reserva:", reserveData);
        throw new Error("No se pudo obtener el ID de la reserva");
      }

      const confirmResponse = await fetch("/api/reservations/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservationId: reservationId,
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || "Error en confirmación");
      }

      const updatedServices = busServices.map((service) => {
        if (service._id === selectedService._id) {
          return {
            ...service,
            seats: service.seats.map((seat) =>
              seat.seatNumber === selectedSeat
                ? { ...seat, reserved: true, confirmed: true }
                : seat
            ),
          };
        }
        return service;
      });

      setBusServices(updatedServices);
      setSelectedService(null);
      setSelectedSeat(null);

      Swal.fire({
        title: "¡Reserva exitosa!",
        html: `
          <div class="text-left">
            <p><strong>Usuario:</strong> ${user.name}</p>
            <p><strong>Asiento:</strong> ${selectedSeat}</p>
            <p><strong>Ruta:</strong> ${selectedService.origin} → ${selectedService.destination}</p>
            <p><strong>Servicio:</strong> ${selectedService.serviceName}</p>
            <p><strong>Fecha:</strong> ${selectedService.date}</p>
            <p><strong>Hora:</strong> ${selectedService.template?.time}</p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "Perfecto",
        timer: 7000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error en reserva:", error);
      Swal.fire({
        title: "Error en la reserva",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo completar tu reserva. Por favor intenta nuevamente.",
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
    const seats: Seat[] = [];

    service.busLayout.floor1.seatMap.forEach((row) => {
      row.forEach((seat) => {
        if (seat === "") return;

        const seatData = service.seats.find((s) => s.seatNumber === seat);
        seats.push({
          number: seat,
          isAvailable: !seatData?.reserved && !seatData?.confirmed,
          isBathroom: seat.toUpperCase() === "WC",
        });
      });
    });

    return seats;
  };

  const renderSeats = (service: BusService) => {
    const seats = generateSeatLayout(service);

    const rows: Seat[][] = [];
    for (let i = 0; i < seats.length; i += 4) {
      rows.push(seats.slice(i, i + 4));
    }

    return (
      <div className="mt-4 max-w-md mx-auto">
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex justify-center gap-2 mb-2"
          >
            {row.map((seat, seatIndex) => (
              <Button
                key={`${seat.number}-${rowIndex}-${seatIndex}`}
                variant={
                  selectedSeat === seat.number
                    ? "default"
                    : seat.isBathroom
                    ? "secondary"
                    : seat.isAvailable
                    ? "outline"
                    : "secondary"
                }
                className={cn(
                  "h-14 w-14 font-semibold transition-all shrink-0",
                  !seat.isAvailable &&
                    !seat.isBathroom &&
                    "opacity-40 cursor-not-allowed",
                  seat.isBathroom && "opacity-60 cursor-not-allowed",
                  selectedSeat === seat.number &&
                    "ring-2 ring-primary scale-105"
                )}
                disabled={!seat.isAvailable || seat.isBathroom}
                onClick={(e) => {
                  e.stopPropagation();
                  if (seat.isAvailable && !seat.isBathroom) {
                    if (selectedSeat === seat.number) {
                      setSelectedSeat(null);
                    } else {
                      setSelectedSeat(seat.number);
                    }
                  }
                }}
              >
                {seat.isBathroom ? "🚻" : seat.number}
              </Button>
            ))}
            {row.length < 4 &&
              Array.from({ length: 4 - row.length }).map((_, index) => (
                <div key={`empty-${rowIndex}-${index}`} className="w-14 h-14" />
              ))}
          </div>
        ))}
      </div>
    );
  };

  const formatServiceTime = (service: BusService) => {
    return service.template?.time || "Horario no disponible";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 ref={titleRef} className="text-4xl font-bold text-balance mb-2">
            Reserva tu Asiento
          </h1>
          <p className="text-muted-foreground text-pretty">
            Encuentra y reserva el viaje de un usuario
          </p>
        </div>

        {busServices.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-semibold">Servicios Disponibles</h2>
            {busServices.map((service, index) => (
              <Card
                key={service._id}
                className={cn(
                  "transition-all animate-in slide-in-from-top-2 duration-300",
                  selectedService?._id === service._id && "ring-2 ring-primary"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    if (selectedService?._id === service._id) {
                      setSelectedService(null);
                      setSelectedSeat(null);
                    } else {
                      setSelectedService(service);
                      setSelectedSeat(null);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {service.origin} → {service.destination}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Salida: {formatServiceTime(service)} • Servicio: #
                        {service.serviceNumber}
                      </CardDescription>
                      <CardDescription>
                        Empresa: {service.template?.company}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {
                          service.seats.filter(
                            (s) => !s.reserved && !s.confirmed
                          ).length
                        }{" "}
                        asientos disponibles
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {selectedService?._id === service._id && (
                  <CardContent onClick={(e) => e.stopPropagation()}>
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3 text-center">
                        Selecciona el asiento
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
                          <div className="w-6 h-6 border rounded bg-secondary opacity-40"></div>
                          <span>Ocupado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="opacity-60">🚻</div>
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
                              Servicio: {service.serviceName}
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

        {/* El resto del código permanece igual */}
        <Card>
          <CardHeader>
            <CardTitle>Identificación</CardTitle>
            <CardDescription>Ingresa el RUT del usuario</CardDescription>
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
                    {origins.map((city) => (
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
                    {destinations.map((city) => (
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
                    disabled={(d) => {
                      const todayChile = startOfDay(
                        toZonedTime(new Date(), "America/Santiago")
                      );
                      return d < todayChile;
                    }}
                    locale={es}
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
