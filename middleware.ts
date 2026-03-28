import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname.startsWith("/admin")) {
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
      return new NextResponse("Admin credentials not configured", { status: 500 });
    }

    const auth = request.headers.get("authorization");

    if (!auth || !auth.startsWith("Basic ")) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    const base64 = auth.slice("Basic ".length);
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const colonIndex = decoded.indexOf(":");
    const user = decoded.substring(0, colonIndex);
    const password = decoded.substring(colonIndex + 1);

    if (user !== adminUser || password !== adminPassword) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }
  }

  return NextResponse.next();
}
