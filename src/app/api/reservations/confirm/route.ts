import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reservationId } = body;

  if (!reservationId) {
    return NextResponse.json(
      { error: "reservationId es requerido" },
      { status: 400 }
    );
  }

  // En producción, aquí confirmarías la reserva en tu base de datos

  const confirmation = {
    id: reservationId,
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
  };

  return NextResponse.json(confirmation);
}
