-- ==========================================
-- Plans table (Free/Pro)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month', -- month, year
  features jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Default plans data
INSERT INTO public.plans (name, description, price, interval, features, limits, is_default)
VALUES 
  (
    'free', 
    'Free plan for small teams', 
    0, 
    'month',
    '{"users": 5, "branches": 2, "products": 100, "invoices": 50}',
    '{"max_users": 5, "max_branches": 2, "max_products": 100, "max_invoices_per_month": 50}',
    true
  ),
  (
    'pro', 
    'Pro plan for growing businesses', 
    29, 
    'month',
    '{"users": 25, "branches": 10, "products": 1000, "invoices": 500, "priority_support": true}',
    '{"max_users": 25, "max_branches": 10, "max_products": 1000, "max_invoices_per_month": 500}',
    false
  )
ON CONFLICT (name) DO NOTHING;
