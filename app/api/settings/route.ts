import { NextResponse } from "next/server";

import {
  getSiteSettings,
  isSheetsConfigured,
  setRegistrationOpen,
  setTeamsPublic,
} from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[settings:get]", error);
    return NextResponse.json(
      { error: "อ่านการตั้งค่าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSheetsConfigured()) {
      return NextResponse.json(
        { error: "ระบบยังไม่ได้เชื่อม Google Sheets" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      registrationOpen?: boolean;
      teamsPublic?: boolean;
      password?: string;
    };

    const adminPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!adminPassword) {
      return NextResponse.json(
        { error: "ยังไม่ได้ตั้งค่า ADMIN_PASSWORD ใน .env" },
        { status: 503 }
      );
    }
    if (body.password !== adminPassword) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const hasRegistration = typeof body.registrationOpen === "boolean";
    const hasTeams = typeof body.teamsPublic === "boolean";
    if (!hasRegistration && !hasTeams) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (hasRegistration) {
      await setRegistrationOpen(body.registrationOpen!);
    }
    if (hasTeams) {
      await setTeamsPublic(body.teamsPublic!);
    }

    const settings = await getSiteSettings();
    return NextResponse.json({ ok: true, ...settings });
  } catch (error) {
    console.error("[settings:post]", error);
    return NextResponse.json(
      { error: "บันทึกการตั้งค่าไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
