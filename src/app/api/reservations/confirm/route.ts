import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reservationId } = body;
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!reservationId) {
      return NextResponse.json(
        { error: "Falta reservationId" },
        { status: 400 }
      );
    }

    const authorizationCode = "centinela";

    const confirmRes = await fetch(`${API_URL}/reservations/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reservationId, authorizationCode }),
    });

    const data = await confirmRes.json();

    if (!confirmRes.ok) {
      return NextResponse.json(
        { error: data?.message || "Error al confirmar reserva" },
        { status: confirmRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
