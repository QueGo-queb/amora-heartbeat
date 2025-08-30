-- Créer les types ENUM
CREATE TYPE gender_type AS ENUM ('homme', 'femme');
CREATE TYPE plan_type AS ENUM ('free', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled');

-- Table users (remplace auth.users pour plus de contrôle)
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    language TEXT DEFAULT 'fr',
    bio TEXT,
    gender gender_type NOT NULL,
    looking_for gender_type NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    search_age_range INT4RANGE,
    country TEXT NOT NULL,
    region TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table posts
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (content IS NOT NULL OR image_url IS NOT NULL OR video_url IS NOT NULL)
);

-- Table subscriptions
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    plan plan_type DEFAULT 'free' NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    status subscription_status DEFAULT 'active' NOT NULL,
    UNIQUE(user_id)
);

-- Table messages
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (sender_id != receiver_id)
);

-- Table groups
CREATE TABLE public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table events
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Politiques RLS pour posts (tous peuvent voir, seul le créateur peut modifier/supprimer)
CREATE POLICY "Posts are publicly viewable" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (user_id = auth.uid());

-- Politiques RLS pour subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (user_id = auth.uid());

-- Politiques RLS pour messages (seuls expéditeur et destinataire peuvent voir)
CREATE POLICY "Users can view own messages" ON public.messages 
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages 
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Politiques RLS pour groups
CREATE POLICY "Groups are publicly viewable" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own groups" ON public.groups FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own groups" ON public.groups FOR DELETE USING (created_by = auth.uid());

-- Politiques RLS pour events
CREATE POLICY "Events are publicly viewable" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (created_by = auth.uid());

-- Fonction pour valider le contenu des posts (pas d'email, téléphone, liens)
CREATE OR REPLACE FUNCTION validate_post_content()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Appliquer le trigger de validation
CREATE TRIGGER validate_post_content_trigger
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION validate_post_content();