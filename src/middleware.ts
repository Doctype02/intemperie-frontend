import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* `/inspecciones` pide sesion. El motivo original —llevaba la tabla de
   materiales de la empresa y las firmas— ya no aplica: ese papeleo se mudo a
   `/admin/inspecciones` y la pantalla publica es hoy solo la solicitud del
   cliente. La proteccion SE MANTIENE, y por dos razones que siguen en pie:
   la ficha se rellena sola con el nombre, el telefono y el correo de la
   sesion, y una solicitud de inspeccion es un dato de contacto de una persona
   con una direccion de su casa detras. Abrirla al publico anonimo es una
   decision de producto, no una limpieza de esta refactorizacion, asi que se
   deja como estaba y se anota en el informe. */
const protectedPaths = ["/cuenta", "/admin", "/inspecciones"];
const adminPaths = ["/admin"];

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(accessToken);

  if (!payload || isTokenExpired(payload)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("userRole");
    return response;
  }

  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));
  if (isAdmin && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/inspecciones/:path*"],
};
