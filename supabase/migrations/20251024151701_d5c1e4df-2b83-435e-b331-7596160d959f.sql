-- Create profiles table for patient data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL CHECK (length(first_name) <= 50),
  last_name TEXT NOT NULL CHECK (length(last_name) <= 50),
  email TEXT NOT NULL CHECK (length(email) <= 254),
  pesel TEXT NOT NULL CHECK (length(pesel) = 11),
  phone TEXT NOT NULL CHECK (length(phone) <= 15),
  street TEXT NOT NULL CHECK (length(street) <= 100),
  house_no TEXT NOT NULL CHECK (length(house_no) <= 10),
  flat_no TEXT CHECK (length(flat_no) <= 10),
  postcode TEXT NOT NULL CHECK (length(postcode) = 6),
  city TEXT NOT NULL CHECK (length(city) <= 85),
  country TEXT NOT NULL DEFAULT 'PL',
  consent_terms BOOLEAN NOT NULL DEFAULT false,
  consent_employment BOOLEAN NOT NULL DEFAULT false,
  consent_call BOOLEAN NOT NULL DEFAULT false,
  consent_no_guarantee BOOLEAN NOT NULL DEFAULT false,
  consent_truth BOOLEAN NOT NULL DEFAULT false,
  consent_marketing_email BOOLEAN DEFAULT false,
  consent_marketing_tel BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_ip TEXT,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enum types for cases
CREATE TYPE recipient_type AS ENUM ('pl_employer', 'uniformed', 'student', 'foreign_employer', 'care');
CREATE TYPE symptom_duration AS ENUM ('today', 'yesterday', '2_3', '4_5', 'gt_5');
CREATE TYPE main_category AS ENUM ('cold_pain', 'gastro', 'bladder', 'injury', 'menstruation', 'back_pain', 'eye', 'migraine', 'acute_stress', 'psych');
CREATE TYPE case_status AS ENUM ('draft', 'submitted', 'in_review', 'completed', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'fail');

-- Create cases table for e-ZLA applications
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Illness dates
  illness_start DATE NOT NULL,
  illness_end DATE NOT NULL,
  late_justification TEXT CHECK (length(late_justification) <= 500),
  
  -- Recipient type and details
  recipient_type recipient_type NOT NULL,
  employers JSONB DEFAULT '[]'::jsonb,
  uniformed_service_name TEXT CHECK (length(uniformed_service_name) <= 100),
  uniformed_nip TEXT CHECK (length(uniformed_nip) = 10),
  care_first_name TEXT CHECK (length(care_first_name) <= 50),
  care_last_name TEXT CHECK (length(care_last_name) <= 50),
  care_pesel TEXT CHECK (length(care_pesel) = 11),
  
  -- Medical questionnaire - general
  pregnant BOOLEAN DEFAULT false,
  pregnancy_leave BOOLEAN DEFAULT false,
  pregnancy_card_file_id UUID,
  chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  chronic_other TEXT CHECK (length(chronic_other) <= 200),
  has_allergy BOOLEAN DEFAULT false,
  allergy_text TEXT CHECK (length(allergy_text) <= 500),
  has_meds BOOLEAN DEFAULT false,
  meds_list TEXT CHECK (length(meds_list) <= 500),
  long_leave BOOLEAN DEFAULT false,
  long_leave_docs_file_id UUID,
  
  -- Medical questionnaire - symptoms
  main_category main_category NOT NULL,
  symptom_duration symptom_duration NOT NULL,
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  free_text_reason TEXT NOT NULL CHECK (length(free_text_reason) <= 1500),
  attachment_file_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Payment
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_psp_ref TEXT,
  
  -- Status
  status case_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own profile or guest profiles
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND is_guest = true));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for cases
-- Users can view their own cases
CREATE POLICY "Users can view own cases"
  ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = cases.profile_id
      AND (profiles.user_id = auth.uid() OR profiles.user_id IS NULL)
    )
  );

-- Users can insert their own cases
CREATE POLICY "Users can insert own cases"
  ON public.cases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = cases.profile_id
      AND (profiles.user_id = auth.uid() OR profiles.user_id IS NULL)
    )
  );

-- Users can update their own cases
CREATE POLICY "Users can update own cases"
  ON public.cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = cases.profile_id
      AND (profiles.user_id = auth.uid() OR profiles.user_id IS NULL)
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    pesel,
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
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_pesel ON public.profiles(pesel);
CREATE INDEX idx_cases_profile_id ON public.cases(profile_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);