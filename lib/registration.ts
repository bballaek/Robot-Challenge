export type Member = {
  fullName: string;
  grade: string;
  room: string;
  number: string;
  studentId: string;
  phone: string;
  email: string;
};

export type RegistrationPayload = {
  teamName: string;
  members: [Member, Member, Member];
};

export type MemberErrors = Partial<Record<keyof Member, string>>;

export type TeamListItem = {
  name: string;
  grade: string;
  members: string[];
  registeredAt: string;
  registrationCode: string;
};

/** ชุดอักขระที่อ่านง่าย ตัดตัวที่สับสน (0/O, 1/I) ออก */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** สร้างรหัสลงทะเบียน เช่น RL-A3K9P2 */
export function generateRegistrationCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < length; i += 1) {
    body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `RL-${body}`;
}

export const GRADE_OPTIONS = [
  { value: "ม.1", label: "ม.1" },
  { value: "ม.2", label: "ม.2" },
  { value: "ม.3", label: "ม.3" },
] as const;

export function emptyMember(): Member {
  return {
    fullName: "",
    grade: "",
    room: "",
    number: "",
    studentId: "",
    phone: "",
    email: "",
  };
}

export function validateMember(member: Member): MemberErrors {
  const errors: MemberErrors = {};
  if (!member.fullName.trim()) errors.fullName = "กรุณากรอกชื่อ-นามสกุล";
  if (!member.grade.trim()) errors.grade = "กรุณาเลือกชั้น";
  if (!member.room.trim()) errors.room = "กรุณาเลือกห้อง";
  if (!member.number.trim()) errors.number = "กรุณากรอกเลขที่";
  if (!member.studentId.trim()) errors.studentId = "กรุณากรอกเลขประจำตัว";
  if (!member.phone.trim()) errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  else if (!/^[0-9+\-\s]{9,15}$/.test(member.phone.trim())) {
    errors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
  }
  if (!member.email.trim()) errors.email = "กรุณากรอกอีเมล";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }
  return errors;
}

export function validateRegistration(payload: RegistrationPayload): {
  teamNameError: string;
  memberErrors: [MemberErrors, MemberErrors, MemberErrors];
  ok: boolean;
} {
  const teamNameError = payload.teamName.trim() ? "" : "กรุณากรอกชื่อทีม";
  const memberErrors = payload.members.map(validateMember) as [
    MemberErrors,
    MemberErrors,
    MemberErrors,
  ];
  const hasMemberError = memberErrors.some(
    (errors) => Object.keys(errors).length > 0
  );
  return {
    teamNameError,
    memberErrors,
    ok: !teamNameError && !hasMemberError,
  };
}

export function gradeLabelFromMembers(members: Member[]): string {
  const grades = [...new Set(members.map((m) => m.grade.trim()).filter(Boolean))];
  if (grades.length === 0) return "-";
  return grades.join(" / ");
}
