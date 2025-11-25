'use client';
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './src/components/animations/SplitText';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Définitions des Couleurs et Types ---
const COLORS = {
  background: '#F5F3EF', // Beige
  slate: '#4A4A4A',
  white: '#FFFFFF',
  // Couleurs de difficulté
  green: '#7A9B76',     // Facile
  yellow: '#E8A87C',    // Modérée
  red: '#D87855',       // Difficile (utilisé ici comme accent)
  // Couleurs d'accentuation
  lavander: '#ada3b1',
  corail: '#EF955F',
  terracotta: '#D87855', // Utilisé pour le bouton CTA
};

interface HikeCardProps {
  id: string
  title: string
  image?: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region?: string
}

// --- 2. Composants Utilisés ---

// Icône de flèche pour le bouton CTA
const ArrowIcon: React.FC = () => (
  <svg className="w-6 h-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// Composant HikeCard standard (adapté aux styles hardcodés)
const HikeCard: React.FC<HikeCardProps> = ({ id, title, image, difficulty, region }) => {
  const displayedImage = image || '/images/home-bg.jpg';

  const difficultyColors: Record<HikeCardProps['difficulty'], string> = {
    easy: `bg-[${COLORS.green}]`,
    moderate: `bg-[${COLORS.yellow}]`,
    hard: `bg-[${COLORS.red}]`,
  };

  return (
    <Link
      to={`/hikes/${id}`}
      className="group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
      style={{ backgroundColor: COLORS.white }}
    >
      <div className="relative w-full h-56">
        <img
          src={displayedImage}
          alt={`Image de la randonnée ${title}`}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold text-white rounded-full ${difficultyColors[difficulty]}`}
        >
          {difficulty === 'easy' ? 'Facile' : difficulty === 'moderate' ? 'Modérée' : 'Difficile'}
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.slate }}>{title}</h2>
        {region && <p className="text-sm text-gray-500">{region}</p>}

        <div className="flex items-center justify-between text-sm transition-colors mt-4" style={{ color: COLORS.lavander }}>
          <span>Voir les détails</span>
          <div className="ml-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
               style={{ backgroundColor: COLORS.lavander, color: COLORS.white, transitionProperty: 'background-color, transform', transitionDuration: '300ms' }}
               onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.corail }}
               onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.lavander }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Composant du Bouton/Lien (CTA)
const ButtonTile: React.FC<{ link: string; text: string }> = ({ link, text }) => {
  return (
    <Link
      to={link}
      className="group block w-full h-full rounded-3xl p-10 relative shadow-lg hover:shadow-xl transition-all duration-300 bg-[var(--sage)]"
      style={{
        backgroundColor: COLORS.lavander,
        color: COLORS.white,
        minHeight: "340px",
      }}
    >

      <div
        className="absolute top-6 right-6 flex items-center gap-3 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 group-hover:bg-white group-hover:text-[#73627a]"
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span>Explore all trails</span>

        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>

      <div className="absolute bottom-6 left-6">
        <p className="text-lg md:text-xl font-light tracking-wide opacity-90 leading-tight">
          Find your next adventure
        </p>
      </div>

    </Link>
  );
};




interface HikeTilesProps {
  hikes: HikeCardProps[];
}

const HikeTilesWithButton: React.FC<HikeTilesProps> = ({ hikes }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animation du Titre et des Cartes
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      });

      // Animation du Titre (similaire à la HeroSection)
      tl.fromTo(
        sectionRef.current!.querySelectorAll('.animated-word'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.05, ease: 'power2.out' }
      )
        // Animation du paragraphe
        .fromTo(
          '.hero-subtitle-text-centered',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.8'
        )
        // Animation des cartes/boutons
        .fromTo(
          '.grid-item-reveal',
          { opacity: 0, scale: 0.9, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.4)' },
          '-=0.6'
        );

    }, sectionRef);

    return () => ctx.revert();
  }, []);


  // --- Logique d'insertion du bouton dans la grille ---

  // 1. Prendre les 3 premières randonnées (ou moins si moins existent)
  const featuredHikes = hikes.slice(0, 3);

  // 2. Définir le bouton d'action
  const buttonElement = (
    <ButtonTile
      key="cta-button"
      link="/hikes/list"
      text="Voir la liste complète"
    />
  );

  // 3. Insérer le bouton à la deuxième position pour une mise en page asymétrique
  const gridItems = [...featuredHikes];
  // On insère le bouton à l'index 1 (après la première carte)
  gridItems.splice(1, 0, buttonElement as any);

  // Limiter à 4 éléments pour la grille 4 colonnes
  const finalGridItems = gridItems.slice(0, 4);

  // S'assurer qu'il y a au moins 3 éléments (2 cartes + le bouton)
  if (finalGridItems.length < 2) {
    return null; // Ne rien afficher si pas assez de données
  }

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="w-full px-8 sm:px-16">
        <div
          className="w-full font-bold uppercase tracking-tight mb-10"
          style={{ color: COLORS.slate }}
        >
          <div className="text-[7vw] md:text-[9vw] leading-none text-center">
            <SplitText
              text="go explore."
              tag="span"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.4}
              delay={80}
              ease="power2.out"
              textAlign="center"
            />
          </div>
        </div>


        {/* Grille de 4 colonnes (2 sur tablette, 1 sur mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {finalGridItems.map((item, index) => {
            // C'est le bouton CTA
            if ((item as any).key === 'cta-button') {
              return (
                <div key="cta-button" className="h-full grid-item-reveal">
                  {buttonElement}
                </div>
              );
            }

            // C'est une HikeCard
            const hike = item as HikeCardProps;
            return (
              <div key={hike.id} className="h-full grid-item-reveal">
                <HikeCard {...hike} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HikeTilesWithButton;