import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const { rut } = await request.json();
  const token = request.headers.get("authorization");

  if (!rut) {
    return NextResponse.json({ error: "RUT es requerido" }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_URL}/users?q=${rut}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al obtener usuario" },
        { status: response.status }
      );
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener usuario", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
