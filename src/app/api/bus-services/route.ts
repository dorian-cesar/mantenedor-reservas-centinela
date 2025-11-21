import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  if (!origin || !destination || !date) {
    return NextResponse.json(
      { error: "Todos los parámetros son requeridos" },
      { status: 400 }
    );
  }

  // Mock data - En producción, aquí consultarías tu base de datos
  const services = [
    {
      id: "1",
      origin,
      destination,
      departureTime: "08:00",
      arrivalTime: "12:00",
      price: 15000,
      availableSeats: [1, 2, 3, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20],
    },
    {
      id: "2",
      origin,
      destination,
      departureTime: "14:00",
      arrivalTime: "18:00",
      price: 18000,
      availableSeats: [1, 3, 4, 7, 9, 11, 13, 15, 17, 19],
    },
    {
      id: "3",
      origin,
      destination,
      departureTime: "20:00",
      arrivalTime: "00:00",
      price: 20000,
      availableSeats: [2, 4, 6, 8, 10, 11, 13, 14, 16, 18, 19, 20],
    },
  ];

  return NextResponse.json(services);
}
