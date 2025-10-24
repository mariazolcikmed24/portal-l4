import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Walidacja sumy kontrolnej PESEL
const validatePesel = (pesel: string): boolean => {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = pesel.split('').slice(0, 10).reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(pesel[10]);
};

const registrationSchema = z.object({
  firstName: z.string().trim().min(1, "Imię jest wymagane").max(50, "Imię jest za długie"),
  lastName: z.string().trim().min(1, "Nazwisko jest wymagane").max(50, "Nazwisko jest za długie"),
  email: z.string().trim().email("Nieprawidłowy adres e-mail").max(254, "E-mail jest za długi"),
  pesel: z.string().refine(validatePesel, "Nieprawidłowy numer PESEL"),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Nieprawidłowy numer telefonu"),
  street: z.string().trim().min(1, "Ulica jest wymagana").max(100, "Ulica jest za długa"),
  houseNo: z.string().trim().min(1, "Nr domu jest wymagany").max(10, "Nr domu jest za długi"),
  flatNo: z.string().trim().max(10, "Nr mieszkania jest za długi").optional(),
  postcode: z.string().regex(/^\d{2}-\d{3}$/, "Nieprawidłowy kod pocztowy (format: XX-XXX)"),
  city: z.string().trim().min(1, "Miasto jest wymagane").max(85, "Miasto jest za długie"),
  country: z.string().min(1, "Państwo jest wymagane"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków").or(z.literal('')).optional(),
  consentTerms: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  consentEmployment: z.boolean().refine(val => val === true, "Potwierdzenie zatrudnienia jest wymagane"),
  consentCall: z.boolean().refine(val => val === true, "Zgoda na kontakt telefoniczny jest wymagana"),
  consentNoGuarantee: z.boolean().refine(val => val === true, "Musisz potwierdzić warunki e-konsultacji"),
  consentTruth: z.boolean().refine(val => val === true, "Musisz potwierdzić prawdziwość danych"),
  consentMarketingEmail: z.boolean().optional(),
  consentMarketingTel: z.boolean().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Rejestracja = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { user } = useAuth();
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      country: "PL",
      consentTerms: false,
      consentEmployment: false,
      consentCall: false,
      consentNoGuarantee: false,
      consentTruth: false,
      consentMarketingEmail: false,
      consentMarketingTel: false,
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isGuestMode) {
      navigate('/daty-choroby');
    }
  }, [user, isGuestMode, navigate]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      if (isGuestMode) {
        // Guest mode: Save profile without creating auth account
        const { error } = await supabase.from('profiles').insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          pesel: data.pesel,
          phone: data.phone,
          street: data.street,
          house_no: data.houseNo,
          flat_no: data.flatNo || null,
          postcode: data.postcode,
          city: data.city,
          country: data.country,
          consent_terms: data.consentTerms,
          consent_employment: data.consentEmployment,
          consent_call: data.consentCall,
          consent_no_guarantee: data.consentNoGuarantee,
          consent_truth: data.consentTruth,
          consent_marketing_email: data.consentMarketingEmail || false,
          consent_marketing_tel: data.consentMarketingTel || false,
          is_guest: true,
        });

        if (error) throw error;

        toast({
          title: "Dane zapisane",
          description: "Przejdź do formularza medycznego.",
        });
        navigate("/daty-choroby");
      } else {
        // Registration mode: Create auth account with profile
        if (!data.password) {
          toast({
            title: "Błąd",
            description: "Hasło jest wymagane do rejestracji.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              pesel: data.pesel,
              phone: data.phone,
              street: data.street,
              house_no: data.houseNo,
              flat_no: data.flatNo || null,
              postcode: data.postcode,
              city: data.city,
              country: data.country,
              consent_terms: data.consentTerms,
              consent_employment: data.consentEmployment,
              consent_call: data.consentCall,
              consent_no_guarantee: data.consentNoGuarantee,
              consent_truth: data.consentTruth,
              consent_marketing_email: data.consentMarketingEmail || false,
              consent_marketing_tel: data.consentMarketingTel || false,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Użytkownik już istnieje",
              description: "Ten adres e-mail jest już zarejestrowany. Zaloguj się.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Rejestracja pomyślna",
            description: "Przejdź do formularza medycznego.",
          });
          navigate("/daty-choroby");
        }
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił problem. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isGuestMode ? "Dane do e-ZLA" : "Rejestracja"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isGuestMode 
              ? "Wypełnij formularz, aby przejść do procesu uzyskania zwolnienia lekarskiego online" 
              : "Utwórz konto, aby rozpocząć proces uzyskania zwolnienia lekarskiego online"
            }
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dane osobowe */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Dane osobowe</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_first_name">Imię *</Label>
                  <Input
                    id="reg_first_name"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg_last_name">Nazwisko *</Label>
                  <Input
                    id="reg_last_name"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg_email">E-mail *</Label>
                <Input
                  id="reg_email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {!isGuestMode && (
                <div className="space-y-2">
                  <Label htmlFor="reg_password">Hasło *</Label>
                  <Input
                    id="reg_password"
                    type="password"
                    {...register("password")}
                    placeholder="Minimum 8 znaków"
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Hasło pozwoli Ci zalogować się w przyszłości i zarządzać swoimi zwolnieniami
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_pesel">PESEL *</Label>
                  <Input
                    id="reg_pesel"
                    {...register("pesel")}
                    maxLength={11}
                    placeholder="12345678901"
                    className={errors.pesel ? "border-destructive" : ""}
                  />
                  {errors.pesel && (
                    <p className="text-sm text-destructive">{errors.pesel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg_phone">Telefon *</Label>
                  <Input
                    id="reg_phone"
                    {...register("phone")}
                    placeholder="+48123456789"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Adres */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Adres zamieszkania</h2>
              
              <div className="space-y-2">
                <Label htmlFor="reg_street">Ulica *</Label>
                <Input
                  id="reg_street"
                  {...register("street")}
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="text-sm text-destructive">{errors.street.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_house_no">Nr domu *</Label>
                  <Input
                    id="reg_house_no"
                    {...register("houseNo")}
                    className={errors.houseNo ? "border-destructive" : ""}
                  />
                  {errors.houseNo && (
                    <p className="text-sm text-destructive">{errors.houseNo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg_flat_no">Nr mieszkania</Label>
                  <Input
                    id="reg_flat_no"
                    {...register("flatNo")}
                    className={errors.flatNo ? "border-destructive" : ""}
                  />
                  {errors.flatNo && (
                    <p className="text-sm text-destructive">{errors.flatNo.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_postcode">Kod pocztowy *</Label>
                  <Input
                    id="reg_postcode"
                    {...register("postcode")}
                    placeholder="00-000"
                    maxLength={6}
                    className={errors.postcode ? "border-destructive" : ""}
                  />
                  {errors.postcode && (
                    <p className="text-sm text-destructive">{errors.postcode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg_city">Miasto *</Label>
                  <Input
                    id="reg_city"
                    {...register("city")}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg_country">Państwo *</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="reg_country" className={errors.country ? "border-destructive" : ""}>
                        <SelectValue placeholder="Wybierz państwo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PL">Polska</SelectItem>
                        <SelectItem value="DE">Niemcy</SelectItem>
                        <SelectItem value="GB">Wielka Brytania</SelectItem>
                        <SelectItem value="US">Stany Zjednoczone</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Zgody */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Zgody i potwierdzenia</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="consent_terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={errors.consentTerms ? "border-destructive" : ""}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_terms" className="text-sm font-normal cursor-pointer">
                      Akceptuję <Link to="#" className="text-primary hover:underline">Regulamin</Link> i <Link to="#" className="text-primary hover:underline">Politykę prywatności</Link> *
                    </Label>
                    {errors.consentTerms && (
                      <p className="text-sm text-destructive">{errors.consentTerms.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentEmployment"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="consent_employment"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={errors.consentEmployment ? "border-destructive" : ""}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_employment" className="text-sm font-normal cursor-pointer">
                      Oświadczam, że jestem aktualnie zatrudniony/a u Pracodawcy wskazanego w ankiecie oraz przysługuje mi prawo do zasiłku chorobowego. *
                    </Label>
                    {errors.consentEmployment && (
                      <p className="text-sm text-destructive">{errors.consentEmployment.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentCall"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="consent_call"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={errors.consentCall ? "border-destructive" : ""}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_call" className="text-sm font-normal cursor-pointer">
                      Wyrażam zgodę na możliwy kontakt telefoniczny w celu weryfikacji danych medycznych *
                    </Label>
                    {errors.consentCall && (
                      <p className="text-sm text-destructive">{errors.consentCall.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentNoGuarantee"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="consent_no_guarantee"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={errors.consentNoGuarantee ? "border-destructive" : ""}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_no_guarantee" className="text-sm font-normal cursor-pointer">
                      Rozumiem, że e-konsultacja nie gwarantuje wystawienia e-ZLA; ostateczną decyzję podejmuje lekarz; data początkowa zwolnienia to data przeze mnie deklarowana *
                    </Label>
                    {errors.consentNoGuarantee && (
                      <p className="text-sm text-destructive">{errors.consentNoGuarantee.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentTruth"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="consent_truth"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={errors.consentTruth ? "border-destructive" : ""}
                      />
                    )}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent_truth" className="text-sm font-normal cursor-pointer">
                      Oświadczam, że nie zatajam żadnych istotnych informacji dotyczących mojego stanu zdrowia *
                    </Label>
                    {errors.consentTruth && (
                      <p className="text-sm text-destructive">{errors.consentTruth.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Zgody marketingowe (opcjonalne)</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Controller
                        name="consentMarketingEmail"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="consent_marketing_email"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="consent_marketing_email" className="text-sm font-normal cursor-pointer">
                        Wyrażam zgodę na otrzymywanie informacji marketingowych drogą elektroniczną
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Controller
                        name="consentMarketingTel"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="consent_marketing_tel"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="consent_marketing_tel" className="text-sm font-normal cursor-pointer">
                        Wyrażam zgodę na kontakt telefoniczny/SMS/MMS w celach marketingowych
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/" className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Anuluj
                </Button>
              </Link>
              <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isGuestMode ? "Zapisywanie..." : "Rejestracja...") 
                  : (isGuestMode ? "Zapisz i przejdź dalej" : "Zarejestruj się i przejdź dalej")
                }
              </Button>
            </div>
          </form>

          {!isGuestMode && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Masz już konto?{" "}
                <Link to="/logowanie" className="text-primary hover:underline font-medium">
                  Zaloguj się
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rejestracja;
