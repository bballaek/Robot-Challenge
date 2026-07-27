"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = {
  length?: number;
  code?: string;
  verify?: (value: string) => boolean | Promise<boolean>;
  mask?: boolean;
  group?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
};

function toCells(value: string, length: number) {
  const digits = value.replace(/\D/g, "").slice(0, length);
  return Array.from({ length }, (_, i) => digits[i] ?? "");
}

export default function OtpInput({
  length = 6,
  code,
  verify,
  mask = false,
  group = false,
  value: controlledValue,
  onChange,
  onComplete,
  className,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "รหัส PIN",
}: OtpInputProps) {
  const reactId = useId();
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState(
    () => controlledValue?.replace(/\D/g, "").slice(0, length) ?? ""
  );
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const verifyingRef = useRef(false);

  const value = isControlled
    ? (controlledValue ?? "").replace(/\D/g, "").slice(0, length)
    : internal;
  const cells = toCells(value, length);
  const midpoint = Math.floor(length / 2);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  function emit(nextValue: string) {
    const cleaned = nextValue.replace(/\D/g, "").slice(0, length);
    if (!isControlled) setInternal(cleaned);
    onChange?.(cleaned);

    if (cleaned.length === length) {
      onComplete?.(cleaned);
      void runVerify(cleaned);
    } else {
      setStatus("idle");
    }
  }

  async function runVerify(nextValue: string) {
    if (verifyingRef.current) return;
    const checker = verify ?? (code ? (v: string) => v === code : null);
    if (!checker) return;

    verifyingRef.current = true;
    try {
      const ok = await checker(nextValue);
      if (ok) {
        setStatus("ok");
        return;
      }
      setStatus("error");
      window.setTimeout(() => {
        emit("");
        setStatus("idle");
        inputsRef.current[0]?.focus();
      }, 420);
    } finally {
      verifyingRef.current = false;
    }
  }

  function focusAt(index: number) {
    const el = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
    el?.select();
  }

  function writeAt(index: number, digit: string) {
    const next = [...cells];
    next[index] = digit;
    emit(next.join(""));
    if (digit && index < length - 1) {
      requestAnimationFrame(() => focusAt(index + 1));
    }
  }

  function handleInput(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      writeAt(index, "");
      return;
    }

    if (digits.length === 1) {
      writeAt(index, digits);
      return;
    }

    const next = [...cells];
    for (let i = 0; i < digits.length && index + i < length; i += 1) {
      next[index + i] = digits[i]!;
    }
    emit(next.join(""));
    requestAnimationFrame(() =>
      focusAt(Math.min(index + digits.length, length - 1))
    );
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (cells[index]) {
        writeAt(index, "");
      } else if (index > 0) {
        const next = [...cells];
        next[index - 1] = "";
        emit(next.join(""));
        requestAnimationFrame(() => focusAt(index - 1));
      }
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      writeAt(index, event.key);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    emit(digits.slice(0, length));
    requestAnimationFrame(() =>
      focusAt(Math.min(digits.length, length) - 1)
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2",
        status === "error" && "animate-otp-shake",
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {cells.map((digit, index) => (
        <input
          key={`${reactId}-${index}`}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`หลักที่ ${index + 1}`}
          value={digit}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "size-11 rounded-xl border bg-card text-center text-lg font-semibold text-foreground outline-none transition sm:size-12",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            group && index === midpoint && "ml-2 sm:ml-3",
            mask && digit && "[-webkit-text-security:disc]",
            status === "ok" && "border-primary bg-primary/10 text-primary",
            status === "error" &&
              "border-destructive bg-destructive/5 text-destructive",
            status === "idle" && "border-border"
          )}
        />
      ))}
    </div>
  );
}
