import { NextRequest, NextResponse } from "next/server";

const unauthorizedResponse = () => {
  return new NextResponse("Acesso restrito.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Area do Dono", charset="UTF-8"',
    },
  });
};

const isAuthorized = (request: NextRequest): boolean => {
  const expectedUser = process.env.OWNER_PANEL_USER ?? "dono";
  const expectedPassword = process.env.OWNER_PANEL_PASSWORD;

  if (!expectedPassword) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64Credentials = authHeader.split(" ")[1] ?? "";
  const credentials = atob(base64Credentials);
  const separatorIndex = credentials.indexOf(":");

  if (separatorIndex < 0) {
    return false;
  }

  const username = credentials.slice(0, separatorIndex);
  const password = credentials.slice(separatorIndex + 1);

  return username === expectedUser && password === expectedPassword;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOwnerRoute = pathname === "/dono" || pathname.startsWith("/dono/");
  const isOrdersManagement =
    pathname === "/api/orders" && request.method !== "POST";
  const isProductsManagement =
    pathname === "/api/products" && request.method !== "GET";

  if (!isOwnerRoute && !isOrdersManagement && !isProductsManagement) {
    return NextResponse.next();
  }

  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dono/:path*", "/api/orders", "/api/products"],
};
