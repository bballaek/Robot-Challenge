"use client";

import * as React from "react";
import { AlertCircle, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type AppleTextField3Props = Omit<
  React.ComponentProps<"input">,
  "size" | "placeholder"
> & {
  label: string;
  /** Hint under the field (hidden when `error` is set). */
  helperText?: string;
  error?: string | null;
  /** Show ✕ clear control when the field has a value (default true). */
  showClear?: boolean;
  onClear?: () => void;
  containerClassName?: string;
};

/**
 * Outlined floating-label text field (Apple-like interaction).
 * Colors follow the app theme — example blues in mockups were layout-only.
 */
export function AppleTextField3({
  label,
  helperText,
  error,
  showClear = true,
  onClear,
  className,
  containerClassName,
  id,
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}: AppleTextField3Props) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => String(defaultValue ?? "")
  );
  const [focused, setFocused] = React.useState(false);

  const currentValue = isControlled ? String(value ?? "") : uncontrolledValue;
  const hasValue = currentValue.length > 0;
  const floated = focused || hasValue;
  const hasError = Boolean(error);
  const canClear = showClear && !disabled && !readOnly && hasValue;

  function emitChange(next: string) {
    if (!isControlled) setUncontrolledValue(next);
    const synthetic = {
      target: { value: next },
      currentTarget: { value: next },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(synthetic);
  }

  function handleClear() {
    emitChange("");
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className={cn(
          "relative rounded-xl border bg-card transition-[border-color,box-shadow] duration-200",
          hasError &&
            "border-destructive shadow-[0_0_0_3px] shadow-destructive/20",
          !hasError && focused && "border-ring shadow-[0_0_0_3px] shadow-ring/30",
          !hasError && !focused && "border-border",
          disabled && "opacity-50"
        )}
      >
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 z-[1] origin-left px-1.5 text-[15px] font-normal leading-none will-change-transform",
            "bg-card transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            floated
              ? "-translate-y-[calc(50%+1.5rem)] scale-[0.8]"
              : "-translate-y-1/2 scale-100",
            hasError && floated
              ? "text-destructive"
              : focused && floated
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {label}
        </label>

        <input
          ref={inputRef}
          id={inputId}
          disabled={disabled}
          readOnly={readOnly}
          placeholder=" "
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          aria-invalid={hasError || undefined}
          aria-describedby={error || helperText ? helpId : undefined}
          className={cn(
            "h-12 w-full rounded-xl bg-transparent px-3.5 text-[15px] text-foreground outline-none",
            "disabled:cursor-not-allowed",
            canClear ? "pr-10" : "pr-3.5",
            className
          )}
          onChange={(e) => {
            if (!isControlled) setUncontrolledValue(e.target.value);
            onChange?.(e);
          }}
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

        {canClear ? (
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            aria-label="ล้างข้อความ"
          >
            <X className="size-4" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={helpId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 px-0.5 text-xs leading-snug text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helpId} className="mt-1.5 px-0.5 text-xs leading-snug text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export type AppleTextAreaField3Props = Omit<
  React.ComponentProps<"textarea">,
  "children" | "placeholder"
> & {
  label: string;
  helperText?: string;
  error?: string | null;
  showClear?: boolean;
  onClear?: () => void;
  containerClassName?: string;
};

/** Outlined floating-label textarea matching AppleTextField3. */
export const AppleTextAreaField3 = React.forwardRef<
  HTMLTextAreaElement,
  AppleTextAreaField3Props
>(function AppleTextAreaField3(
  {
    label,
    helperText,
    error,
    showClear = true,
    onClear,
    className,
    containerClassName,
    id,
    disabled,
    readOnly,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    rows = 3,
    ...props
  },
  ref
) {
  const autoId = React.useId();
  const areaId = id ?? autoId;
  const helpId = `${areaId}-help`;
  const areaRef = React.useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = React.useState(false);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      areaRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => String(defaultValue ?? "")
  );
  const currentValue = isControlled ? String(value ?? "") : uncontrolledValue;
  const hasValue = currentValue.length > 0;
  const floated = focused || hasValue;
  const hasError = Boolean(error);
  const canClear = showClear && !disabled && !readOnly && hasValue;

  function emitChange(next: string) {
    if (!isControlled) setUncontrolledValue(next);
    const synthetic = {
      target: { value: next },
      currentTarget: { value: next },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange?.(synthetic);
  }

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className={cn(
          "relative rounded-xl border bg-card transition-[border-color,box-shadow] duration-200",
          hasError &&
            "border-destructive shadow-[0_0_0_3px] shadow-destructive/20",
          !hasError && focused && "border-ring shadow-[0_0_0_3px] shadow-ring/30",
          !hasError && !focused && "border-border",
          disabled && "opacity-50"
        )}
      >
        <label
          htmlFor={areaId}
          className={cn(
            "pointer-events-none absolute left-3.5 top-4 z-[1] origin-left px-1.5 text-[15px] font-normal leading-none will-change-transform",
            "bg-card transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            floated
              ? "-translate-y-[calc(50%+0.75rem)] scale-[0.8]"
              : "translate-y-0 scale-100",
            hasError && floated
              ? "text-destructive"
              : focused && floated
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {label}
        </label>

        <textarea
          ref={setRefs}
          id={areaId}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          placeholder=" "
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          aria-invalid={hasError || undefined}
          aria-describedby={error || helperText ? helpId : undefined}
          className={cn(
            "w-full resize-y bg-transparent px-3.5 pb-3 pt-5 text-[15px] leading-relaxed text-foreground outline-none",
            "disabled:cursor-not-allowed",
            canClear ? "pr-10" : "pr-3.5",
            className
          )}
          onChange={(e) => {
            if (!isControlled) setUncontrolledValue(e.target.value);
            onChange?.(e);
          }}
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

        {canClear ? (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-1 top-2 flex size-8 items-center justify-center text-muted-foreground transition hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              emitChange("");
              onClear?.();
              areaRef.current?.focus();
            }}
            aria-label="ล้างข้อความ"
          >
            <X className="size-4" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={helpId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 px-0.5 text-xs leading-snug text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helpId} className="mt-1.5 px-0.5 text-xs leading-snug text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export type AppleSelectOption3 = {
  value: string;
  label: string;
};

export type AppleSelectField3Props = {
  label: string;
  options: AppleSelectOption3[];
  value?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  error?: string | null;
  id?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  containerClassName?: string;
  className?: string;
};

/** Outlined floating-label select matching AppleTextField3. */
export function AppleSelectField3({
  label,
  options,
  value = "",
  onChange,
  helperText,
  error,
  id,
  disabled,
  name,
  required,
  containerClassName,
  className,
}: AppleSelectField3Props) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  const helpId = `${selectId}-help`;
  const [focused, setFocused] = React.useState(false);

  const hasValue = value.length > 0;
  const floated = focused || hasValue;
  const hasError = Boolean(error);

  return (
    <div className={cn("w-full", containerClassName)}>
      <div
        className={cn(
          "relative rounded-xl border bg-card transition-[border-color,box-shadow] duration-200",
          hasError &&
            "border-destructive shadow-[0_0_0_3px] shadow-destructive/20",
          !hasError && focused && "border-ring shadow-[0_0_0_3px] shadow-ring/30",
          !hasError && !focused && "border-border",
          disabled && "opacity-50"
        )}
      >
        <label
          htmlFor={selectId}
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 z-[1] origin-left px-1.5 text-[15px] font-normal leading-none will-change-transform",
            "bg-card transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            floated
              ? "-translate-y-[calc(50%+1.5rem)] scale-[0.8]"
              : "-translate-y-1/2 scale-100",
            hasError && floated
              ? "text-destructive"
              : focused && floated
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {label}
        </label>

        <select
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          value={value}
          aria-invalid={hasError || undefined}
          aria-describedby={error || helperText ? helpId : undefined}
          className={cn(
            "h-12 w-full appearance-none rounded-xl bg-transparent px-3.5 pr-10 text-[15px] text-foreground outline-none",
            "disabled:cursor-not-allowed",
            !hasValue && "text-transparent",
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <option value="" disabled hidden />
          {options.map((option) => (
            <option key={`${selectId}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>

      {hasError ? (
        <p
          id={helpId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 px-0.5 text-xs leading-snug text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helpId} className="mt-1.5 px-0.5 text-xs leading-snug text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
