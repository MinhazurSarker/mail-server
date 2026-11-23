import { z } from "zod";

export const billingAddressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  street: z.string().trim().min(1, "Street address is required"),
  country: z.string().trim().min(1, "Country is required"),
  townCity: z.string().trim().min(1, "Town or city is required"),
  cityState: z.string().trim().min(1, "City and state are required"),
  zipCode: z.string().trim().min(1, "Zip/Postal code is required"),
  vatNumber: z.string().optional(),
});

export type BillingAddressFormData = z.infer<typeof billingAddressSchema>;
