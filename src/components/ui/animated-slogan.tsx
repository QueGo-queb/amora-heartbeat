import { useState, useEffect } from "react";

interface Slogan {
  fr: string;
  en: string;
  ht: string;
  es: string;
}

const slogans: Slogan[] = [
  {
    fr: "L'amour n'a pas de frontières. Trouve ta moitié, où qu'elle soit.",
    en: "Love has no borders. Find your soulmate, wherever they are.",
    ht: "Lanmou pa gen fwontyè. Jwenn nanm ou yo, kote yo ye.",
    es: "El amor no tiene fronteras. Encuentra tu alma gemela, donde sea que esté."
  },
  {
    fr: "Des cœurs connectés, des cultures réunies.",
    en: "Connected hearts, united cultures.",
    ht: "Kè ki konekte, kilti ki rasanble.",
    es: "Corazones conectados, culturas unidas."
  },
  {
    fr: "Rencontrer. Partager. Aimer. Sans limites.",
    en: "Meet. Share. Love. Without limits.",
    ht: "Rankontre. Pataje. Renmen. San limit.",
    es: "Conocer. Compartir. Amar. Sin límites."
  },
  {
    fr: "Ton histoire commence ici.",
    en: "Your story begins here.",
    ht: "Istwa ou a kòmanse isit la.",
    es: "Tu historia comienza aquí."
  },
  {
    fr: "L'amour afro-caribéen et latino, à portée de clic.",
    en: "Afro-Caribbean and Latino love, just a click away.",
    ht: "Lanmou afwo-karayiben ak latino a, yon klik sèlman.",
    es: "Amor afrocaribeño y latino, a solo un clic."
  },
  {
    fr: "Crée ton lien. Vis ton amour.",
    en: "Create your bond. Live your love.",
    ht: "Kreye konneksyon ou. Viv lanmou ou.",
    es: "Crea tu vínculo. Vive tu amor."
  },
  {
    fr: "L'amour sans frontières, pour des cœurs qui se ressemblent.",
    en: "Love without borders, for hearts that are alike.",
    ht: "Lanmou san fwontyè, pou kè ki sanble.",
    es: "Amor sin fronteras, para corazones que se parecen."
  },
  {
    fr: "Un monde, trois cultures, une seule intention : aimer.",
    en: "One world, three cultures, one intention: to love.",
    ht: "Yon mond, twa kilti, yon sèl entansyon: pou renmen.",
    es: "Un mundo, tres culturas, una intención: amar."
  },
  {
    fr: "Rencontrez votre moitié, là où l'amour parle toutes les langues.",
    en: "Meet your soulmate, where love speaks all languages.",
    ht: "Rankontre nanm ou an, kote lanmou pale tout lang.",
    es: "Conoce a tu alma gemela, donde el amor habla todos los idiomas."
  },
  {
    fr: "Amora — là où les cœurs de la diaspora se retrouvent.",
    en: "Amora — where diaspora hearts reconnect.",
    ht: "Amora — kote kè dyaspora yo jwenn yo.",
    es: "Amora — donde los corazones de la diáspora se reencuentran."
  },
  {
    fr: "Créez votre lien. Vivez votre amour.",
    en: "Create your connection. Live your love.",
    ht: "Kreye konneksyon ou. Viv lanmou ou.",
    es: "Crea tu conexión. Vive tu amor."
  },
  {
    fr: "Des connexions vraies, des histoires sincères.",
    en: "Real connections, sincere stories.",
    ht: "Konneksyon vre, istwa onèt.",
    es: "Conexiones reales, historias sinceras."
  },
  {
    fr: "Amora — parce que l'amour mérite son propre espace.",
    en: "Amora — because love deserves its own space.",
    ht: "Amora — paske lanmou merite pwòp espas li.",
    es: "Amora — porque el amor merece su propio espacio."
  },
  {
    fr: "Ici, l'amour est une langue que tout le monde comprend.",
    en: "Here, love is a language everyone understands.",
    ht: "Isit la, lanmou se yon lang tout moun konprann.",
    es: "Aquí, el amor es un idioma que todos entienden."
  },
  {
    fr: "Votre cœur connaît déjà la route. Amora vous y conduit.",
    en: "Your heart already knows the way. Amora leads you there.",
    ht: "Kè ou deja konnen wout la. Amora mennen ou la.",
    es: "Tu corazón ya conoce el camino. Amora te lleva allí."
  }
];

interface AnimatedSloganProps {
  language: string;
}

export function AnimatedSlogan({ language }: AnimatedSloganProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slogans.length);
        setIsVisible(true);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentSlogan = slogans[currentIndex];
  const langKey = language as keyof Slogan;
  const text = currentSlogan[langKey] || currentSlogan.fr;

  return (
    <div className="slogan-container">
      <p
        className={`slogan-text transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {text}
      </p>
    </div>
  );
}