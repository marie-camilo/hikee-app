'use client';

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from '../animations/SplitText';
import Button from '../Button';

gsap.registerPlugin(ScrollTrigger);

const COLORS = {
  background: '#F5F3EF',
  slate: '#4A4A4A',
  white: '#FFFFFF',
  green: '#7A9B76',
  yellow: '#E8A87C',
  red: '#D87855',
  lavander: '#ada3b1',
  corail: '#EF955F',
};

interface HikeCardProps {
  id: string;
  title: string;
  image?: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  region?: string;
  imageUrls?: string[];
}

const HikeCard: React.FC<HikeCardProps> = ({ id, title, image, difficulty, region }) => {
  const displayedImage = image || '/images/home-bg.jpg';

  const difficultyColors = {
    easy: 'bg-[#7A9B76]',
    moderate: 'bg-[#E8A87C]',
    hard: 'bg-[#D87855]',
  };

  return (
    <Link
      to={`/hikes/${id}`}
      className="group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ backgroundColor: COLORS.white }}
    >
      <div className="relative w-full h-56">
        <img
          src={displayedImage}
          alt={title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold text-white rounded-full ${difficultyColors[difficulty]}`}>
          {difficulty === 'easy' ? 'Facile' : difficulty === 'moderate' ? 'Modérée' : 'Difficile'}
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.slate }}>{title}</h2>
        {region && <p className="text-sm text-gray-500">{region}</p>}
        <div className="flex items-center justify-between text-sm mt-4" style={{ color: COLORS.lavander }}>
          <span>See details</span>
          <div className="ml-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-[#EF955F]" style={{ backgroundColor: COLORS.lavander }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ButtonTile: React.FC<{ link: string }> = ({ link }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="group block w-full h-80 rounded-2xl p-10 relative shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
        style={{
          backgroundImage: "url('/images/pause.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      </div>


      <div className="mt-4 w-full">
        <Link to={link}>
          <Button
            variant="sage"
            size="md"
            arrow
          >
            Explore all trails
          </Button>
        </Link>
      </div>
    </div>
  );
};


interface HikeTilesProps {
  hikes: HikeCardProps[];
}

const HikeTilesWithButton: React.FC<HikeTilesProps> = ({ hikes }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const featuredHikes = hikes.slice(0, 3);
  const buttonElement = <ButtonTile key="cta-button" link="/hikes/list" />;
  const gridItems = [...featuredHikes];
  gridItems.splice(1, 0, buttonElement as any);
  const finalGridItems = gridItems.slice(0, 4);

  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('.reveal-card');
    if (!cards || cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 100, scale: 0.94 });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.3,
      ease: "power3.out",
      stagger: 0.18,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 50%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        // markers: true,
      },
    });

    ScrollTrigger.refresh();

  }, { scope: containerRef, dependencies: [hikes] });

  if (finalGridItems.length < 2) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="w-full py-16 md:py-24"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="w-full px-8 sm:px-16">
        <div className="w-full font-bold uppercase tracking-tight mb-12 md:mb-16 text-center text-[#4A4A4A]">
          <div className="text-[7vw] md:text-[9vw] leading-none">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {finalGridItems.map((item, index) => {
            if ((item as any).key === 'cta-button') {
              return (
                <div key="cta-button" className="h-full reveal-card">
                  {buttonElement}
                </div>
              );
            }
            const hike = item as HikeCardProps;
            return (
              <div key={hike.id} className="h-full reveal-card">
                <HikeCard
                  id={hike.id}
                  title={hike.title}
                  difficulty={hike.difficulty}
                  region={hike.region}
                  image={hike.imageUrls?.[0]}
                />
              </div>

            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HikeTilesWithButton;