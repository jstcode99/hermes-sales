-- ==========================================
-- Branches table (multiple branches per company)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  address text,
  phone text,
  email text,
  is_active boolean DEFAULT true,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_company_slug UNIQUE (company_id, slug)
);

-- Index for company lookups
CREATE INDEX idx_branches_company ON public.branches(company_id);

-- Index for slug within company
CREATE INDEX idx_branches_company_slug ON public.branches(company_id, slug);

-- Trigger for updated_at
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one main branch per company
CREATE OR REPLACE FUNCTION enforce_single_main_branch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_main = true THEN
    UPDATE public.branches 
    SET is_main = false 
    WHERE company_id = NEW.company_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_main_branch_trigger
  BEFORE INSERT OR UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_main_branch();
