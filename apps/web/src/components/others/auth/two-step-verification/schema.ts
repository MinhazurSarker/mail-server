import { z } from "zod";
import { OTP_LENGTH } from "./data";

export const twoStepVerificationSchema = z.object({
  otp: z
    .array(z.string())
    .length(OTP_LENGTH, `Please enter all ${OTP_LENGTH} digits`)
    .refine((val) => val.every((digit) => digit.trim().length === 1), {
      message: `Please enter all ${OTP_LENGTH} digits`,
    }),
});

export type TwoStepVerificationFormData = z.infer<
  typeof twoStepVerificationSchema
>;

export const otpSchema = twoStepVerificationSchema;
export type OtpFormData = TwoStepVerificationFormData;
