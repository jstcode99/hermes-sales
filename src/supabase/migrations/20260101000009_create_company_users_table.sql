-- ==========================================
-- Company Users table (many-to-many users to companies)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  
  -- Role within company
  role text NOT NULL DEFAULT 'member', -- owner, admin, member, seller, viewer
  is_active boolean DEFAULT true,
  
  -- Invitation
  invited_by uuid,
  invited_at timestamptz,
  accepted_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_user_company UNIQUE (user_id, company_id)
);

-- Index for user lookups
CREATE INDEX idx_company_users_user ON public.company_users(user_id);

-- Index for company lookups
CREATE INDEX idx_company_users_company ON public.company_users(company_id);

-- Index for branch lookups
CREATE INDEX idx_company_users_branch ON public.company_users(branch_id);

-- Index for role lookups
CREATE INDEX idx_company_users_role ON public.company_users(role);

-- Trigger for updated_at
CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON public.company_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
