/**
 * Générateur automatique de sitemap XML multilingue
 * Scanne toutes les routes et génère les URLs pour chaque langue
 */

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  alternates: { hreflang: string; href: string }[];
}

const languages = ['fr', 'en', 'ht', 'es', 'pt'];
const domain = 'https://amora.ca'; // Votre domaine final

// Routes principales avec leurs priorités
const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' as const },
  { path: '/auth', priority: '0.9', changefreq: 'weekly' as const },
  { path: '/dashboard', priority: '0.8', changefreq: 'daily' as const },
  { path: '/feed', priority: '0.8', changefreq: 'daily' as const },
  { path: '/profile', priority: '0.7', changefreq: 'weekly' as const },
  { path: '/premium', priority: '0.9', changefreq: 'monthly' as const },
  { path: '/matching', priority: '0.8', changefreq: 'daily' as const },
  { path: '/messages', priority: '0.7', changefreq: 'daily' as const },
  { path: '/notifications', priority: '0.6', changefreq: 'daily' as const },
  { path: '/favorites', priority: '0.6', changefreq: 'weekly' as const },
  { path: '/settings', priority: '0.5', changefreq: 'monthly' as const },
  { path: '/help-center', priority: '0.6', changefreq: 'monthly' as const },
  { path: '/support', priority: '0.6', changefreq: 'monthly' as const },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' as const },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' as const },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' as const },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' as const },
  { path: '/cookies-policy', priority: '0.4', changefreq: 'yearly' as const },
  { path: '/legal-notices', priority: '0.4', changefreq: 'yearly' as const },
  { path: '/about', priority: '0.5', changefreq: 'monthly' as const },
  { path: '/chat-live', priority: '0.7', changefreq: 'daily' as const },
  { path: '/video-chat', priority: '0.7', changefreq: 'daily' as const },
  { path: '/likes', priority: '0.6', changefreq: 'weekly' as const },
  { path: '/my-posts', priority: '0.6', changefreq: 'weekly' as const },
  { path: '/new-matches', priority: '0.7', changefreq: 'daily' as const },
  { path: '/profile-views', priority: '0.6', changefreq: 'weekly' as const },
  { path: '/unread-messages', priority: '0.6', changefreq: 'daily' as const },
  { path: '/events', priority: '0.5', changefreq: 'weekly' as const },
  { path: '/travel', priority: '0.5', changefreq: 'weekly' as const },
  { path: '/badges', priority: '0.4', changefreq: 'monthly' as const },
  { path: '/ai', priority: '0.5', changefreq: 'weekly' as const },
  { path: '/premium-success', priority: '0.3', changefreq: 'yearly' as const },
  { path: '/premium-fail', priority: '0.3', changefreq: 'yearly' as const },
];

export const generateSitemap = (): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  routes.forEach(route => {
    languages.forEach(lang => {
      const url: SitemapUrl = {
        loc: `${domain}/${lang}${route.path === '/' ? '' : route.path}`,
        lastmod: currentDate,
        changefreq: route.changefreq,
        priority: route.priority,
        alternates: languages.map(altLang => ({
          hreflang: altLang,
          href: `${domain}/${altLang}${route.path === '/' ? '' : route.path}`
        }))
      };

      sitemap += `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
`;

      // Ajouter les balises hreflang pour chaque langue
      url.alternates.forEach(alt => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />
`;
      });

      // Ajouter x-default (français comme langue par défaut)
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${domain}${route.path}" />
  </url>
`;
    });
  });

  sitemap += `</urlset>`;
  return sitemap;
};

// Fonction pour télécharger le sitemap
export const downloadSitemap = () => {
  const sitemapContent = generateSitemap();
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Fonction pour obtenir le nombre total d'URLs
export const getSitemapStats = () => {
  return {
    totalRoutes: routes.length,
    totalLanguages: languages.length,
    totalUrls: routes.length * languages.length,
    languages: languages.map(lang => ({
      code: lang,
      urls: routes.length
    }))
  };
};

// Fonction pour valider le sitemap
export const validateSitemap = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérifier que le domaine est défini
  if (!domain || domain === 'https://amora.ca') {
    errors.push('⚠️ Remplacez "https://amora.ca" par votre vrai domaine avant la production');
  }
  
  // Vérifier qu'il y a des routes
  if (routes.length === 0) {
    errors.push('❌ Aucune route définie');
  }
  
  // Vérifier qu'il y a des langues
  if (languages.length === 0) {
    errors.push('❌ Aucune langue définie');
  }
  
  // Vérifier les priorités
  routes.forEach(route => {
    const priority = parseFloat(route.priority);
    if (priority < 0 || priority > 1) {
      errors.push(`❌ Priorité invalide pour ${route.path}: ${route.priority}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
