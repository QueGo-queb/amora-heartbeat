-- Enable RLS on tables that need it
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table
CREATE POLICY "Only admins can view admin records" ON public.admins
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only admins can insert admin records" ON public.admins  
FOR INSERT WITH CHECK (user_id = auth.uid());