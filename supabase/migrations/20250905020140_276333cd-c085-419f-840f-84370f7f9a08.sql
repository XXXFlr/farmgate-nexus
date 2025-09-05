-- Update users table to include required fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'visitor';

-- Update markets table to include date, time, and status fields
ALTER TABLE public.markets 
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS time time,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Create user_markets table for saved markets
CREATE TABLE IF NOT EXISTS public.user_markets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  market_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, market_id)
);

-- Enable RLS on user_markets
ALTER TABLE public.user_markets ENABLE ROW LEVEL SECURITY;

-- Create policies for user_markets
CREATE POLICY "Users can view their saved markets" 
ON public.user_markets 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can save markets" 
ON public.user_markets 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can unsave markets" 
ON public.user_markets 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Update markets policies to allow viewing approved markets
DROP POLICY IF EXISTS "Users can view/edit their markets" ON public.markets;

CREATE POLICY "Users can view approved markets" 
ON public.markets 
FOR SELECT 
USING (status = 'approved' OR auth.uid()::text = creator_id::text);

CREATE POLICY "Users can create markets" 
ON public.markets 
FOR INSERT 
WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can edit their own markets" 
ON public.markets 
FOR UPDATE 
USING (auth.uid()::text = creator_id::text);

-- Create function to sync Firebase user to Supabase
CREATE OR REPLACE FUNCTION public.sync_firebase_user(
  firebase_uid text,
  user_email text,
  user_display_name text DEFAULT 'Unknown',
  user_country text DEFAULT 'United States'
) 
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert or update user
  INSERT INTO public.users (id, email, display_name, country, username)
  VALUES (firebase_uid::uuid, user_email, user_display_name, user_country, user_email)
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = now()
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;