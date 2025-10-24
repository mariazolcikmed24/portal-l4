import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail").max(254, "E-mail jest za długi"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Logowanie = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement authentication with Lovable Cloud
      console.log("Login data:", data);
      toast({
        title: "Funkcja w budowie",
        description: "Logowanie zostanie wkrótce aktywowane po włączeniu Lovable Cloud.",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas logowania. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Logowanie
          </h1>
          <p className="text-muted-foreground mb-8">
            Zaloguj się do swojego konta
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login_email">E-mail</Label>
              <Input
                id="login_email"
                type="email"
                placeholder="twoj@email.pl"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login_password">Hasło</Label>
                <Link to="#" className="text-sm text-primary hover:underline">
                  Przypomnij hasło
                </Link>
              </div>
              <Input
                id="login_password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link to="/rejestracja" className="text-primary hover:underline font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <Link to="/daty-choroby" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Kup jako gość
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logowanie;
