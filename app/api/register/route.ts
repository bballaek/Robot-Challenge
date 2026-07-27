import { after, NextResponse } from "next/server";

import {
  appendRegistration,
  createUniqueRegistrationCode,
  getRegistrationOpen,
  isSheetsConfigured,
  teamNameExists,
} from "@/lib/google-sheets";
import {
  isEmailConfigured,
  sendRegistrationConfirmation,
} from "@/lib/email";
import {
  type RegistrationPayload,
  validateRegistration,
} from "@/lib/registration";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isSheetsConfigured()) {
      return NextResponse.json(
        {
          error:
            "ระบบยังไม่ได้เชื่อม Google Sheets กรุณาตั้งค่า environment variables",
        },
        { status: 503 }
      );
    }

    if (!(await getRegistrationOpen())) {
      return NextResponse.json(
        { error: "ปิดรับสมัครแล้ว" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as RegistrationPayload;
    if (
      !body ||
      typeof body.teamName !== "string" ||
      !Array.isArray(body.members) ||
      body.members.length !== 3
    ) {
      return NextResponse.json(
        { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const validation = validateRegistration(body);
    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "กรุณาตรวจสอบข้อมูลที่ยังไม่ครบหรือไม่ถูกต้อง",
          teamNameError: validation.teamNameError,
          memberErrors: validation.memberErrors,
        },
        { status: 400 }
      );
    }

    if (await teamNameExists(body.teamName)) {
      return NextResponse.json(
        {
          error: "ชื่อทีมนี้ถูกใช้แล้ว กรุณาตั้งชื่ออื่น",
          teamNameError: "ชื่อทีมนี้ถูกใช้แล้ว",
        },
        { status: 409 }
      );
    }

    const registrationCode = await createUniqueRegistrationCode();
    await appendRegistration(body, registrationCode);

    const emailConfigured = isEmailConfigured();
    if (emailConfigured) {
      after(async () => {
        try {
          const emailResult = await sendRegistrationConfirmation(
            body,
            registrationCode
          );
          if (emailResult.failed > 0) {
            console.error(
              `[register] email failed for ${emailResult.failed} recipient(s)`
            );
          }
        } catch (error) {
          console.error("[register] email error", error);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      registrationCode,
      emailQueued: emailConfigured,
      emailConfigured,
    });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
