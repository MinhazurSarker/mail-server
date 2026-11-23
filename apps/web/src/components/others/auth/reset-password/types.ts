import type { ResetPasswordFormData } from "./schema";

export type { ResetPasswordFormData };

export interface ResetPasswordFormFieldsProps {
  className?: string;
  onSubmit?: (data: ResetPasswordFormData) => void | Promise<void>;
}
