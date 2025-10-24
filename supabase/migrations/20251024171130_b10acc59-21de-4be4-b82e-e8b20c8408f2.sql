-- Dodaj pole case_number do tabeli cases
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS case_number TEXT UNIQUE;

-- Dodaj funkcję do generowania unikalnego numeru sprawy
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generuj numer w formacie EZ-XXXXX
    new_number := 'EZ-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 9));
    
    -- Sprawdź, czy numer już istnieje
    SELECT EXISTS(SELECT 1 FROM cases WHERE case_number = new_number) INTO exists_check;
    
    -- Jeśli nie istnieje, zwróć go
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$;

-- Dodaj trigger do automatycznego generowania numeru sprawy
CREATE OR REPLACE FUNCTION public.set_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Utwórz trigger
DROP TRIGGER IF EXISTS set_case_number_trigger ON public.cases;
CREATE TRIGGER set_case_number_trigger
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_case_number();

-- Wypełnij istniejące sprawy numerami (jeśli są jakieś bez numeru)
UPDATE public.cases 
SET case_number = generate_case_number()
WHERE case_number IS NULL;

-- Dodaj indeks na case_number dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON public.cases(case_number);

-- Dodaj politykę RLS pozwalającą na publiczne sprawdzanie statusu po numerze sprawy
CREATE POLICY "Anyone can view case by number"
ON public.cases
FOR SELECT
USING (case_number IS NOT NULL);