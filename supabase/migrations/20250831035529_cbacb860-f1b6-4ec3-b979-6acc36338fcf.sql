-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Fix the handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the validate_post_content function with proper search_path  
CREATE OR REPLACE FUNCTION public.validate_post_content()
RETURNS trigger AS $$
BEGIN
    IF NEW.content IS NOT NULL AND (
        NEW.content ~* '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b' OR
        NEW.content ~* '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b' OR
        NEW.content ~* 'https?://\S+' OR
        NEW.content ~* 'www\.\S+'
    ) THEN
        RAISE EXCEPTION 'Le contenu ne peut pas contenir d''email, numéro de téléphone ou lien externe';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;