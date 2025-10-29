import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
  phonePrefix: z.string().min(1, "Prefiks jest wymagany"),
  phoneNumber: z.string().regex(/^\d{9,13}$/, "Nieprawidłowy numer telefonu (9-13 cyfr)"),
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

const phonePrefixes = [
  { country: "Polska", code: "+48", flag: "🇵🇱" },
  { country: "Afganistan", code: "+93", flag: "🇦🇫" },
  { country: "Albania", code: "+355", flag: "🇦🇱" },
  { country: "Algieria", code: "+213", flag: "🇩🇿" },
  { country: "Andora", code: "+376", flag: "🇦🇩" },
  { country: "Angola", code: "+244", flag: "🇦🇴" },
  { country: "Argentyna", code: "+54", flag: "🇦🇷" },
  { country: "Armenia", code: "+374", flag: "🇦🇲" },
  { country: "Australia", code: "+61", flag: "🇦🇺" },
  { country: "Austria", code: "+43", flag: "🇦🇹" },
  { country: "Azerbejdżan", code: "+994", flag: "🇦🇿" },
  { country: "Bahrajn", code: "+973", flag: "🇧🇭" },
  { country: "Bangladesz", code: "+880", flag: "🇧🇩" },
  { country: "Białoruś", code: "+375", flag: "🇧🇾" },
  { country: "Belgia", code: "+32", flag: "🇧🇪" },
  { country: "Belize", code: "+501", flag: "🇧🇿" },
  { country: "Benin", code: "+229", flag: "🇧🇯" },
  { country: "Bhutan", code: "+975", flag: "🇧🇹" },
  { country: "Boliwia", code: "+591", flag: "🇧🇴" },
  { country: "Bośnia i Hercegowina", code: "+387", flag: "🇧🇦" },
  { country: "Botswana", code: "+267", flag: "🇧🇼" },
  { country: "Brazylia", code: "+55", flag: "🇧🇷" },
  { country: "Brunei", code: "+673", flag: "🇧🇳" },
  { country: "Bułgaria", code: "+359", flag: "🇧🇬" },
  { country: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { country: "Burundi", code: "+257", flag: "🇧🇮" },
  { country: "Kambodża", code: "+855", flag: "🇰🇭" },
  { country: "Kamerun", code: "+237", flag: "🇨🇲" },
  { country: "Kanada", code: "+1", flag: "🇨🇦" },
  { country: "Republika Zielonego Przylądka", code: "+238", flag: "🇨🇻" },
  { country: "Republika Środkowoafrykańska", code: "+236", flag: "🇨🇫" },
  { country: "Czad", code: "+235", flag: "🇹🇩" },
  { country: "Chile", code: "+56", flag: "🇨🇱" },
  { country: "Chiny", code: "+86", flag: "🇨🇳" },
  { country: "Kolumbia", code: "+57", flag: "🇨🇴" },
  { country: "Komory", code: "+269", flag: "🇰🇲" },
  { country: "Kongo", code: "+242", flag: "🇨🇬" },
  { country: "Kostaryka", code: "+506", flag: "🇨🇷" },
  { country: "Chorwacja", code: "+385", flag: "🇭🇷" },
  { country: "Kuba", code: "+53", flag: "🇨🇺" },
  { country: "Cypr", code: "+357", flag: "🇨🇾" },
  { country: "Czechy", code: "+420", flag: "🇨🇿" },
  { country: "Dania", code: "+45", flag: "🇩🇰" },
  { country: "Dżibuti", code: "+253", flag: "🇩🇯" },
  { country: "Ekwador", code: "+593", flag: "🇪🇨" },
  { country: "Egipt", code: "+20", flag: "🇪🇬" },
  { country: "Salwador", code: "+503", flag: "🇸🇻" },
  { country: "Gwinea Równikowa", code: "+240", flag: "🇬🇶" },
  { country: "Erytrea", code: "+291", flag: "🇪🇷" },
  { country: "Estonia", code: "+372", flag: "🇪🇪" },
  { country: "Etiopia", code: "+251", flag: "🇪🇹" },
  { country: "Fidżi", code: "+679", flag: "🇫🇯" },
  { country: "Finlandia", code: "+358", flag: "🇫🇮" },
  { country: "Francja", code: "+33", flag: "🇫🇷" },
  { country: "Gabon", code: "+241", flag: "🇬🇦" },
  { country: "Gambia", code: "+220", flag: "🇬🇲" },
  { country: "Gruzja", code: "+995", flag: "🇬🇪" },
  { country: "Niemcy", code: "+49", flag: "🇩🇪" },
  { country: "Ghana", code: "+233", flag: "🇬🇭" },
  { country: "Grecja", code: "+30", flag: "🇬🇷" },
  { country: "Gwatemala", code: "+502", flag: "🇬🇹" },
  { country: "Gwinea", code: "+224", flag: "🇬🇳" },
  { country: "Gwinea Bissau", code: "+245", flag: "🇬🇼" },
  { country: "Gujana", code: "+592", flag: "🇬🇾" },
  { country: "Haiti", code: "+509", flag: "🇭🇹" },
  { country: "Honduras", code: "+504", flag: "🇭🇳" },
  { country: "Hongkong", code: "+852", flag: "🇭🇰" },
  { country: "Węgry", code: "+36", flag: "🇭🇺" },
  { country: "Islandia", code: "+354", flag: "🇮🇸" },
  { country: "Indie", code: "+91", flag: "🇮🇳" },
  { country: "Indonezja", code: "+62", flag: "🇮🇩" },
  { country: "Iran", code: "+98", flag: "🇮🇷" },
  { country: "Irak", code: "+964", flag: "🇮🇶" },
  { country: "Irlandia", code: "+353", flag: "🇮🇪" },
  { country: "Izrael", code: "+972", flag: "🇮🇱" },
  { country: "Włochy", code: "+39", flag: "🇮🇹" },
  { country: "Japonia", code: "+81", flag: "🇯🇵" },
  { country: "Jordania", code: "+962", flag: "🇯🇴" },
  { country: "Kazachstan", code: "+7", flag: "🇰🇿" },
  { country: "Kenia", code: "+254", flag: "🇰🇪" },
  { country: "Korea Południowa", code: "+82", flag: "🇰🇷" },
  { country: "Kuwejt", code: "+965", flag: "🇰🇼" },
  { country: "Kirgistan", code: "+996", flag: "🇰🇬" },
  { country: "Laos", code: "+856", flag: "🇱🇦" },
  { country: "Łotwa", code: "+371", flag: "🇱🇻" },
  { country: "Liban", code: "+961", flag: "🇱🇧" },
  { country: "Litwa", code: "+370", flag: "🇱🇹" },
  { country: "Luksemburg", code: "+352", flag: "🇱🇺" },
  { country: "Malezja", code: "+60", flag: "🇲🇾" },
  { country: "Meksyk", code: "+52", flag: "🇲🇽" },
  { country: "Maroko", code: "+212", flag: "🇲🇦" },
  { country: "Holandia", code: "+31", flag: "🇳🇱" },
  { country: "Nowa Zelandia", code: "+64", flag: "🇳🇿" },
  { country: "Norwegia", code: "+47", flag: "🇳🇴" },
  { country: "Pakistan", code: "+92", flag: "🇵🇰" },
  { country: "Filipiny", code: "+63", flag: "🇵🇭" },
  { country: "Portugalia", code: "+351", flag: "🇵🇹" },
  { country: "Katar", code: "+974", flag: "🇶🇦" },
  { country: "Rumunia", code: "+40", flag: "🇷🇴" },
  { country: "Rosja", code: "+7", flag: "🇷🇺" },
  { country: "Arabia Saudyjska", code: "+966", flag: "🇸🇦" },
  { country: "Singapur", code: "+65", flag: "🇸🇬" },
  { country: "Słowacja", code: "+421", flag: "🇸🇰" },
  { country: "Słowenia", code: "+386", flag: "🇸🇮" },
  { country: "Republika Południowej Afryki", code: "+27", flag: "🇿🇦" },
  { country: "Hiszpania", code: "+34", flag: "🇪🇸" },
  { country: "Szwecja", code: "+46", flag: "🇸🇪" },
  { country: "Szwajcaria", code: "+41", flag: "🇨🇭" },
  { country: "Tajwan", code: "+886", flag: "🇹🇼" },
  { country: "Tajlandia", code: "+66", flag: "🇹🇭" },
  { country: "Turcja", code: "+90", flag: "🇹🇷" },
  { country: "Ukraina", code: "+380", flag: "🇺🇦" },
  { country: "Zjednoczone Emiraty Arabskie", code: "+971", flag: "🇦🇪" },
  { country: "Wielka Brytania", code: "+44", flag: "🇬🇧" },
  { country: "Stany Zjednoczone", code: "+1", flag: "🇺🇸" },
  { country: "Wietnam", code: "+84", flag: "🇻🇳" },
];

const Rejestracja = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openPhonePrefix, setOpenPhonePrefix] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { user } = useAuth();
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      country: "PL",
      phonePrefix: "+48",
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
      const fullPhone = data.phonePrefix + data.phoneNumber;
      
      if (isGuestMode) {
        // Guest mode: Save profile without creating auth account
        const { error } = await supabase.from('profiles').insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          pesel: data.pesel,
          phone: fullPhone,
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
              phone: fullPhone,
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
                  <div className="flex gap-2">
                    <Controller
                      name="phonePrefix"
                      control={control}
                      render={({ field }) => (
                        <Popover open={openPhonePrefix} onOpenChange={setOpenPhonePrefix}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openPhonePrefix}
                              className={cn(
                                "w-[160px] justify-between",
                                errors.phonePrefix && "border-destructive"
                              )}
                            >
                              {field.value
                                ? phonePrefixes.find((prefix) => prefix.code === field.value)?.flag + " " + field.value
                                : "Wybierz prefiks"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Szukaj kraju..." />
                              <CommandList>
                                <CommandEmpty>Nie znaleziono kraju.</CommandEmpty>
                                <CommandGroup>
                                  {phonePrefixes.map((prefix) => (
                                    <CommandItem
                                      key={prefix.code + prefix.country}
                                      value={`${prefix.country} ${prefix.code}`}
                                      onSelect={() => {
                                        field.onChange(prefix.code);
                                        setOpenPhonePrefix(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === prefix.code ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="mr-2">{prefix.flag}</span>
                                      <span className="flex-1">{prefix.country}</span>
                                      <span className="text-muted-foreground">{prefix.code}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <Input
                      id="reg_phone"
                      {...register("phoneNumber")}
                      placeholder="123456789"
                      className={`flex-1 ${errors.phoneNumber ? "border-destructive" : ""}`}
                    />
                  </div>
                  {(errors.phonePrefix || errors.phoneNumber) && (
                    <p className="text-sm text-destructive">
                      {errors.phonePrefix?.message || errors.phoneNumber?.message}
                    </p>
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
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="PL">🇵🇱 Polska</SelectItem>
                        <SelectItem value="AF">🇦🇫 Afganistan</SelectItem>
                        <SelectItem value="AL">🇦🇱 Albania</SelectItem>
                        <SelectItem value="DZ">🇩🇿 Algieria</SelectItem>
                        <SelectItem value="AD">🇦🇩 Andora</SelectItem>
                        <SelectItem value="AO">🇦🇴 Angola</SelectItem>
                        <SelectItem value="AR">🇦🇷 Argentyna</SelectItem>
                        <SelectItem value="AM">🇦🇲 Armenia</SelectItem>
                        <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                        <SelectItem value="AT">🇦🇹 Austria</SelectItem>
                        <SelectItem value="AZ">🇦🇿 Azerbejdżan</SelectItem>
                        <SelectItem value="BH">🇧🇭 Bahrajn</SelectItem>
                        <SelectItem value="BD">🇧🇩 Bangladesz</SelectItem>
                        <SelectItem value="BY">🇧🇾 Białoruś</SelectItem>
                        <SelectItem value="BE">🇧🇪 Belgia</SelectItem>
                        <SelectItem value="BZ">🇧🇿 Belize</SelectItem>
                        <SelectItem value="BJ">🇧🇯 Benin</SelectItem>
                        <SelectItem value="BT">🇧🇹 Bhutan</SelectItem>
                        <SelectItem value="BO">🇧🇴 Boliwia</SelectItem>
                        <SelectItem value="BA">🇧🇦 Bośnia i Hercegowina</SelectItem>
                        <SelectItem value="BW">🇧🇼 Botswana</SelectItem>
                        <SelectItem value="BR">🇧🇷 Brazylia</SelectItem>
                        <SelectItem value="BN">🇧🇳 Brunei</SelectItem>
                        <SelectItem value="BG">🇧🇬 Bułgaria</SelectItem>
                        <SelectItem value="BF">🇧🇫 Burkina Faso</SelectItem>
                        <SelectItem value="BI">🇧🇮 Burundi</SelectItem>
                        <SelectItem value="KH">🇰🇭 Kambodża</SelectItem>
                        <SelectItem value="CM">🇨🇲 Kamerun</SelectItem>
                        <SelectItem value="CA">🇨🇦 Kanada</SelectItem>
                        <SelectItem value="CV">🇨🇻 Republika Zielonego Przylądka</SelectItem>
                        <SelectItem value="CF">🇨🇫 Republika Środkowoafrykańska</SelectItem>
                        <SelectItem value="TD">🇹🇩 Czad</SelectItem>
                        <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                        <SelectItem value="CN">🇨🇳 Chiny</SelectItem>
                        <SelectItem value="CO">🇨🇴 Kolumbia</SelectItem>
                        <SelectItem value="KM">🇰🇲 Komory</SelectItem>
                        <SelectItem value="CG">🇨🇬 Kongo</SelectItem>
                        <SelectItem value="CR">🇨🇷 Kostaryka</SelectItem>
                        <SelectItem value="HR">🇭🇷 Chorwacja</SelectItem>
                        <SelectItem value="CU">🇨🇺 Kuba</SelectItem>
                        <SelectItem value="CY">🇨🇾 Cypr</SelectItem>
                        <SelectItem value="CZ">🇨🇿 Czechy</SelectItem>
                        <SelectItem value="DK">🇩🇰 Dania</SelectItem>
                        <SelectItem value="DJ">🇩🇯 Dżibuti</SelectItem>
                        <SelectItem value="EC">🇪🇨 Ekwador</SelectItem>
                        <SelectItem value="EG">🇪🇬 Egipt</SelectItem>
                        <SelectItem value="SV">🇸🇻 Salwador</SelectItem>
                        <SelectItem value="GQ">🇬🇶 Gwinea Równikowa</SelectItem>
                        <SelectItem value="ER">🇪🇷 Erytrea</SelectItem>
                        <SelectItem value="EE">🇪🇪 Estonia</SelectItem>
                        <SelectItem value="ET">🇪🇹 Etiopia</SelectItem>
                        <SelectItem value="FJ">🇫🇯 Fidżi</SelectItem>
                        <SelectItem value="FI">🇫🇮 Finlandia</SelectItem>
                        <SelectItem value="FR">🇫🇷 Francja</SelectItem>
                        <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                        <SelectItem value="GM">🇬🇲 Gambia</SelectItem>
                        <SelectItem value="GE">🇬🇪 Gruzja</SelectItem>
                        <SelectItem value="DE">🇩🇪 Niemcy</SelectItem>
                        <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                        <SelectItem value="GR">🇬🇷 Grecja</SelectItem>
                        <SelectItem value="GT">🇬🇹 Gwatemala</SelectItem>
                        <SelectItem value="GN">🇬🇳 Gwinea</SelectItem>
                        <SelectItem value="GW">🇬🇼 Gwinea Bissau</SelectItem>
                        <SelectItem value="GY">🇬🇾 Gujana</SelectItem>
                        <SelectItem value="HT">🇭🇹 Haiti</SelectItem>
                        <SelectItem value="HN">🇭🇳 Honduras</SelectItem>
                        <SelectItem value="HK">🇭🇰 Hongkong</SelectItem>
                        <SelectItem value="HU">🇭🇺 Węgry</SelectItem>
                        <SelectItem value="IS">🇮🇸 Islandia</SelectItem>
                        <SelectItem value="IN">🇮🇳 Indie</SelectItem>
                        <SelectItem value="ID">🇮🇩 Indonezja</SelectItem>
                        <SelectItem value="IR">🇮🇷 Iran</SelectItem>
                        <SelectItem value="IQ">🇮🇶 Irak</SelectItem>
                        <SelectItem value="IE">🇮🇪 Irlandia</SelectItem>
                        <SelectItem value="IL">🇮🇱 Izrael</SelectItem>
                        <SelectItem value="IT">🇮🇹 Włochy</SelectItem>
                        <SelectItem value="JP">🇯🇵 Japonia</SelectItem>
                        <SelectItem value="JO">🇯🇴 Jordania</SelectItem>
                        <SelectItem value="KZ">🇰🇿 Kazachstan</SelectItem>
                        <SelectItem value="KE">🇰🇪 Kenia</SelectItem>
                        <SelectItem value="KR">🇰🇷 Korea Południowa</SelectItem>
                        <SelectItem value="KW">🇰🇼 Kuwejt</SelectItem>
                        <SelectItem value="KG">🇰🇬 Kirgistan</SelectItem>
                        <SelectItem value="LA">🇱🇦 Laos</SelectItem>
                        <SelectItem value="LV">🇱🇻 Łotwa</SelectItem>
                        <SelectItem value="LB">🇱🇧 Liban</SelectItem>
                        <SelectItem value="LT">🇱🇹 Litwa</SelectItem>
                        <SelectItem value="LU">🇱🇺 Luksemburg</SelectItem>
                        <SelectItem value="MY">🇲🇾 Malezja</SelectItem>
                        <SelectItem value="MX">🇲🇽 Meksyk</SelectItem>
                        <SelectItem value="MA">🇲🇦 Maroko</SelectItem>
                        <SelectItem value="NL">🇳🇱 Holandia</SelectItem>
                        <SelectItem value="NZ">🇳🇿 Nowa Zelandia</SelectItem>
                        <SelectItem value="NO">🇳🇴 Norwegia</SelectItem>
                        <SelectItem value="PK">🇵🇰 Pakistan</SelectItem>
                        <SelectItem value="PH">🇵🇭 Filipiny</SelectItem>
                        <SelectItem value="PT">🇵🇹 Portugalia</SelectItem>
                        <SelectItem value="QA">🇶🇦 Katar</SelectItem>
                        <SelectItem value="RO">🇷🇴 Rumunia</SelectItem>
                        <SelectItem value="RU">🇷🇺 Rosja</SelectItem>
                        <SelectItem value="SA">🇸🇦 Arabia Saudyjska</SelectItem>
                        <SelectItem value="SG">🇸🇬 Singapur</SelectItem>
                        <SelectItem value="SK">🇸🇰 Słowacja</SelectItem>
                        <SelectItem value="SI">🇸🇮 Słowenia</SelectItem>
                        <SelectItem value="ZA">🇿🇦 Republika Południowej Afryki</SelectItem>
                        <SelectItem value="ES">🇪🇸 Hiszpania</SelectItem>
                        <SelectItem value="SE">🇸🇪 Szwecja</SelectItem>
                        <SelectItem value="CH">🇨🇭 Szwajcaria</SelectItem>
                        <SelectItem value="TW">🇹🇼 Tajwan</SelectItem>
                        <SelectItem value="TH">🇹🇭 Tajlandia</SelectItem>
                        <SelectItem value="TR">🇹🇷 Turcja</SelectItem>
                        <SelectItem value="UA">🇺🇦 Ukraina</SelectItem>
                        <SelectItem value="AE">🇦🇪 Zjednoczone Emiraty Arabskie</SelectItem>
                        <SelectItem value="GB">🇬🇧 Wielka Brytania</SelectItem>
                        <SelectItem value="US">🇺🇸 Stany Zjednoczone</SelectItem>
                        <SelectItem value="VN">🇻🇳 Wietnam</SelectItem>
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
                      Oświadczam, że przyjmuję do wiadomości, iż lekarz może skontaktować się ze mną telefonicznie w celu pogłębienia wywiadu medycznego. *
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
                      Rozumiem i akceptuję, że wykupienie e-konsultacji nie gwarantuje wystawienia wnioskowanego e-ZLA. Diagnoza oraz decyzja o zasadności i długości e-ZLA należą wyłącznie do lekarza, który podejmuje je na podstawie przekazanych przeze mnie informacji i objawów. Data początkowa zwolnienia jest deklarowaną przeze mnie datą nieobecności w pracy. *
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
