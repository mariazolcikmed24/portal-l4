-- Change attachment_file_ids from UUID[] to TEXT[] to store file paths
ALTER TABLE public.cases 
ALTER COLUMN attachment_file_ids TYPE TEXT[] 
USING attachment_file_ids::TEXT[];

-- Also change other file columns if needed
ALTER TABLE public.cases 
ALTER COLUMN pregnancy_card_file_id TYPE TEXT 
USING pregnancy_card_file_id::TEXT;

ALTER TABLE public.cases 
ALTER COLUMN long_leave_docs_file_id TYPE TEXT 
USING long_leave_docs_file_id::TEXT;