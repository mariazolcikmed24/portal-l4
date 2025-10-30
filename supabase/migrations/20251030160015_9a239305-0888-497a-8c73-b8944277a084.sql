-- Dodaj datę urodzenia do profilu (wymagane przez Med24 API)
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth DATE;

COMMENT ON COLUMN public.profiles.date_of_birth IS 'Data urodzenia użytkownika - wymagana przez Med24 API';