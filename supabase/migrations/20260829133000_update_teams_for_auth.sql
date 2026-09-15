ALTER TABLE public.teams ADD COLUMN team_code TEXT;
ALTER TABLE public.teams ADD COLUMN session_token UUID UNIQUE DEFAULT gen_random_uuid();
