import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const apiRes = await fetch(
      `${API_URL}/services/search?origin=${origin}&destination=${destination}&date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (apiRes.status === 401) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return NextResponse.json(
        { error: "Error al obtener los servicios", details: text },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
