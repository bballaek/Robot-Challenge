"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, CircleAlertIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function PinInput({
  value,
  onChange,
  disabled,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function focus(i: number) {
    refs.current[Math.max(0, Math.min(5, i))]?.focus();
  }

  function update(nextDigits: string[]) {
    const next = nextDigits.join("").replace(/\D/g, "").slice(0, 6);
    onChange(next);
    if (next.length === 6) onComplete?.(next);
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="PIN 6 หลัก">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`หลักที่ ${index + 1}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            const next = [...digits];
            if (!raw) {
              next[index] = "";
              update(next);
              return;
            }
            for (let i = 0; i < raw.length && index + i < 6; i += 1) {
              next[index + i] = raw[i]!;
            }
            update(next);
            focus(index + raw.length);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const next = [...digits];
              if (next[index]) {
                next[index] = "";
                update(next);
              } else if (index > 0) {
                next[index - 1] = "";
                update(next);
                focus(index - 1);
              }
              return;
            }
            if (/^\d$/.test(e.key)) {
              e.preventDefault();
              const next = [...digits];
              next[index] = e.key;
              update(next);
              focus(index + 1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              focus(index - 1);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              focus(index + 1);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (!pasted) return;
            onChange(pasted);
            if (pasted.length === 6) onComplete?.(pasted);
            focus(Math.min(pasted.length, 6) - 1);
          }}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "size-11 rounded-xl border border-border bg-card text-center text-lg font-semibold outline-none transition sm:size-12",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            index === 3 && "ml-2 sm:ml-3",
            digit && "[-webkit-text-security:disc]"
          )}
        />
      ))}
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  disabled,
  saving,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  saving?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={checked ? `ปิด${title}` : `เปิด${title}`}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-1 left-1 flex size-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-0"
          )}
        >
          {saving ? (
            <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </span>
      </button>
    </div>
  );
}

export default function SettingPage() {
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [teamsPublic, setTeamsPublic] = useState(true);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [savingKey, setSavingKey] = useState<
    "registrationOpen" | "teamsPublic" | null
  >(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(
        (data: { registrationOpen?: boolean; teamsPublic?: boolean }) => {
          if (typeof data.registrationOpen === "boolean") {
            setRegistrationOpen(data.registrationOpen);
          }
          if (typeof data.teamsPublic === "boolean") {
            setTeamsPublic(data.teamsPublic);
          }
        }
      )
      .catch(() => {
        setMessage({ type: "error", text: "โหลดการตั้งค่าไม่สำเร็จ" });
      })
      .finally(() => setLoading(false));
  }, []);

  async function verifyPin(nextPin = pin) {
    if (verifying || unlocked) return;
    setMessage(null);

    if (nextPin.length !== 6) {
      setMessage({ type: "error", text: "กรุณากรอก PIN ให้ครบ 6 หลัก" });
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch("/api/settings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPin }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setUnlocked(false);
        setPin("");
        setMessage({
          type: "error",
          text: data.error || "PIN ไม่ถูกต้อง",
        });
        return;
      }

      setUnlocked(true);
      setMessage({
        type: "success",
        text: "ยืนยัน PIN สำเร็จ — ปรับการตั้งค่าได้แล้ว",
      });
    } catch {
      setMessage({ type: "error", text: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ" });
    } finally {
      setVerifying(false);
    }
  }

  async function save(
    key: "registrationOpen" | "teamsPublic",
    nextValue: boolean
  ) {
    if (savingKey || loading || !unlocked) return;
    setMessage(null);
    setSavingKey(key);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: nextValue, password: pin }),
      });
      const data = (await response.json()) as {
        error?: string;
        registrationOpen?: boolean;
        teamsPublic?: boolean;
      };

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่",
        });
        if (response.status === 401) {
          setUnlocked(false);
          setPin("");
        }
        return;
      }

      if (typeof data.registrationOpen === "boolean") {
        setRegistrationOpen(data.registrationOpen);
      }
      if (typeof data.teamsPublic === "boolean") {
        setTeamsPublic(data.teamsPublic);
      }

      if (key === "registrationOpen") {
        setMessage({
          type: "success",
          text: nextValue ? "เปิดรับสมัครแล้ว" : "ปิดรับสมัครแล้ว",
        });
      } else {
        setMessage({
          type: "success",
          text: nextValue
            ? "เปิดประกาศรายชื่อทีมแล้ว"
            : "ปิดประกาศรายชื่อทีมแล้ว — เมนูถูกซ่อน",
        });
      }
    } catch {
      setMessage({ type: "error", text: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ" });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-24 sm:px-8 sm:py-28">
      <div>
        <p className="text-sm font-medium tracking-wide text-primary">
          Rescue Line Robot Challenge
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          ตั้งค่าระบบ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          กรอก PIN ให้ถูกต้องก่อน แล้วจึงปรับการตั้งค่าได้
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">PIN แอดมิน 6 หลัก</p>
          <PinInput
            value={pin}
            onChange={(value) => {
              setPin(value);
              if (unlocked) setUnlocked(false);
            }}
            disabled={verifying || Boolean(savingKey)}
            onComplete={(value) => {
              void verifyPin(value);
            }}
          />
          {!unlocked ? (
            <Button
              className="mt-2 w-full rounded-full"
              disabled={verifying || pin.length !== 6}
              onClick={() => verifyPin()}
            >
              {verifying ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ยืนยัน PIN"
              )}
            </Button>
          ) : (
            <p className="text-center text-sm font-medium text-primary">
              ปลดล็อกแล้ว
            </p>
          )}
        </div>

        {unlocked ? (
          <>
            <Separator className="my-5" />
            <div className="space-y-6">
              <SettingToggle
                title="รับสมัคร"
                description={
                  loading
                    ? "กำลังโหลด..."
                    : registrationOpen
                      ? "กำลังเปิดรับสมัคร"
                      : "ปิดรับสมัครอยู่"
                }
                checked={registrationOpen}
                disabled={Boolean(savingKey) || loading}
                saving={savingKey === "registrationOpen"}
                onToggle={() => save("registrationOpen", !registrationOpen)}
              />
              <SettingToggle
                title="ประกาศรายชื่อทีม"
                description={
                  loading
                    ? "กำลังโหลด..."
                    : teamsPublic
                      ? "แสดงเมนูและหน้ารายชื่อทีม"
                      : "ซ่อนเมนูและปิดหน้าประกาศ"
                }
                checked={teamsPublic}
                disabled={Boolean(savingKey) || loading}
                saving={savingKey === "teamsPublic"}
                onToggle={() => save("teamsPublic", !teamsPublic)}
              />
            </div>
          </>
        ) : null}

        {message ? (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="mt-4"
          >
            {message.type === "error" ? (
              <CircleAlertIcon />
            ) : (
              <CheckCircle2Icon />
            )}
            <AlertTitle>
              {message.type === "error" ? "ไม่สำเร็จ" : "สำเร็จ"}
            </AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </section>
  );
}
