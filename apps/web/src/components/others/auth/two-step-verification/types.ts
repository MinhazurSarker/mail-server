import type { TwoStepVerificationFormData } from "./schema";

export type { TwoStepVerificationFormData };

export interface TwoStepVerificationFormFieldsProps {
  className?: string;
  onSubmit?: (data: TwoStepVerificationFormData) => void | Promise<void>;
}

export type OtpFormData = TwoStepVerificationFormData;
export type OtpFormFieldsProps = TwoStepVerificationFormFieldsProps;
