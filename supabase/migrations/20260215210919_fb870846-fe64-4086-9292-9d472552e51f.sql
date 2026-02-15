
ALTER TABLE public.ai_replies ADD COLUMN IF NOT EXISTS to_email text;
ALTER TABLE public.ai_replies ADD COLUMN IF NOT EXISTS subject text;
