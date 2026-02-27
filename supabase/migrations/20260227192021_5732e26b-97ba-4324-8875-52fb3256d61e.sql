-- Add user_id column to commissions
ALTER TABLE public.commissions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to commission_rates
ALTER TABLE public.commission_rates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;

-- RLS policies for commissions
CREATE POLICY "Users can view their own commissions"
ON public.commissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commissions"
ON public.commissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commissions"
ON public.commissions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commissions"
ON public.commissions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for commission_rates
CREATE POLICY "Users can view their own rates"
ON public.commission_rates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rates"
ON public.commission_rates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rates"
ON public.commission_rates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rates"
ON public.commission_rates FOR DELETE USING (auth.uid() = user_id);