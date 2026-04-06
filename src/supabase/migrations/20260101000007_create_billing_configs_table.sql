-- ==========================================
-- Billing Configs table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.billing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  
  -- Payment methods enabled
  payment_methods jsonb DEFAULT '{"cash": true, "transfer": true, "card": false}',
  
  -- Tax configuration
  tax_name text DEFAULT 'IVA',
  tax_rate numeric DEFAULT 19.00,
  tax_default boolean DEFAULT true,
  
  -- Invoice settings
  invoice_prefix text DEFAULT 'INV',
  invoice_series text,
  invoice_auto_number boolean DEFAULT true,
  invoice_next_number integer DEFAULT 1,
  
  -- Currency
  currency text DEFAULT 'COP',
  currency_symbol text DEFAULT '$',
  
  -- Notes
  default_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for company lookup
CREATE INDEX idx_billing_configs_company ON public.billing_configs(company_id);

-- Trigger for updated_at
CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON public.billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create billing config when company is created
CREATE OR REPLACE FUNCTION create_billing_config_for_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.billing_configs (company_id)
  VALUES (NEW.id)
  ON CONFLICT (company_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_billing_config
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION create_billing_config_for_company();
