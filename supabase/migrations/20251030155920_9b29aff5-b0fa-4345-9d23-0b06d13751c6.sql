-- Dodaj pola do integracji z Med24 API
ALTER TABLE public.cases 
ADD COLUMN med24_visit_id UUID,
ADD COLUMN med24_visit_status JSONB DEFAULT '{"is_booking_finalized": false, "is_cancelled": false, "is_resolved": false}'::jsonb,
ADD COLUMN med24_external_tag TEXT,
ADD COLUMN med24_channel_kind TEXT DEFAULT 'text_message' CHECK (med24_channel_kind IN ('video_call', 'text_message', 'phone_call')),
ADD COLUMN med24_service_id UUID,
ADD COLUMN med24_booking_intent TEXT DEFAULT 'finalize' CHECK (med24_booking_intent IN ('reserve', 'finalize')),
ADD COLUMN med24_last_sync_at TIMESTAMP WITH TIME ZONE;

-- Dodaj komentarze do dokumentacji
COMMENT ON COLUMN public.cases.med24_visit_id IS 'ID wizyty w systemie Med24';
COMMENT ON COLUMN public.cases.med24_visit_status IS 'Status wizyty z Med24: {is_booking_finalized, is_cancelled, is_resolved}';
COMMENT ON COLUMN public.cases.med24_external_tag IS 'Tag zewnętrzny do identyfikacji w Med24';
COMMENT ON COLUMN public.cases.med24_channel_kind IS 'Typ komunikacji: video_call, text_message, phone_call';
COMMENT ON COLUMN public.cases.med24_service_id IS 'ID usługi w Med24';
COMMENT ON COLUMN public.cases.med24_booking_intent IS 'Intent rezerwacji: reserve lub finalize';
COMMENT ON COLUMN public.cases.med24_last_sync_at IS 'Ostatnia synchronizacja statusu z Med24';