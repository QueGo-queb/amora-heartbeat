-- Add new preference columns to users table for better matching
ALTER TABLE public.users 
ADD COLUMN seeking_gender text,
ADD COLUMN seeking_age_min integer,
ADD COLUMN seeking_age_max integer,
ADD COLUMN seeking_country text,
ADD COLUMN seeking_languages text[];

-- Add indexes for better matching performance
CREATE INDEX idx_users_seeking_gender ON public.users(seeking_gender);
CREATE INDEX idx_users_seeking_country ON public.users(seeking_country);
CREATE INDEX idx_users_age ON public.users(age);
CREATE INDEX idx_users_country ON public.users(country);
CREATE INDEX idx_users_gender ON public.users(gender);

-- Update profiles table to sync with auth users when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();