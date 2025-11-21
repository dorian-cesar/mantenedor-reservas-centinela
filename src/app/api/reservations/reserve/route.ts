import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, serviceId, seatNumber } = body;

  if (!userId || !serviceId || !seatNumber) {
    return NextResponse.json(
      { error: "Todos los campos son requeridos" },
      { status: 400 }
    );
  }

  // En producción, aquí crearías la reserva en tu base de datos
  // y verificarías que el asiento esté disponible

  const reservation = {
    id: `res-${Date.now()}`,
    userId,
    serviceId,
    seatNumber,
    status: "reserved",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(reservation);
}
