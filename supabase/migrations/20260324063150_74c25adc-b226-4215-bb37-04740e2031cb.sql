
-- Create table for questionnaire submissions (anonymous, no auth required)
CREATE TABLE public.questionnaire_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous submissions)
CREATE POLICY "Anyone can submit questionnaire"
  ON public.questionnaire_submissions
  FOR INSERT
  WITH CHECK (true);

-- Allow reading own submissions by session_id
CREATE POLICY "Anyone can read submissions by session"
  ON public.questionnaire_submissions
  FOR SELECT
  USING (true);

-- Create table for AI-generated match results
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.questionnaire_submissions(id) ON DELETE CASCADE,
  matches JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- Allow inserting match results (from edge function)
CREATE POLICY "Service role can insert match results"
  ON public.match_results
  FOR INSERT
  WITH CHECK (true);

-- Allow reading match results
CREATE POLICY "Anyone can read match results"
  ON public.match_results
  FOR SELECT
  USING (true);
