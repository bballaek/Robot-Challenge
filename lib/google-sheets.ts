import { google } from "googleapis";

import type {
  RegistrationPayload,
  TeamListItem,
} from "@/lib/registration";
import {
  generateRegistrationCode,
  gradeLabelFromMembers,
} from "@/lib/registration";

const SHEET_HEADERS = [
  "timestamp",
  "teamName",
  "m1_fullName",
  "m1_grade",
  "m1_room",
  "m1_number",
  "m1_studentId",
  "m1_phone",
  "m1_email",
  "m2_fullName",
  "m2_grade",
  "m2_room",
  "m2_number",
  "m2_studentId",
  "m2_phone",
  "m2_email",
  "m3_fullName",
  "m3_grade",
  "m3_room",
  "m3_number",
  "m3_studentId",
  "m3_phone",
  "m3_email",
  "registrationCode",
] as const;

function sheetName() {
  return process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Registrations";
}

function spreadsheetId() {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || "";
}

function privateKey() {
  return (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");
}

export function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  );
}

async function getSheetsClient() {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets ยังไม่ได้ตั้งค่า environment variables");
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: privateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

const SETTINGS_SHEET = "Settings";

const DEFAULT_SETTINGS = {
  registrationOpen: true,
  teamsPublic: true,
} as const;

export type SiteSettings = {
  registrationOpen: boolean;
  teamsPublic: boolean;
};

async function ensureSettingsSheet() {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId(),
  });
  const exists = meta.data.sheets?.some(
    (sheet) => sheet.properties?.title === SETTINGS_SHEET
  );

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId(),
      requestBody: {
        requests: [
          { addSheet: { properties: { title: SETTINGS_SHEET } } },
        ],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
      range: `${SETTINGS_SHEET}!A1:B3`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["key", "value"],
          ["registrationOpen", "TRUE"],
          ["teamsPublic", "TRUE"],
        ],
      },
    });
    return;
  }

  await normalizeSettingsSheet();
}

/** รวมคีย์ซ้ำให้เหลือแถวเดียว (เก็บค่าแถวแรก) และเติมคีย์ที่ขาด */
async function normalizeSettingsSheet() {
  const sheets = await getSheetsClient();
  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SETTINGS_SHEET}!A2:B`,
  });
  const rows = current.data.values ?? [];

  const orderedKeys: string[] = [];
  const values = new Map<string, string>();
  let hasDuplicates = false;

  for (const row of rows) {
    const key = String(row[0] ?? "").trim();
    if (!key) continue;
    if (values.has(key)) {
      hasDuplicates = true;
      continue;
    }
    orderedKeys.push(key);
    values.set(key, row[1] ?? "");
  }

  const required: Array<[string, string]> = [
    ["registrationOpen", "TRUE"],
    ["teamsPublic", "TRUE"],
  ];
  let missing = false;
  for (const [key, fallback] of required) {
    if (!values.has(key)) {
      orderedKeys.push(key);
      values.set(key, fallback);
      missing = true;
    }
  }

  if (!hasDuplicates && !missing) return;

  const nextRows = orderedKeys.map((key) => [key, values.get(key) ?? ""]);

  // ล้างช่วงเดิมแล้วเขียนใหม่ กันคีย์ซ้ำค้างในชีต
  await sheets.spreadsheets.values.clear({
    spreadsheetId: spreadsheetId(),
    range: `${SETTINGS_SHEET}!A2:B`,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${SETTINGS_SHEET}!A1:B${nextRows.length + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [["key", "value"], ...nextRows],
    },
  });
}

function parseBool(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") return fallback;
  return String(value).trim().toUpperCase() !== "FALSE";
}

async function readSettingsRows() {
  await ensureSettingsSheet();
  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SETTINGS_SHEET}!A2:B`,
  });
  return result.data.values ?? [];
}

function settingsRowsToMap(rows: string[][]) {
  // ใช้ค่าแถวแรกของแต่ละคีย์ (ตรงกับตำแหน่งที่ setSettingFlag อัปเดต)
  const map: Record<string, string> = {};
  for (const row of rows) {
    const key = String(row[0] ?? "").trim();
    if (!key || key in map) continue;
    map[key] = row[1] ?? "";
  }
  return map;
}

/** อ่านการตั้งค่าทั้งหมด */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSheetsConfigured()) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const rows = await readSettingsRows();
    const map = settingsRowsToMap(rows);
    return {
      registrationOpen: parseBool(
        map.registrationOpen,
        DEFAULT_SETTINGS.registrationOpen
      ),
      teamsPublic: parseBool(map.teamsPublic, DEFAULT_SETTINGS.teamsPublic),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** อ่านสถานะเปิด/ปิดรับสมัคร (ค่าเริ่มต้น: เปิด) */
export async function getRegistrationOpen(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.registrationOpen;
}

/** อ่านสถานะเปิด/ปิดประกาศรายชื่อทีม */
export async function getTeamsPublic(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.teamsPublic;
}

async function setSettingFlag(
  key: "registrationOpen" | "teamsPublic",
  open: boolean
) {
  await ensureSettingsSheet();
  const sheets = await getSheetsClient();
  const rows = await readSettingsRows();
  const value = open ? "TRUE" : "FALSE";
  const keyTrim = key;

  // อัปเดตทุกแถวที่คีย์ตรงกัน กันค่าซ้ำคนละสถานะ
  const indexes = rows
    .map((r, i) => (String(r[0] ?? "").trim() === keyTrim ? i : -1))
    .filter((i) => i >= 0);

  if (indexes.length === 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId(),
      range: `${SETTINGS_SHEET}!A:B`,
      valueInputOption: "RAW",
      requestBody: { values: [[key, value]] },
    });
    return;
  }

  await Promise.all(
    indexes.map((rowIndex) =>
      sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId(),
        range: `${SETTINGS_SHEET}!B${rowIndex + 2}`,
        valueInputOption: "RAW",
        requestBody: { values: [[value]] },
      })
    )
  );

  // เก็บแถวเดียวต่อคีย์
  if (indexes.length > 1) {
    await normalizeSettingsSheet();
  }
}

/** ตั้งค่าเปิด/ปิดรับสมัคร */
export async function setRegistrationOpen(open: boolean) {
  await setSettingFlag("registrationOpen", open);
}

/** ตั้งค่าเปิด/ปิดประกาศรายชื่อทีม */
export async function setTeamsPublic(open: boolean) {
  await setSettingFlag("teamsPublic", open);
}

async function ensureHeaderRow() {
  const sheets = await getSheetsClient();
  const range = `${sheetName()}!A1:X1`;
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range,
  });

  const firstRow = existing.data.values?.[0] ?? [];
  const needsWrite =
    firstRow.length < SHEET_HEADERS.length ||
    SHEET_HEADERS.some((header, index) => firstRow[index] !== header);

  if (!needsWrite) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [Array.from(SHEET_HEADERS)],
    },
  });
}

function registrationToRow(
  payload: RegistrationPayload,
  registrationCode: string
): string[] {
  const [m1, m2, m3] = payload.members;
  return [
    new Date().toISOString(),
    payload.teamName.trim(),
    m1.fullName.trim(),
    m1.grade.trim(),
    m1.room.trim(),
    m1.number.trim(),
    m1.studentId.trim(),
    m1.phone.trim(),
    m1.email.trim(),
    m2.fullName.trim(),
    m2.grade.trim(),
    m2.room.trim(),
    m2.number.trim(),
    m2.studentId.trim(),
    m2.phone.trim(),
    m2.email.trim(),
    m3.fullName.trim(),
    m3.grade.trim(),
    m3.room.trim(),
    m3.number.trim(),
    m3.studentId.trim(),
    m3.phone.trim(),
    m3.email.trim(),
    registrationCode,
  ];
}

async function listExistingRegistrationCodes(): Promise<Set<string>> {
  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName()}!X2:X`,
  });
  const codes = new Set<string>();
  for (const row of result.data.values ?? []) {
    const code = row[0]?.trim().toUpperCase();
    if (code) codes.add(code);
  }
  return codes;
}

export async function createUniqueRegistrationCode(): Promise<string> {
  const existing = await listExistingRegistrationCodes();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateRegistrationCode();
    if (!existing.has(code)) return code;
  }
  // fallback ที่ยาวขึ้นถ้าชนซ้ำมาก
  return generateRegistrationCode(8);
}

export async function appendRegistration(
  payload: RegistrationPayload,
  registrationCode: string
) {
  await ensureHeaderRow();
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName()}!A:X`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [registrationToRow(payload, registrationCode)],
    },
  });
}

export async function teamNameExists(teamName: string) {
  const teams = await listTeams();
  const normalized = teamName.trim().toLowerCase();
  return teams.some((team) => team.name.trim().toLowerCase() === normalized);
}

function rowToTeam(row: string[]): TeamListItem | null {
  const teamName = row[1]?.trim();
  if (!teamName) return null;

  const members = [
    {
      fullName: row[2] || "",
      grade: row[3] || "",
      room: row[4] || "",
      number: row[5] || "",
      studentId: row[6] || "",
      phone: row[7] || "",
      email: row[8] || "",
    },
    {
      fullName: row[9] || "",
      grade: row[10] || "",
      room: row[11] || "",
      number: row[12] || "",
      studentId: row[13] || "",
      phone: row[14] || "",
      email: row[15] || "",
    },
    {
      fullName: row[16] || "",
      grade: row[17] || "",
      room: row[18] || "",
      number: row[19] || "",
      studentId: row[20] || "",
      phone: row[21] || "",
      email: row[22] || "",
    },
  ];

  return {
    name: teamName,
    grade: gradeLabelFromMembers(members),
    members: members.map((m) => m.fullName.trim()).filter(Boolean),
    registeredAt: row[0] || "",
    registrationCode: (row[23] || "").trim(),
  };
}

export async function listTeams(): Promise<TeamListItem[]> {
  if (!isSheetsConfigured()) return [];

  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${sheetName()}!A2:X`,
  });

  const rows = result.data.values ?? [];
  return rows
    .map(rowToTeam)
    .filter((team): team is TeamListItem => Boolean(team));
}
