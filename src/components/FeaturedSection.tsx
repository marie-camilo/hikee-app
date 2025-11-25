import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Définitions des Couleurs Centralisées ---
const COLORS_MAP = {
  // 1. Nouvelle couleur de fond de la section (Stone)
  'background': '#F5F3EF',
  // 2. Nouvelle couleur pour tout ce qui était noir (Slate)
  'slate': '#4A4A4A',
  // Couleurs secondaires
  'white': '#FFFFFF',
  'gray-light': '#6B7280',
  'border-light': '#E5E7EB',
  'filter-active-bg': '#dfddd7', // L'ancienne couleur 'stone' pour les filtres actifs

  // Couleurs d'accentuation pour les cartes (utilisées dans FeatureCard)
  'terracotta': '#D87855',
  'sky': '#8BB4C9',
  'sunset': '#E8A87C',
  'corail': '#EF955F',
  'sage': '#7A9B76',
  'lavander': '#ada3b1',
  'moss': '#A8B99C',
  'stone': '#dfddd7'
};

// Types
type CardData = {
  stat?: string;
  description: string;
  accentColor: 'terracotta' | 'sky' | 'sunset' | 'corail' | 'sage' | 'lavander' | 'moss' | 'stone';
  isImageCard?: boolean;
  imageSrc?: string;
  hasArrow?: boolean;
};

type FeatureCategory = {
  id: 'about' | 'concept' | 'how' | 'sustainability';
  label: string;
  title: string;
  subtitle: string;
  cards: CardData[];
};

// Data (inchangés, mais inclus pour la complétude du fichier)
const featuredData: FeatureCategory[] = [
  {
    id: 'sustainability',
    label: 'Sustainability',
    title: 'Protecting nature for tomorrow',
    subtitle: "We believe in leaving no trace and preserving the beauty of our trails for everyone to enjoy responsibly.",
    cards: [
      {
        stat: 'ECO FIRST',
        description: 'Leave no trace principles embedded in every trail guide and resource.',
        accentColor: 'sage',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        hasArrow: true,
      },
      {
        stat: '0%',
        description: 'Zero waste initiatives and carbon offset programs for a healthier planet.',
        accentColor: 'sage',
      },
      {
        stat: 'PRESERVE',
        description: 'Educational resources on wildlife conservation and habitat protection.',
        accentColor: 'sage',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80',
      },
      {
        stat: 'PARTNER',
        description: 'Collaborating with environmental organizations worldwide.',
        accentColor: 'moss',
        hasArrow: true,
      },
      {
        stat: 'EDUCATE',
        description: 'Resources on sustainable hiking and conservation best practices.',
        accentColor: 'stone',
      },
      {
        stat: 'IMPACT',
        description: 'Track your positive environmental impact with every hike you complete.',
        accentColor: 'lavander',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
        hasArrow: true,
      },
    ],
  },
  {
    id: 'about',
    label: 'About Us',
    title: 'Built for adventurers like you',
    subtitle: "With years of expertise in outdoor technology, we're committed to making hiking accessible and promoting sustainable adventures for everyone.",
    cards: [
      {
        stat: 'MISSION',
        description: "Make hiking accessible and promote sustainable adventures for all outdoor enthusiasts.",
        accentColor: 'terracotta',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
        hasArrow: true,
      },
      {
        stat: '100%',
        description: 'Built by hikers, for hikers. A community-driven project focused on authentic experiences.',
        accentColor: 'stone',
      },
      {
        stat: 'COMMUNITY',
        description: 'Join thousands of passionate hikers sharing their adventures and discoveries.',
        accentColor: 'sky',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
      },
      {
        stat: '7',
        description: 'Our core values: Respect, Share, Encourage, Safety, Community, Nature, Adventure.',
        accentColor: 'moss',
      },
      {
        stat: 'TEAM',
        description: 'A dedicated team of web developers and outdoor enthusiasts.',
        accentColor: 'sunset',
      },
      {
        stat: 'GLOBAL',
        description: 'Connecting hikers from all around the world on one unified platform.',
        accentColor: 'terracotta',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        hasArrow: true,
      },
    ],
  },
  {
    id: 'concept',
    label: 'The Concept',
    title: 'Discover new terrains effortlessly',
    subtitle: "One platform to explore, share, and connect with a community of passionate hikers who love the outdoors as much as you do.",
    cards: [
      {
        stat: 'ALL TRAILS',
        description: 'Browse thousands of trails filtered by difficulty, location, and user ratings.',
        accentColor: 'sky',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
        hasArrow: true,
      },
      {
        stat: 'COMMUNITY',
        description: 'Real feedback from real hikers with transparent difficulty ratings.',
        accentColor: 'lavander',
      },
      {
        stat: 'DISCOVER',
        description: 'Find hidden gems and popular trails with our smart recommendation system.',
        accentColor: 'terracotta',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80',
      },
      {
        stat: 'SMART',
        description: 'Smart search and social features beyond a simple hiking log.',
        accentColor: 'stone',
        hasArrow: true,
      },
      {
        stat: 'SOCIAL',
        description: 'Connect, inspire, and learn in a dedicated hiking space.',
        accentColor: 'sage',
      },
      {
        stat: 'SHARE',
        description: 'Post photos, tips, and save your favorite trails for future adventures.',
        accentColor: 'lavander',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
        hasArrow: true,
      },
    ],
  },
  {
    id: 'how',
    label: 'How It Works',
    title: 'Plan your next adventure in 3 steps',
    subtitle: "From discovering new trails to sharing your journey, we've made it easier than ever to explore the great outdoors.",
    cards: [
      {
        stat: 'EXPLORE',
        description: 'Search trails by difficulty, distance, elevation, and user reviews.',
        accentColor: 'terracotta',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
        hasArrow: true,
      },
      {
        stat: 'PREPARE',
        description: 'Get detailed maps, weather forecasts, and essential packing lists.',
        accentColor: 'corail',
      },
      {
        stat: 'ADVENTURE',
        description: 'Hit the trail with confidence using our offline maps and GPS tracking.',
        accentColor: 'sky',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?w=800&q=80',
      },
      {
        stat: 'SHARE',
        description: 'Document your hike with photos and tips for other adventurers.',
        accentColor: 'sunset',
        hasArrow: true,
      },
      {
        stat: 'CONNECT',
        description: 'Join groups and find hiking partners who share your passion.',
        accentColor: 'terracotta',
      },
      {
        stat: 'MEMORIES',
        description: 'Build your hiking portfolio and inspire others with your journey.',
        accentColor: 'lavander',
        isImageCard: true,
        imageSrc: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80',
        hasArrow: true,
      },
    ],
  },
];

// Arrow Icon (pointing to top-right)
const ArrowIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

// FeatureCard Component
const FeatureCard: React.FC<{ card: CardData }> = ({ card }) => {
  const accentColors = {
    terracotta: COLORS_MAP.terracotta,
    sky: COLORS_MAP.sky,
    sunset: COLORS_MAP.sunset,
    corail: COLORS_MAP.corail,
    sage: COLORS_MAP.sage,
    lavander: COLORS_MAP.lavander,
    moss: COLORS_MAP.moss,
    stone: COLORS_MAP.stone
  };

  if (card.isImageCard) {
    return (
      <div
        className="relative overflow-hidden flex flex-col justify-end p-6 md:p-8"
        style={{
          borderRadius: '24px',
          backgroundImage: card.imageSrc ? `url(${card.imageSrc})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: card.imageSrc ? 'transparent' : accentColors[card.accentColor],
          minHeight: '280px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            // L'overlay reste sombre pour la lisibilité sur l'image
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
          }}
        />

        {card.hasArrow && (
          <div
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
            // Remplacé #000000 par slate
            style={{ backgroundColor: COLORS_MAP.white, color: COLORS_MAP.slate }}
          >
            <ArrowIcon />
          </div>
        )}

        <div className="relative z-10">
          <p className="text-3xl md:text-4xl font-bold leading-none mb-3" style={{ color: COLORS_MAP.white }}>
            {card.stat}
          </p>
          <p className="text-sm md:text-base font-normal leading-relaxed" style={{ color: COLORS_MAP.white, opacity: 0.95 }}>
            {card.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-end p-6 md:p-8 transition-all duration-500 hover:scale-[1.02] group cursor-pointer relative overflow-hidden"
      style={{
        backgroundColor: accentColors[card.accentColor],
        borderRadius: '24px',
        minHeight: '280px',
      }}
    >
      {card.hasArrow && (
        <div
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          // Remplacé #000000 par slate
          style={{ backgroundColor: COLORS_MAP.slate, color: accentColors[card.accentColor] }}
        >
          <ArrowIcon />
        </div>
      )}

      <div>
        <p
          className="text-3xl md:text-4xl font-bold mb-3 leading-none"
          // Remplacé #000000 par slate
          style={{ color: COLORS_MAP.slate }}
        >
          {card.stat}
        </p>
        <p className="text-sm md:text-base leading-relaxed font-normal"
          // Remplacé #000000 par slate (avec opacité)
           style={{ color: COLORS_MAP.slate, opacity: 0.85 }}>
          {card.description}
        </p>
      </div>
    </div>
  );
};

// Main Component
const FeaturedSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>(featuredData[0]);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Initial entrance animation with ScrollTrigger (inchangé)
  useEffect(() => {
    if (!hasAnimated && sectionRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none none',
          }
        });

        tl.fromTo(
          '.filter-btn',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
        )
          .fromTo(
            contentRef.current?.children || [],
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
            '-=0.4'
          )
          .fromTo(
            '.feature-card',
            { opacity: 0, scale: 0.9, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.4)' },
            '-=0.6'
          );
      }, sectionRef);

      setHasAnimated(true);
      return () => ctx.revert();
    }
  }, [hasAnimated]);

  // Category change animation (inchangé)
  useEffect(() => {
    if (hasAnimated) {
      const ctx = gsap.context(() => {
        const cards = cardsRef.current?.querySelectorAll('.feature-card');
        const content = contentRef.current?.children;

        gsap.fromTo(
          content || [],
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
        );

        gsap.fromTo(
          cards || [],
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
        );
      });

      return () => ctx.revert();
    }
  }, [activeCategory, hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: COLORS_MAP.background }}
    >
      <div className="w-full px-8 sm:px-16">

        <div className="flex flex-wrap mb-16 gap-2">
          {featuredData.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category)}
              className="filter-btn px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300"
              style={{
                backgroundColor: category.id === activeCategory.id ? COLORS_MAP['filter-active-bg'] : COLORS_MAP.white,
                // Remplacé #000000 par slate
                color: COLORS_MAP.slate,
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
          {/* Content Section */}
          <div ref={contentRef} className="space-y-6">
            <div className="flex items-start gap-3">
              <p className="text-sm font-medium" style={{ color: COLORS_MAP['gray-light'] }}>
                Who We Are at Hikee
              </p>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight"
              // Remplacé #000000 par slate
              style={{ color: COLORS_MAP.slate }}
            >
              {activeCategory.title}
            </h2>

            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: COLORS_MAP['gray-light'] }}
            >
              {activeCategory.subtitle}
            </p>

            <div className="pt-4">
              <button
                className="px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105"
                style={{
                  // Remplacé #000000 par slate
                  backgroundColor: COLORS_MAP.slate,
                  color: COLORS_MAP.white,
                }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Cards Grid - 3 columns */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCategory.cards.map((card, index) => (
              <div key={index} className="feature-card">
                <FeatureCard card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;