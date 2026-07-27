"use client";

import * as React from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export type AppleTextFieldProps = Omit<
  React.ComponentProps<"input">,
  "placeholder" | "size"
> & {
  label: string;
  error?: string | null;
  /** Show eye toggle when type is password (default true). */
  showPasswordToggle?: boolean;
  containerClassName?: string;
};

/**
 * Apple-style floating-label text field.
 * Label sits in the field, then animates up when focused or filled.
 */
export function AppleTextField({
  label,
  error,
  className,
  containerClassName,
  id,
  disabled,
  type = "text",
  showPasswordToggle = true,
  onFocus,
  onBlur,
  ...props
}: AppleTextFieldProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [focused, setFocused] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const isPassword = type === "password";
  const showToggle = isPassword && showPasswordToggle;
  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;
  const hasError = Boolean(error);

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className={cn(
          "relative rounded-2xl border bg-background transition-[border-color,background-color,box-shadow] duration-200",
          hasError && !focused && "border-[#ff3b30] bg-[#fff5f5]",
          hasError && focused && "border-[#0071e3] bg-background",
          !hasError && !focused && "border-border",
          !hasError && focused && "border-[#0071e3] bg-background",
          focused && "shadow-[0_0_0_3px_rgba(0,113,227,0.18)]",
          disabled && "opacity-50"
        )}
      >
        <input
          id={inputId}
          type={inputType}
          disabled={disabled}
          placeholder=" "
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            "peer h-14 w-full rounded-2xl bg-transparent px-4 pt-5 pb-1.5 text-[17px] leading-tight text-foreground outline-none",
            "disabled:cursor-not-allowed",
            // Keep autofill from blowing up the floating layout
            "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--background)] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit]",
            showToggle && "pr-12",
            className
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-[17px] font-normal leading-none",
            "transition-all duration-200 ease-out",
            // Floated when focused or has value (placeholder trick)
            "peer-focus:top-[0.7rem] peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:tracking-[0.01em]",
            "peer-[:not(:placeholder-shown)]:top-[0.7rem] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:tracking-[0.01em]",
            hasError ? "text-[#ff3b30]" : "text-muted-foreground",
            !hasError && focused && "text-[#0071e3]"
          )}
        >
          {label}
        </label>

        {showToggle ? (
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:pointer-events-none"
            onClick={() => setPasswordVisible((v) => !v)}
            disabled={disabled}
            aria-label={passwordVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 px-0.5 text-[13px] leading-snug text-[#ff3b30]"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
