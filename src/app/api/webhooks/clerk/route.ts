import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    received: true,
    message:
      "Auth.js Credentials dipakai untuk MVP, sehingga webhook eksternal tidak dibutuhkan.",
  });
}
