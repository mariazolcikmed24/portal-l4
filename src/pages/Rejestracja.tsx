import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

// PESEL validation
const validatePesel = (pesel: string): boolean => {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = pesel.split('').slice(0, 10).reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(pesel[10]);
};

// Extract date of birth from PESEL
const extractDateOfBirthFromPesel = (pesel: string): string => {
  const year = parseInt(pesel.substring(0, 2));
  const month = parseInt(pesel.substring(2, 4));
  const day = parseInt(pesel.substring(4, 6));
  
  let fullYear: number;
  let realMonth: number;
  
  if (month >= 1 && month <= 12) {
    fullYear = 1900 + year;
    realMonth = month;
  } else if (month >= 21 && month <= 32) {
    fullYear = 2000 + year;
    realMonth = month - 20;
  } else if (month >= 41 && month <= 52) {
    fullYear = 2100 + year;
    realMonth = month - 40;
  } else if (month >= 61 && month <= 72) {
    fullYear = 2200 + year;
    realMonth = month - 60;
  } else if (month >= 81 && month <= 92) {
    fullYear = 1800 + year;
    realMonth = month - 80;
  } else {
    fullYear = 1900 + year;
    realMonth = month;
  }
  
  return `${fullYear}-${String(realMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const phonePrefixes = [
  { country: "Polska", code: "+48", flag: "🇵🇱" },
  { country: "Niemcy", code: "+49", flag: "🇩🇪" },
  { country: "Wielka Brytania", code: "+44", flag: "🇬🇧" },
  { country: "Francja", code: "+33", flag: "🇫🇷" },
  { country: "Włochy", code: "+39", flag: "🇮🇹" },
  { country: "Hiszpania", code: "+34", flag: "🇪🇸" },
  { country: "Holandia", code: "+31", flag: "🇳🇱" },
  { country: "Belgia", code: "+32", flag: "🇧🇪" },
  { country: "Austria", code: "+43", flag: "🇦🇹" },
  { country: "Szwajcaria", code: "+41", flag: "🇨🇭" },
  { country: "Czechy", code: "+420", flag: "🇨🇿" },
  { country: "Norwegia", code: "+47", flag: "🇳🇴" },
  { country: "Szwecja", code: "+46", flag: "🇸🇪" },
  { country: "Dania", code: "+45", flag: "🇩🇰" },
  { country: "USA", code: "+1", flag: "🇺🇸" },
];

const countries = [
  { code: "PL", name: "Polska", flag: "🇵🇱" },
  { code: "DE", name: "Niemcy", flag: "🇩🇪" },
  { code: "GB", name: "Wielka Brytania", flag: "🇬🇧" },
  { code: "FR", name: "Francja", flag: "🇫🇷" },
  { code: "IT", name: "Włochy", flag: "🇮🇹" },
  { code: "ES", name: "Hiszpania", flag: "🇪🇸" },
  { code: "NL", name: "Holandia", flag: "🇳🇱" },
  { code: "BE", name: "Belgia", flag: "🇧🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "CH", name: "Szwajcaria", flag: "🇨🇭" },
  { code: "CZ", name: "Czechy", flag: "🇨🇿" },
  { code: "NO", name: "Norwegia", flag: "🇳🇴" },
  { code: "SE", name: "Szwecja", flag: "🇸🇪" },
  { code: "DK", name: "Dania", flag: "🇩🇰" },
  { code: "US", name: "USA", flag: "🇺🇸" },
];

const Rejestracja = () => {
  const { t } = useTranslation(['forms', 'validation']);
  const { navigateToLocalized, getLocalizedPath } = useLanguageNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openPhonePrefix, setOpenPhonePrefix] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { user } = useAuth();

  const registrationSchema = useMemo(() => z.object({
    firstName: z.string().trim().min(1, t('validation:firstName.required')).max(50),
    lastName: z.string().trim().min(1, t('validation:lastName.required')).max(50),
    email: z.string().trim().email(t('validation:email.invalid')).max(254),
    pesel: z.string().refine(validatePesel, t('validation:pesel.invalid')),
    phonePrefix: z.string().min(1, t('validation:required')),
    phoneNumber: z.string().regex(/^\d{9,13}$/, t('validation:phone.invalid')),
    street: z.string().trim().min(1, t('validation:street.required')).max(100),
    houseNo: z.string().trim().min(1, t('validation:houseNo.required')).max(10),
    flatNo: z.string().trim().max(10).optional(),
    postcode: z.string().regex(/^\d{2}-\d{3}$/, t('validation:postcode.invalid')),
    city: z.string().trim().min(1, t('validation:city.required')).max(85),
    country: z.string().min(1, t('validation:required')),
    password: z.string().min(8, t('validation:required')).or(z.literal('')).optional(),
    consentTerms: z.boolean().refine(val => val === true, t('validation:consent.terms')),
    consentEmployment: z.boolean().refine(val => val === true, t('validation:required')),
    consentCall: z.boolean().refine(val => val === true, t('validation:required')),
    consentNoGuarantee: z.boolean().refine(val => val === true, t('validation:consent.noGuarantee')),
    consentTruth: z.boolean().refine(val => val === true, t('validation:consent.truth')),
    consentMarketingEmail: z.boolean().optional(),
    consentMarketingTel: z.boolean().optional(),
  }), [t]);

  type RegistrationFormData = z.infer<typeof registrationSchema>;
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<RegistrationFormData>({
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

  const allConsents = watch([
    'consentTerms',
    'consentEmployment', 
    'consentCall',
    'consentNoGuarantee',
    'consentTruth',
    'consentMarketingEmail',
    'consentMarketingTel'
  ]);

  const allChecked = allConsents.every(consent => consent === true);

  const handleSelectAll = (checked: boolean) => {
    setValue('consentTerms', checked);
    setValue('consentEmployment', checked);
    setValue('consentCall', checked);
    setValue('consentNoGuarantee', checked);
    setValue('consentTruth', checked);
    setValue('consentMarketingEmail', checked);
    setValue('consentMarketingTel', checked);
  };

  useEffect(() => {
    if (user && !isGuestMode) {
      navigateToLocalized('/daty-choroby');
    }
  }, [user, isGuestMode, navigateToLocalized]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const fullPhone = data.phonePrefix + data.phoneNumber;
      
      if (isGuestMode) {
        const { error } = await supabase.from('profiles').insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          pesel: data.pesel,
          date_of_birth: extractDateOfBirthFromPesel(data.pesel),
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
          title: t('forms:common.dataSaved'),
          description: t('forms:common.next'),
        });
        navigateToLocalized('/daty-choroby');
      } else {
        if (!data.password) {
          toast({
            title: t('validation:required'),
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
              date_of_birth: extractDateOfBirthFromPesel(data.pesel),
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
          throw error;
        } else {
          toast({
            title: t('forms:common.dataSaved'),
          });
          navigateToLocalized('/daty-choroby');
        }
      }
    } catch (error: any) {
      toast({
        title: error.message || t('validation:required'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full">
        <Link to={getLocalizedPath('/')} className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('forms:common.back')}
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isGuestMode ? t('forms:registration.titleGuest') : t('forms:registration.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isGuestMode ? t('forms:registration.subtitleGuest') : t('forms:registration.subtitle')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Data */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('forms:registration.personalData')}</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_first_name">{t('forms:registration.firstName')} *</Label>
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
                  <Label htmlFor="reg_last_name">{t('forms:registration.lastName')} *</Label>
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
                <Label htmlFor="reg_email">{t('forms:registration.email')} *</Label>
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
                  <Label htmlFor="reg_password">{t('forms:registration.password')} *</Label>
                  <Input
                    id="reg_password"
                    type="password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reg_pesel">{t('forms:registration.pesel')} *</Label>
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

              <div className="grid md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_phone">{t('forms:registration.phone')} *</Label>
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
                                : t('forms:registration.phonePrefix')}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder={t('forms:registration.searchCountry')} />
                              <CommandList>
                                <CommandEmpty>{t('forms:registration.noCountryFound')}</CommandEmpty>
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

            {/* Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('forms:registration.address')}</h2>
              
              <div className="space-y-2">
                <Label htmlFor="reg_street">{t('forms:registration.street')} *</Label>
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
                  <Label htmlFor="reg_house_no">{t('forms:registration.houseNo')} *</Label>
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
                  <Label htmlFor="reg_flat_no">{t('forms:registration.flatNo')}</Label>
                  <Input
                    id="reg_flat_no"
                    {...register("flatNo")}
                    className={errors.flatNo ? "border-destructive" : ""}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_postcode">{t('forms:registration.postcode')} *</Label>
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
                  <Label htmlFor="reg_city">{t('forms:registration.city')} *</Label>
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
                <Label htmlFor="reg_country">{t('forms:registration.country')} *</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openCountry} onOpenChange={setOpenCountry}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCountry}
                          className={cn(
                            "w-full justify-between",
                            errors.country && "border-destructive"
                          )}
                        >
                          {field.value
                            ? countries.find((country) => country.code === field.value)?.flag + " " + countries.find((country) => country.code === field.value)?.name
                            : t('forms:registration.country')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder={t('forms:registration.searchCountry')} />
                          <CommandList>
                            <CommandEmpty>{t('forms:registration.noCountryFound')}</CommandEmpty>
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  value={`${country.name} ${country.code}`}
                                  onSelect={() => {
                                    field.onChange(country.code);
                                    setOpenCountry(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === country.code ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="mr-2">{country.flag}</span>
                                  <span>{country.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Consents */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('forms:registration.consents')}</h2>
              
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
                      {t('forms:registration.consentTerms')} *
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
                      {t('forms:registration.consentEmployment')} *
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
                      {t('forms:registration.consentCall')} *
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
                      {t('forms:registration.consentNoGuarantee')} *
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
                      {t('forms:registration.consentTruth')} *
                    </Label>
                    {errors.consentTruth && (
                      <p className="text-sm text-destructive">{errors.consentTruth.message}</p>
                    )}
                  </div>
                </div>

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
                    {t('forms:registration.consentMarketingEmail')}
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
                    {t('forms:registration.consentMarketingTel')}
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <Link to={getLocalizedPath('/')} className="sm:flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  {t('forms:common.cancel')}
                </Button>
              </Link>
              <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={isSubmitting}>
                {isSubmitting 
                  ? t('forms:registration.processing')
                  : (isGuestMode ? t('forms:registration.continueAsGuest') : t('forms:registration.createAccount'))
                }
              </Button>
            </div>
          </form>

          {!isGuestMode && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('forms:registration.alreadyHaveAccount')}{" "}
                <Link to={getLocalizedPath('/logowanie')} className="text-primary hover:underline font-medium">
                  {t('forms:registration.login')}
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