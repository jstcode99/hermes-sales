"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, Building2 } from "lucide-react";
import { companyProfileSchema, type CompanyProfileInput } from "@/modules/onboarding/schema/onboarding.schema";
import { updateCompanyProfileAction, uploadCompanyLogoAction } from "@/modules/onboarding/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

interface StepCompanyProfileProps {
  companyId: string;
  initialData?: Partial<CompanyProfileInput>;
  onNext: () => void;
}

export function StepCompanyProfile({ companyId, initialData, onNext }: StepCompanyProfileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyId,
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      billingName: initialData?.billingName || "",
      billingDocument: initialData?.billingDocument || "",
      billingDocumentType: initialData?.billingDocumentType || "nit",
      billingAddress: initialData?.billingAddress || "",
      billingEmail: initialData?.billingEmail || "",
      billingPhone: initialData?.billingPhone || "",
    },
    mode: "onBlur",
  });

  async function onSubmit(data: CompanyProfileInput) {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });

      await updateCompanyProfileAction(formData);
      toast.success("Company profile saved");
      onNext();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("logo", file);

      const result = await uploadCompanyLogoAction(formData);
      
      if (result.logoUrl) {
        setLogoPreview(result.logoUrl);
        form.setValue("logoUrl", result.logoUrl);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Profile
        </CardTitle>
        <CardDescription>
          Tell us about your company. This information will be used for billing and invoicing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="onboarding-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company logo" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <div>
                <FormLabel>Company Logo</FormLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+57 300 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 123, Bogotá, Colombia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Billing Information */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-medium">Billing Information</h3>
              <p className="text-sm text-muted-foreground">This will appear on your invoices.</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name S.A.S." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / NIT</FormLabel>
                      <FormControl>
                        <Input placeholder="900123456-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="billing@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+57 300 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle 123, Bogotá, Colombia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
