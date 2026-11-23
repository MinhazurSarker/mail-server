"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { DEFAULT_OTP_VALUES, OTP_LENGTH } from "./data";
import {
  twoStepVerificationSchema,
  type TwoStepVerificationFormData,
} from "./schema";
import type { TwoStepVerificationFormFieldsProps } from "./types";

export default function TwoStepVerificationFormFields({
  className,
  onSubmit,
}: TwoStepVerificationFormFieldsProps = {}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TwoStepVerificationFormData>({
    resolver: zodResolver(twoStepVerificationSchema),
    defaultValues: {
      otp: DEFAULT_OTP_VALUES,
    },
    mode: "onTouched",
  });

  const otp = watch("otp");

  const handleChange = (value: string, index: number) => {
    const char = value.slice(-1);
    const updatedOtp = [...otp];
    updatedOtp[index] = char;

    setValue("otp", updatedOtp, { shouldValidate: true });

    // Automatically move to the next input if a value is entered
    if (char && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      const updatedOtp = [...otp];

      // If current input is empty, move focus to the previous input
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      // Clear the current input
      updatedOtp[index] = "";
      setValue("otp", updatedOtp, { shouldValidate: true });
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    // Get the pasted text
    const pasteData = event.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH)
      .split("");

    // Update OTP with the pasted data
    const updatedOtp = [...otp];
    pasteData.forEach((char, idx) => {
      if (idx < updatedOtp.length) {
        updatedOtp[idx] = char;
      }
    });

    setValue("otp", updatedOtp, { shouldValidate: true });

    // Focus the last filled input
    const filledIndex = Math.min(pasteData.length - 1, OTP_LENGTH - 1);
    if (inputsRef.current[filledIndex]) {
      inputsRef.current[filledIndex]?.focus();
    }
  };

  const handleFormSubmit = async (data: TwoStepVerificationFormData) => {
    if (onSubmit) {
      await onSubmit(data);
      return;
    }
    alert(`Submitted OTP: ${data.otp.join("")}`);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={className ?? "space-y-5"}
      noValidate
    >
      <Field data-invalid={Boolean(errors.otp)}>
        <FieldLabel className="mb-1.5 block">
          Type your 6 digits security code
        </FieldLabel>
        <div className="flex gap-2 sm:gap-4" id="otp-container" dir="ltr">
          {otp.map((digit, index) => (
            <Input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => {
                if (el) {
                  inputsRef.current[index] = el;
                }
              }}
              className="dark:bg-dark-900 otp-input h-11 w-full px-2 text-center text-xl font-semibold sm:px-4"
              aria-label={`Digit ${index + 1}`}
              aria-invalid={errors.otp ? "true" : undefined}
            />
          ))}
        </div>
        <FieldError errors={[errors.otp as any, (errors.otp as any)?.root]} />
      </Field>

      <div>
        <Button
          className="w-full"
          size="lg"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify My Account"}
        </Button>
      </div>
    </form>
  );
}

export { TwoStepVerificationFormFields as OtpFormFields };
