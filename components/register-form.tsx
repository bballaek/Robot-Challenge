"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2Icon, CircleAlertIcon, Loader2Icon } from "lucide-react";
import { AppleSelectField3, AppleTextField3 } from "@/components/field/AppleTextField3";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  emptyMember,
  GRADE_OPTIONS,
  type Member,
  type MemberErrors,
  validateMember,
} from "@/lib/registration";

type FormState = {
  teamName: string;
  members: [Member, Member, Member];
};

const ROOM_OPTIONS = Array.from({ length: 9 }, (_, i) => {
  const value = String(i + 1);
  return { value, label: value };
});

const GRADE_SELECT_OPTIONS = GRADE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const initialState = (): FormState => ({
  teamName: "",
  members: [emptyMember(), emptyMember(), emptyMember()],
});

const MEMBER_FIELD_ORDER: (keyof Member)[] = [
  "fullName",
  "grade",
  "room",
  "number",
  "studentId",
  "phone",
  "email",
];

function focusFirstInvalid(
  teamNameError: string,
  memberErrors: MemberErrors[]
) {
  let targetId: string | null = null;

  if (teamNameError) {
    targetId = "teamName";
  } else {
    outer: for (let index = 0; index < memberErrors.length; index += 1) {
      for (const key of MEMBER_FIELD_ORDER) {
        if (memberErrors[index][key]) {
          targetId = `member-${index}-${key}`;
          break outer;
        }
      }
    }
  }

  if (!targetId) return;

  const el = document.getElementById(targetId);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    (el as HTMLInputElement | HTMLSelectElement).focus({
      preventScroll: true,
    });
  }, 400);
}

function MemberSection({
  index,
  member,
  errors,
  onChange,
}: {
  index: number;
  member: Member;
  errors: MemberErrors;
  onChange: (key: keyof Member, value: string) => void;
}) {
  const prefix = `member-${index}`;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          คนที่ {index + 1}
          {index === 0 ? " (หัวหน้าทีม)" : ""}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {index === 0
            ? "ข้อมูลหัวหน้าทีม — จะได้รับอีเมลยืนยันการลงทะเบียน"
            : `ข้อมูลสมาชิกทีมคนที่ ${index + 1}`}
        </p>
      </div>

      <AppleTextField3
        id={`${prefix}-fullName`}
        label="ชื่อ-นามสกุล"
        value={member.fullName}
        onChange={(e) => onChange("fullName", e.target.value)}
        autoComplete="name"
        error={errors.fullName}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AppleSelectField3
          id={`${prefix}-grade`}
          label="ชั้น"
          options={GRADE_SELECT_OPTIONS}
          value={member.grade}
          onChange={(value) => onChange("grade", value)}
          error={errors.grade}
        />
        <AppleSelectField3
          id={`${prefix}-room`}
          label="ห้อง"
          options={ROOM_OPTIONS}
          value={member.room}
          onChange={(value) => onChange("room", value)}
          error={errors.room}
        />
        <AppleTextField3
          id={`${prefix}-number`}
          label="เลขที่"
          value={member.number}
          onChange={(e) =>
            onChange("number", e.target.value.replace(/\D/g, ""))
          }
          inputMode="numeric"
          pattern="[0-9]*"
          error={errors.number}
        />
        <AppleTextField3
          id={`${prefix}-studentId`}
          label="เลขประจำตัว"
          value={member.studentId}
          onChange={(e) =>
            onChange("studentId", e.target.value.replace(/\D/g, ""))
          }
          inputMode="numeric"
          pattern="[0-9]*"
          error={errors.studentId}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AppleTextField3
          id={`${prefix}-phone`}
          label="เบอร์โทรศัพท์"
          type="tel"
          value={member.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone}
        />
        <AppleTextField3
          id={`${prefix}-email`}
          label="อีเมล"
          type="email"
          value={member.email}
          onChange={(e) => onChange("email", e.target.value)}
          autoComplete="email"
          inputMode="email"
          error={errors.email}
        />
      </div>
    </section>
  );
}

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [teamNameError, setTeamNameError] = useState("");
  const [memberErrors, setMemberErrors] = useState<
    [MemberErrors, MemberErrors, MemberErrors]
  >([{}, {}, {}]);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAttempted, setEmailAttempted] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateTeamName(value: string) {
    setForm((prev) => ({ ...prev, teamName: value }));
    setTeamNameError("");
    setFormError("");
    setSuccess(false);
    setEmailSent(false);
    setEmailAttempted(false);
    setRegistrationCode("");
  }

  function updateMember(index: 0 | 1 | 2, key: keyof Member, value: string) {
    setForm((prev) => {
      const members = [...prev.members] as FormState["members"];
      members[index] = { ...members[index], [key]: value };
      return { ...prev, members };
    });
    setMemberErrors((prev) => {
      const next = [...prev] as [MemberErrors, MemberErrors, MemberErrors];
      next[index] = { ...next[index], [key]: undefined };
      return next;
    });
    setFormError("");
    setSuccess(false);
    setEmailSent(false);
    setEmailAttempted(false);
    setRegistrationCode("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextTeamError = form.teamName.trim() ? "" : "กรุณากรอกชื่อทีม";
    const nextMemberErrors = form.members.map(validateMember) as [
      MemberErrors,
      MemberErrors,
      MemberErrors,
    ];
    const hasMemberError = nextMemberErrors.some(
      (errors) => Object.keys(errors).length > 0
    );

    setTeamNameError(nextTeamError);
    setMemberErrors(nextMemberErrors);

    if (nextTeamError || hasMemberError) {
      setFormError("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบหรือไม่ถูกต้อง");
      setSuccess(false);
      focusFirstInvalid(nextTeamError, nextMemberErrors);
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        error?: string;
        registrationCode?: string;
        emailQueued?: boolean;
        emailConfigured?: boolean;
        teamNameError?: string;
        memberErrors?: [MemberErrors, MemberErrors, MemberErrors];
      };

      if (!response.ok) {
        if (data.teamNameError) setTeamNameError(data.teamNameError);
        if (data.memberErrors) setMemberErrors(data.memberErrors);
        setFormError(data.error || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
        setSuccess(false);
        focusFirstInvalid(
          data.teamNameError || "",
          data.memberErrors || [{}, {}, {}]
        );
        return;
      }

      setSuccess(true);
      setRegistrationCode(data.registrationCode || "");
      setEmailSent(Boolean(data.emailQueued));
      setEmailAttempted(Boolean(data.emailConfigured));
      setForm(initialState());
      setMemberErrors([{}, {}, {}]);
      setTeamNameError("");
    } catch {
      setFormError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            ชื่อทีม
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ตั้งชื่อทีมสำหรับการแข่งขัน Rescue Line Robot Challenge
          </p>
        </div>
        <AppleTextField3
          id="teamName"
          label="ชื่อทีม"
          value={form.teamName}
          onChange={(e) => updateTeamName(e.target.value)}
          error={teamNameError}
        />
      </section>

      <Separator />

      <div className="space-y-2">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          ข้อมูลสมาชิก
        </h2>
        <p className="text-sm text-muted-foreground">
          กรอกข้อมูลสมาชิกทีมครบทั้ง 3 คน
        </p>
      </div>

      {form.members.map((member, index) => (
        <div key={index}>
          {index > 0 ? <Separator className="mb-10" /> : null}
          <MemberSection
            index={index}
            member={member}
            errors={memberErrors[index]}
            onChange={(key, value) =>
              updateMember(index as 0 | 1 | 2, key, value)
            }
          />
        </div>
      ))}

      {formError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>ยังลงทะเบียนไม่ได้</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>ลงทะเบียนสำเร็จ</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              {registrationCode ? (
                <p>
                  รหัสลงทะเบียนของทีม:{" "}
                  <span className="font-mono text-base font-semibold tracking-wider text-foreground">
                    {registrationCode}
                  </span>
                  <br />
                  <span className="text-muted-foreground">
                    โปรดเก็บรหัสนี้ไว้เพื่อใช้ตรวจสอบในวันแข่งขัน
                  </span>
                </p>
              ) : null}
              <p>
                {emailSent
                  ? "บันทึกข้อมูลทีมเรียบร้อยแล้ว อีเมลยืนยันพร้อมรหัสจะส่งไปยังหัวหน้าทีมในอีกสักครู่"
                  : emailAttempted
                    ? "บันทึกข้อมูลทีมเรียบร้อยแล้ว แต่ระบบอีเมลยังไม่พร้อม กรุณาติดต่อผู้ดูแลระบบ"
                    : "บันทึกข้อมูลทีมเรียบร้อยแล้ว รอการยืนยันจากคณะกรรมการ"}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full rounded-full sm:w-auto sm:min-w-48"
      >
        {submitting ? (
          <>
            <Loader2Icon className="animate-spin" />
            กำลังส่ง...
          </>
        ) : (
          "ส่งใบลงทะเบียน"
        )}
      </Button>
    </form>
  );
}
