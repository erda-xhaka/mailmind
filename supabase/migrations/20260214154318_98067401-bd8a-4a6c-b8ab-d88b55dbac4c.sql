
-- Table to store Gmail refresh tokens securely (never exposed to frontend)
CREATE TABLE public.gmail_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  refresh_token text NOT NULL,
  access_token text,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Only edge functions with service role can access tokens
-- No client-side access allowed (tokens stay secure)
CREATE POLICY "No direct client access to gmail_tokens"
  ON public.gmail_tokens
  FOR ALL
  USING (false);
