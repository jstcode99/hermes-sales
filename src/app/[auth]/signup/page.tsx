"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Checkbox } from "@components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { toast } from "sonner";
import { GoogleSignUpButton } from "@modules/auth/components/google-auth";
import { GithubAuthButton } from "@modules/auth/components/github-auth";
import { signUpAction } from "@modules/auth/actions/auth.actions";
import { signUpSchema, SignUpInput } from "@modules/auth/schema/auth.schema";
import { useDepartments } from "../hooks/use-departments";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SignUpInput>>({
    documentType: "cc",
    termsAccepted: false,
  });
  const { departments, municipalities, getMunicipalities, isLoading: geoLoading } = useDepartments();

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      signUpSchema.parse(formData);

      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          fd.append(k, String(v));
        }
      });

      const result = await signUpAction(fd);
      // If company was created, go to onboarding; otherwise go to signin for verification
      const redirectPath = (result as any)?.redirectTo || "/signin";
      toast.success("Account created! Please check your email to verify.");
      router.push(redirectPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Crea tu cuenta
        </CardTitle>
        <CardDescription>
          Rellena los siguientes campos para crear tu cuenta.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <GoogleSignUpButton />
            <GithubAuthButton className="rounded-xs p-[18.9px]"/>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continua con tu correo
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              minLength={8}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="3001234567"
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              minLength={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de documento</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleChange("documentType", value)}
              >
                <SelectTrigger
                  className="w-full"
                  id="documentType"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cc">Cédula (CC)</SelectItem>
                  <SelectItem value="ce">Cédula Extranjería (CE)</SelectItem>
                  <SelectItem value="ti">Tarjeta Identidad (TI)</SelectItem>
                  <SelectItem value="rc">Registro Civil (RC)</SelectItem>
                  <SelectItem value="pa">Pasaporte (PA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentId">Número de documento</Label>
              <Input
                id="documentId"
                name="documentId"
                placeholder="12345678"
                value={formData.documentId || ""}
                onChange={(e) => handleChange("documentId", e.target.value)}
                required
              />
            </div>
          </div>
          {/* Department & Municipality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Departamento</Label>
              <Select
                value={formData.departmentId?.toString() || ""}
                onValueChange={(value) => {
                  handleChange("departmentId", parseInt(value));
                  handleChange("municipalityId", "");
                }}
              >
                <SelectTrigger
                  className="w-full"
                  id="departmentId"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipalityId">Municipio</Label>
              <Select
                value={formData.municipalityId?.toString() || ""}
                onValueChange={(value) => handleChange("municipalityId", parseInt(value))}
                disabled={!formData.departmentId || geoLoading}
              >
                <SelectTrigger
                  className="w-full"
                  id="municipalityId"
                >
                  <SelectValue placeholder="Select municipality" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((mun) => (
                    <SelectItem key={mun.id} value={mun.id.toString()}>
                      {mun.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode">Codigo de referencia (Opcional)</Label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="ABCD1234"
              value={formData.referralCode || ""}
              onChange={(e) => handleChange("referralCode", e.target.value)}
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa (Opcional)</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="My Company"
              value={formData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          {/* Terms */}
          <div className="flex items-center space-x-2 py-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleChange("termsAccepted", checked)}
            />
            <Label htmlFor="termsAccepted" className="text-sm font-normal">
              <p className="text-wrap space-x-1 font-normal ">
                Acepto los
                <Link href="/terms" className="ml-1 underline">
                  terminos & condiciones
                </Link>
                y
                <Link href="/privacy" className="ml-1 underline">
                  las politicas de privacidad
                </Link>
              </p>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Ya tienes una cuenta?
            <Link href="/auth/signin" className="ml-2 text-primary hover:underline">
              Inicar sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
