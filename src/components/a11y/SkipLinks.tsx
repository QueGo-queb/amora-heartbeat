import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Aller au contenu principal' },
  { href: '#navigation', label: 'Aller à la navigation' },
  { href: '#footer', label: 'Aller au pied de page' },
];

export const SkipLinks = () => {
  return (
    <div className="skip-links">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              (target as HTMLElement).focus();
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {link.label}
        </a>
      ))}
      
      {/* ✅ CORRIGÉ - Utiliser className au lieu de style jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .skip-links {
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
          }
          
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            transition: top 0.3s;
          }
          
          .skip-link:focus {
            top: 6px;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .skip-link {
              transition: none;
            }
          }
        `
      }} />
    </div>
  );
};
