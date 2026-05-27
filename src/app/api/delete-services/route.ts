import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el parámetro id del servicio" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { fromDate } = body;

    if (!fromDate) {
      return NextResponse.json(
        { error: "Falta fromDate en el body" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const apiRes = await fetch(`${API_URL}/services/generated/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fromDate }),
    });

    if (apiRes.status === 401) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return NextResponse.json(
        { error: "Error al eliminar los servicios", details: text },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json().catch(() => ({}));
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
