import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminPassword) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า ADMIN_PASSWORD ใน .env" },
        { status: 503 }
      );
    }

    if (!body.password || body.password.length !== 6) {
      return NextResponse.json(
        { error: "กรุณากรอก PIN ให้ครบ 6 หลัก" },
        { status: 400 }
      );
    }

    if (body.password !== adminPassword) {
      return NextResponse.json(
        { error: "PIN ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[settings:verify]", error);
    return NextResponse.json(
      { error: "ตรวจสอบ PIN ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
