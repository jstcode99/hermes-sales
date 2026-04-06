-- ==========================================
-- Subscriptions table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  
  -- Subscription details
  status text NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  canceled_at timestamptz,
  
  -- Payment info
  stripe_subscription_id text,
  stripe_customer_id text,
  last_payment_date timestamptz,
  last_payment_status text,
  
  -- Trial
  is_trial boolean DEFAULT false,
  trial_end_date timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
);

-- Index for company lookup
CREATE INDEX idx_subscriptions_company ON public.subscriptions(company_id);

-- Index for status lookups
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Index for plan lookup
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one active subscription per company
CREATE OR REPLACE FUNCTION enforce_single_active_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.subscriptions 
    SET status = 'canceled', canceled_at = now()
    WHERE company_id = NEW.company_id AND id != NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_active_subscription_trigger
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_subscription();
