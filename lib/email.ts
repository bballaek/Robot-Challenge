import path from "node:path";
import nodemailer from "nodemailer";

import type { RegistrationPayload } from "@/lib/registration";

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured");
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatThaiDate(date = new Date()) {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function buildEmailContent(
  payload: RegistrationPayload,
  registrationCode: string
) {
  const teamName = payload.teamName.trim();
  const leader = payload.members[0];
  const leaderName = leader?.fullName.trim() || "หัวหน้าทีม";
  const submittedAt = formatThaiDate();
  const code = registrationCode.trim().toUpperCase();

  const members = payload.members.map((member, index) => ({
    index: index + 1,
    fullName: member.fullName.trim(),
    grade: member.grade.trim(),
    room: member.room.trim(),
    number: member.number.trim(),
    role: index === 0 ? "หัวหน้าทีม" : `สมาชิกคนที่ ${index + 1}`,
  }));

  const memberLinesText = members
    .map(
      (m) =>
        `${m.index}. ${m.fullName} (${m.grade}/${m.room} เลขที่ ${m.number}) — ${m.role}`
    )
    .join("\n");

  const memberRowsHtml = members
    .map(
      (m) => `<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #e8eaed;font-size:14px;color:#202124;">${m.index}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #e8eaed;font-size:14px;color:#202124;">
    <div style="font-weight:600;">${escapeHtml(m.fullName)}</div>
    <div style="font-size:12px;color:#5f6368;margin-top:2px;">${escapeHtml(m.role)}</div>
  </td>
  <td style="padding:10px 12px;border-bottom:1px solid #e8eaed;font-size:14px;color:#202124;">${escapeHtml(m.grade)}/${escapeHtml(m.room)}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #e8eaed;font-size:14px;color:#202124;">${escapeHtml(m.number)}</td>
</tr>`
    )
    .join("");

  const subject = `(รับใบสมัครแล้ว) รหัส ${code} ทีม ${teamName} — Rescue Line Robot Challenge`;

  const text = `เรียน ${leaderName}

รับใบสมัครแล้ว — ระบบได้รับใบลงทะเบียนแข่งขัน Rescue Line Robot Challenge เรียบร้อยแล้ว (${submittedAt})

รหัสลงทะเบียน: ${code}
โปรดเก็บรหัสนี้ไว้เพื่อใช้ตรวจสอบในวันแข่งขัน

ตามที่ท่านได้ส่งใบลงทะเบียนเข้าร่วมการแข่งขัน Rescue Line Robot Challenge
ของโรงเรียนเซนต์คาเบรียล ระบบได้บันทึกข้อมูลทีมของท่านเรียบร้อยแล้ว

ชื่อทีม: ${teamName}

สมาชิกทีม:
${memberLinesText}

โปรดเก็บอีเมลนี้ไว้เป็นหลักฐานการส่งใบสมัคร
หากข้อมูลผิดพลาด โปรดติดต่อมาสเตอร์เอกราช วงศ์ชาลี ห้อง AI and Robotics

Occupations and Technology
Saint Gabriel's College
`;

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f4;font-family:Tahoma,'Helvetica Neue',Arial,sans-serif;color:#202124;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1f4;padding:20px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfe3e8;">

          <tr>
            <td style="background:#2d343c;padding:18px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="52" valign="middle" style="padding-right:14px;">
                    <img src="cid:sg-emblem" width="44" height="44" alt="Saint Gabriel's College" style="display:block;border:0;border-radius:50%;background:#ffffff;" />
                  </td>
                  <td width="1" valign="middle" style="padding-right:14px;">
                    <div style="width:1px;height:36px;background:rgba(255,255,255,0.35);"></div>
                  </td>
                  <td valign="middle">
                    <div style="font-size:16px;font-weight:700;color:#ffffff;line-height:1.3;">Occupations and Technology</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.78);line-height:1.4;margin-top:2px;">Saint Gabriel's College</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(90deg,#0b3d91 0%,#4f8cff 100%);padding:22px 24px;">
              <!--[if mso]>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#0b3d91" style="padding:22px 24px;">
              <![endif]-->
              <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.3;letter-spacing:0.2px;">
                สถานะการลงทะเบียน : รับใบสมัครแล้ว
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.95);line-height:1.55;margin-top:8px;">
                (รับใบสมัครแล้ว) ยืนยันการลงทะเบียนทีม ${escapeHtml(teamName)} — Rescue Line Robot Challenge
              </div>
              <!--[if mso]></td></tr></table><![endif]-->
            </td>
          </tr>

          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#202124;">
                เรียน ${escapeHtml(leaderName)}
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-weight:700;color:#0b3d91;">
                รับใบสมัครแล้ว — ระบบได้รับใบลงทะเบียนของทีมท่านเรียบร้อย (${escapeHtml(submittedAt)})
              </p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#3c4043;">
                ตามที่ท่านได้ส่งใบลงทะเบียนเข้าร่วมการแข่งขัน
                <strong>Rescue Line Robot Challenge</strong>
                ของโรงเรียนเซนต์คาเบรียล ระบบได้บันทึกข้อมูลทีมของท่านเรียบร้อยแล้ว
                โปรดเก็บอีเมลนี้ไว้เป็นหลักฐานการส่งใบสมัคร
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:#07122b;border-radius:12px;">
                <tr>
                  <td style="padding:18px 16px;text-align:center;">
                    <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-bottom:6px;letter-spacing:0.04em;">รหัสลงทะเบียน</div>
                    <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0.12em;font-family:Consolas,'Courier New',monospace;">${escapeHtml(code)}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:8px;line-height:1.5;">ใช้ตรวจสอบในวันแข่งขัน</div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:#f8faf9;border:1px solid #e6ebe8;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <div style="font-size:12px;color:#5f6368;margin-bottom:4px;">ชื่อทีม</div>
                    <div style="font-size:18px;font-weight:700;color:#07122b;line-height:1.3;">${escapeHtml(teamName)}</div>
                  </td>
                </tr>
              </table>

              <div style="font-size:13px;font-weight:700;color:#5f6368;margin:0 0 8px;letter-spacing:0.02em;">สมาชิกทีม</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8eaed;border-radius:12px;overflow:hidden;">
                <tr style="background:#f8f9fa;">
                  <th align="left" style="padding:10px 12px;font-size:12px;color:#5f6368;font-weight:700;">#</th>
                  <th align="left" style="padding:10px 12px;font-size:12px;color:#5f6368;font-weight:700;">ชื่อ</th>
                  <th align="left" style="padding:10px 12px;font-size:12px;color:#5f6368;font-weight:700;">ชั้น/ห้อง</th>
                  <th align="left" style="padding:10px 12px;font-size:12px;color:#5f6368;font-weight:700;">เลขที่</th>
                </tr>
                ${memberRowsHtml}
              </table>

              <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#5f6368;">
                หากข้อมูลผิดพลาดหรือต้องการแก้ไข โปรดติดต่อ
                <strong style="color:#202124;">มาสเตอร์เอกราช วงศ์ชาลี ห้อง AI and Robotics</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 24px 24px;">
              <div style="height:1px;background:#e8eaed;margin-bottom:16px;"></div>
              <div style="font-size:12px;line-height:1.6;color:#80868b;">
                Occupations and Technology<br />
                Saint Gabriel&apos;s College
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

/** ส่งอีเมลยืนยันไปยังหัวหน้าทีม (สมาชิกคนที่ 1) */
export async function sendRegistrationConfirmation(
  payload: RegistrationPayload,
  registrationCode: string
): Promise<{ sent: number; failed: number }> {
  if (!isEmailConfigured()) {
    return { sent: 0, failed: 0 };
  }

  const to = payload.members[0]?.email.trim().toLowerCase();
  if (!to) {
    return { sent: 0, failed: 0 };
  }

  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.SMTP_USER!.trim();
  const { subject, text, html } = buildEmailContent(
    payload,
    registrationCode
  );
  const transporter = getTransporter();
  const emblemPath = path.join(
    process.cwd(),
    "public/src/image/SG-Emblem-Blue-EN.png"
  );

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: "sg-emblem.png",
          path: emblemPath,
          cid: "sg-emblem",
        },
      ],
    });
    return { sent: 1, failed: 0 };
  } catch (error) {
    console.error("[email] send failed", error);
    return { sent: 0, failed: 1 };
  }
}
