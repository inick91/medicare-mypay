
-- Commission rates table
CREATE TABLE public.commission_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carrier TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  initial_amount NUMERIC NOT NULL DEFAULT 0,
  renewal_amount NUMERIC NOT NULL DEFAULT 0,
  non_commissionable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commissions table
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  carrier TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  plan_name TEXT,
  enrollment_date DATE NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth yet)
CREATE POLICY "Allow all access to commission_rates" ON public.commission_rates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to commissions" ON public.commissions FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_commission_rates_updated_at
  BEFORE UPDATE ON public.commission_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
