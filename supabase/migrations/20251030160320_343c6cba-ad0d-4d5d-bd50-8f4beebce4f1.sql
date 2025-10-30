-- Zaktualizuj funkcję handle_new_user aby uwzględniała date_of_birth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    pesel,
    date_of_birth,
    phone,
    street,
    house_no,
    flat_no,
    postcode,
    city,
    country,
    consent_terms,
    consent_employment,
    consent_call,
    consent_no_guarantee,
    consent_truth,
    consent_marketing_email,
    consent_marketing_tel
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'pesel',
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'street',
    NEW.raw_user_meta_data->>'house_no',
    NEW.raw_user_meta_data->>'flat_no',
    NEW.raw_user_meta_data->>'postcode',
    NEW.raw_user_meta_data->>'city',
    COALESCE(NEW.raw_user_meta_data->>'country', 'PL'),
    COALESCE((NEW.raw_user_meta_data->>'consent_terms')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_employment')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_call')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_no_guarantee')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_truth')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_marketing_email')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'consent_marketing_tel')::boolean, false)
  );
  RETURN NEW;
END;
$function$;