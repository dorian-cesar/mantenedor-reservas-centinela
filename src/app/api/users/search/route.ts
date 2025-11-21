import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rut = searchParams.get("rut");

  // Simulación de búsqueda de usuario
  // En producción, aquí harías una query a tu base de datos

  if (!rut) {
    return NextResponse.json({ error: "RUT es requerido" }, { status: 400 });
  }

  // Mock data
  const user = {
    id: "1",
    name: "Juan Pérez",
    rut: rut,
    email: "juan.perez@email.com",
  };

  return NextResponse.json(user);
}
