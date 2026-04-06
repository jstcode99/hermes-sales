-- ==========================================
-- RLS Policies for multi-tenant tables
-- ==========================================

-- ==========================================
-- RLS: Plans (public read)
-- ==========================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on plans"
  ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ==========================================
-- RLS: Companies
-- ==========================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow public read of company info (slug, name only)
CREATE POLICY "Allow public read on companies"
  ON public.companies
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow authenticated users to create companies
CREATE POLICY "Allow authenticated create companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow company owners to update
CREATE POLICY "Allow company owner update"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );

-- ==========================================
-- RLS: Branches
-- ==========================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Allow company members to read branches
CREATE POLICY "Allow company members read branches"
  ON public.branches
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow company admins to insert/update
CREATE POLICY "Allow company admins manage branches"
  ON public.branches
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- ==========================================
-- RLS: Billing Configs
-- ==========================================

ALTER TABLE public.billing_configs ENABLE ROW LEVEL SECURITY;

-- Allow company members to read billing config
CREATE POLICY "Allow company members read billing"
  ON public.billing_configs
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow company owners/admins to update billing config
CREATE POLICY "Allow company admins update billing"
  ON public.billing_configs
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

-- ==========================================
-- RLS: Subscriptions
-- ==========================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow company owners to manage subscriptions
CREATE POLICY "Allow company owners manage subscriptions"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );

-- ==========================================
-- RLS: Company Users
-- ==========================================

ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Allow public read for invitations (join company)
CREATE POLICY "Allow public read company_users"
  ON public.company_users
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow company owners to invite users
CREATE POLICY "Allow company owners invite users"
  ON public.company_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );

-- Allow users to update their own membership
CREATE POLICY "Allow users update own membership"
  ON public.company_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow company owners to manage members
CREATE POLICY "Allow company owners manage members"
  ON public.company_users
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
    )
  );
