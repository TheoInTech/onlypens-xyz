import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_CSRF_NAME } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const csrf = cookieStore.get(COOKIE_CSRF_NAME)?.value.split("|")[0];
  return NextResponse.json({ csrfToken: csrf });
}
