"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { XIcon } from "@/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { billingAddressSchema, type BillingAddressFormData } from "./schema";
import { BillingAddressData, EditBillingDialogProps } from "./types";

export { billingAddressSchema, type BillingAddressFormData };

interface BillingFormProps {
  initialData: BillingAddressData;
  onSave: (updatedData: BillingAddressData) => void;
  onClose: () => void;
}

function BillingForm({ initialData, onSave, onClose }: BillingFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BillingAddressFormData>({
    resolver: zodResolver(billingAddressSchema),
    defaultValues: initialData,
    mode: "onTouched",
  });

  React.useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = (formData: BillingAddressFormData) => {
    onSave({
      ...formData,
      vatNumber: formData.vatNumber ?? "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.firstName)}>
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="First name"
            aria-invalid={errors.firstName ? "true" : undefined}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field data-invalid={Boolean(errors.lastName)}>
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Last name"
            aria-invalid={errors.lastName ? "true" : undefined}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>

        <Field className="sm:col-span-2" data-invalid={Boolean(errors.street)}>
          <FieldLabel htmlFor="street">Street</FieldLabel>
          <Input
            id="street"
            {...register("street")}
            placeholder="Street address"
            aria-invalid={errors.street ? "true" : undefined}
          />
          <FieldError errors={[errors.street]} />
        </Field>

        <Field data-invalid={Boolean(errors.country)}>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input
            id="country"
            {...register("country")}
            placeholder="Country"
            aria-invalid={errors.country ? "true" : undefined}
          />
          <FieldError errors={[errors.country]} />
        </Field>

        <Field data-invalid={Boolean(errors.townCity)}>
          <FieldLabel htmlFor="townCity">Town/City</FieldLabel>
          <Input
            id="townCity"
            {...register("townCity")}
            placeholder="Town or City"
            aria-invalid={errors.townCity ? "true" : undefined}
          />
          <FieldError errors={[errors.townCity]} />
        </Field>

        <Field
          className="sm:col-span-2"
          data-invalid={Boolean(errors.cityState)}
        >
          <FieldLabel htmlFor="cityState">City/State</FieldLabel>
          <Input
            id="cityState"
            {...register("cityState")}
            placeholder="City, State, Zip"
            aria-invalid={errors.cityState ? "true" : undefined}
          />
          <FieldError errors={[errors.cityState]} />
        </Field>

        <Field data-invalid={Boolean(errors.zipCode)}>
          <FieldLabel htmlFor="zipCode">Zip/Postal code</FieldLabel>
          <Input
            id="zipCode"
            {...register("zipCode")}
            placeholder="Zip or postal code"
            aria-invalid={errors.zipCode ? "true" : undefined}
          />
          <FieldError errors={[errors.zipCode]} />
        </Field>

        <Field data-invalid={Boolean(errors.vatNumber)}>
          <FieldLabel htmlFor="vatNumber">VAT Number</FieldLabel>
          <Input
            id="vatNumber"
            {...register("vatNumber")}
            placeholder="VAT number"
            aria-invalid={errors.vatNumber ? "true" : undefined}
          />
          <FieldError errors={[errors.vatNumber]} />
        </Field>
      </div>

      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
        Click “Update Info” to update your billing information.
      </p>

      <DialogFooter className="m-0 p-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Close
        </Button>
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Info"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function EditBillingDialog({
  isOpen,
  onOpenChange,
  data,
  onSave,
}: EditBillingDialogProps) {
  const handleSave = (updatedData: BillingAddressData) => {
    onSave(updatedData);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] rounded-3xl p-6 sm:max-w-139.5 sm:p-10"
      >
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-e-6 top-6 size-11 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </Button>
          }
        />
        <DialogHeader className="gap-2 pe-12">
          <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Billing Settings
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Edit your billing address, card info, or payment method.
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <BillingForm
            key={isOpen ? "open" : "closed"}
            initialData={data}
            onSave={handleSave}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
