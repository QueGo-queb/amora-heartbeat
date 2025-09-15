import { createClient } from '@supabase/supabase-js';

// Client admin avec service_role (côté serveur uniquement)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Créer l'utilisateur
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Administrateur',
        role: 'admin'
      }
    });

    if (createError) {
      console.error('Erreur création auth:', createError);
      return res.status(400).json({ 
        success: false, 
        message: createError.message 
      });
    }

    if (!newUser.user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erreur lors de la création de l\'utilisateur' 
      });
    }

    // Créer le profil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email: email,
        full_name: fullName || 'Administrateur',
        is_active: true
      });

    if (profileError) {
      console.error('Erreur création profil:', profileError);
      // Ne pas échouer si le profil existe déjà
    }

    return res.status(200).json({
      success: true,
      user: newUser.user,
      message: 'Administrateur créé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur API create-admin:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur interne du serveur'
    });
  }
}
