"use client";

import { useRef, useCallback, KeyboardEvent, ClipboardEvent, FocusEvent } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onSubmit?: () => void;
  autoFocus?: boolean;
  hasError?: boolean;
  errorId?: string;
}

/**
 * Segmented OTP input — renders N individual digit boxes styled for a
 * light background. The value is always a plain string so leading zeros
 * are preserved. Supports full-code paste, backspace, arrow navigation,
 * browser OTP autofill (first box), and Enter to submit.
 */
export default function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  onSubmit,
  autoFocus = false,
  hasError = false,
  errorId,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = useCallback(
    (i: number) => {
      const idx = Math.max(0, Math.min(i, length - 1));
      inputRefs.current[idx]?.focus();
    },
    [length],
  );

  const update = useCallback(
    (index: number, char: string) => {
      const next = digits.slice();
      next[index] = char;
      onChange(next.join(""));
    },
    [digits, onChange],
  );

  const handleChange = (i: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    update(i, char);
    if (char && i < length - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        update(i, "");
      } else if (i > 0) {
        update(i - 1, "");
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusBox(i + 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    onChange(text);
    const focusIdx = Math.min(text.length, length - 1);
    focusBox(focusIdx);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // ── Box styling ──────────────────────────────────────────────
  // 48×56 px on desktop (w-12 h-14), shrinks on mobile to prevent overflow.
  // White bg, thin light-gray borders, dark digits, lime focus accent.
  const base =
    "h-12 w-10 sm:h-14 sm:w-12 rounded-lg border-2 text-center text-lg font-bold " +
    "text-[#0d0d0d] bg-white transition-colors " +
    "focus:outline-none focus-visible:outline-none";

  const borderFor = (i: number) => {
    if (hasError) return "border-red-300 focus:border-red-400";
    if (digits[i]) return "border-gray-300";
    return "border-gray-200";
  };

  const focusRing = "focus:border-[#d4f000] focus:ring-2 focus:ring-[#d4f000]/25";

  return (
    <div
      className="flex justify-center gap-1.5 sm:gap-2"
      role="group"
      aria-label="Verification code"
      aria-describedby={errorId}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          autoFocus={i === 0 && autoFocus}
          className={[
            base,
            borderFor(i),
            focusRing,
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
