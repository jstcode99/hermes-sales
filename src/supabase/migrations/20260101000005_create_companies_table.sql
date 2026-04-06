-- ==========================================
-- Companies table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  wildcard text NOT NULL, -- subdomain.wildcard.com
  logo_url text,
  logo_path text,
  email text,
  phone text,
  address text,
  
  -- Billing info
  billing_name text,
  billing_document text,
  billing_document_type text DEFAULT 'nit',
  billing_address text,
  billing_email text,
  billing_phone text,
  
  -- Plan
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  
  -- Metadata
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
);

-- Index for slug lookup
CREATE INDEX idx_companies_slug ON public.companies(slug);

-- Index for wildcard lookup
CREATE INDEX idx_companies_wildcard ON public.companies(wildcard);

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to generate slug from name if not provided
CREATE OR REPLACE FUNCTION generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-z0-9]', '-', 'gi'));
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    NEW.slug := trim(NEW.slug, '-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_company_slug
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION generate_company_slug();
