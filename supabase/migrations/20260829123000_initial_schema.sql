-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT UNIQUE NOT NULL,
    current_question INTEGER NOT NULL DEFAULT 1,
    completed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_number INTEGER UNIQUE NOT NULL CHECK (question_number >= 1 AND question_number <= 11),
    question_text TEXT NOT NULL,
    question_type TEXT,
    options JSONB,
    answer_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    submitted_answer TEXT,
    is_correct BOOLEAN,
    attempt_number INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Deny all by default to public (No policies means no access by default in Supabase)
-- We will only allow access via the service_role key in Edge Functions

-- Allow read access to teams table ONLY if they are completed, for the winners list
CREATE POLICY "Allow public read access to completed teams" ON public.teams
    FOR SELECT USING (completed = true);

-- We intentionally DO NOT create any public access policies for questions and submissions
-- to prevent answer hashes or attempt records from being leaked to the frontend.
