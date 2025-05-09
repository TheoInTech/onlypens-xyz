import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get user from session after signing a message
  const body = await request.json();
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  // Save onboarding
  const body = await request.json();
  return NextResponse.json(body);
}
