"use client";

import * as React from "react";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export const Form = <TFieldValues extends FieldValues>({ children, ...props }: UseFormReturn<TFieldValues> & { children: React.ReactNode }) => <FormProvider {...props}>{children}</FormProvider>;
export function FormMessage({ children, className }: React.ComponentProps<"p">) { return children ? <p className={cn("text-sm text-red-600", className)}>{children}</p> : null; }
