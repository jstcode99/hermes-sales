-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "invitations_select"
  ON public.invitations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "invitations_insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "invitations_update"
  ON public.invitations FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "invitations_delete"
  ON public.invitations FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Index for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_company ON public.invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
