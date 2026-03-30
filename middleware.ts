import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname.startsWith("/admin")) {
    const auth = request.headers.get("authorization");

    if (!auth) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    const base64 = auth.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [user, password] = decoded.split(":");

    if (
      user !=="admin" ||
      password !== "123456"
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  return NextResponse.next();
}