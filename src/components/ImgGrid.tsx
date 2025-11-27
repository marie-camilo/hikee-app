'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type GridItem = {
  id: number;
  type: 'image' | 'text' | 'video' | 'button';
  imageSrc?: string;
  videoSrc?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  accentColor?: string;
};

const ArrowIcon: React.FC = () => (
  <svg
    className="w-5 h-5 text-[#2C3E2E]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);


const gridItems: GridItem[] = [
  {
    id: 1,
    type: 'text',
    title: 'ABOUT US',
    description:
      'We are a community of hikers committed to simplifying your adventures. Our mission: accessible, sustainable, and unforgettable routes.',
    buttonText: 'SEE OUR VALUES',
    accentColor: '#dfddd7',
  },
  {
    id: 2,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    title: 'TESTED ROUTES',
    description: 'Every trail is verified by our team for safety and accuracy.',
  },
  {
    id: 3,
    type: 'image',
    imageSrc: '/images/friends.webp',
    title: 'COMMUNITY',
    description: 'Join thousands of passionate hikers sharing their experiences.',
  },
  {
    id: 4,
    type: 'video',
    videoSrc: '/video/home-bg-video.mp4',
    title: 'FOCUS ON THE VIEW',
    description: 'Less planning, more exploring. Let us handle the details.',
  },
  {
    id: 5,
    type: 'image',
    imageSrc: '/images/trio-hikes.webp',
    title: 'SHARE',
    description: 'Post photos and inspire the next adventurer.',
  },
  {
    id: 6,
    type: 'image',
    imageSrc: '/images/trailing.webp',
    title: 'DETAILED SPECS',
    description: 'Elevation, difficulty, and community tips at a glance.',
  },
  {
    id: 7,
    type: 'button',
    buttonText: 'FIND YOUR TRAIL',
    description: 'Start exploring now',
    accentColor: '#2C3E2E',
  },
  {
    id: 8,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1754258683947-0cb7141baf37?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'DISCOVER',
    description: 'Find hidden gems and secret trails.',
  },
];

interface InteractiveImageGridProps {
  scrollToFeatured?: () => void;
}

const InteractiveImageGrid: React.FC<InteractiveImageGridProps> = ({ scrollToFeatured }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const imgGridRef = useRef<HTMLElement>(null);

  const getGridStyle = (index: number): React.CSSProperties => {
    if (isMobile) {
      const layouts = [
        { gridColumn: '1 / 3' },
        { gridColumn: '1 / 3' },
        { gridColumn: '1 / 2' },
        { gridColumn: '2 / 3' },
        { gridColumn: '1 / 2' },
        { gridColumn: '2 / 3' },
        { gridColumn: '1 / 3' },
        { gridColumn: '1 / 3' },
      ];
      return layouts[index] || {};
    }

    const layouts = [
      { gridColumn: '1 / 4', gridRow: '1 / 3' },
      { gridColumn: '4 / 7', gridRow: '1 / 3' },
      { gridColumn: '1 / 3', gridRow: '3 / 5' },
      { gridColumn: '3 / 4', gridRow: '3 / 5' },
      { gridColumn: '4 / 5', gridRow: '3 / 6' },
      { gridColumn: '5 / 7', gridRow: '3 / 5' },
      { gridColumn: '5 / 7', gridRow: '5 / 6' },
      { gridColumn: '1 / 4', gridRow: '5 / 6' },
    ];
    return layouts[index] || {};
  };

  useGSAP(() => {
    const cards = imgGridRef.current?.querySelectorAll('.grid-item');

    if (!cards || cards.length === 0) return;

    gsap.fromTo(cards,
      { y: 100, opacity: 0, scale: 0.94 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: imgGridRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        }
      }
    );

    gsap.to(imgGridRef.current, {
      yPercent: -6,
      ease: "none",
      scrollTrigger: {
        trigger: imgGridRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      }
    });
  }, { scope: imgGridRef });

  return (
    <section
      ref={imgGridRef}
      className="relative w-full pt-20 md:pt-32 pb-32 md:pb-44 px-8 sm:px-16 overflow-hidden white-section"
      style={{ backgroundColor: '#F5F3EF' }}
    >

      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, 1fr)'
            : 'repeat(6, minmax(0, 1fr))',
          gridAutoRows: isMobile ? '160px' : '180px',
          gap: isMobile ? '0.75rem' : '1rem',
          marginLeft: isMobile ? 0 : '-1rem',
          marginRight: isMobile ? 0 : '-1rem',
          width: isMobile ? '100%' : 'calc(100% + 2rem)',
        }}
      >
        {gridItems.map((item, index) => (
          <div
            key={item.id}
            className="grid-item relative overflow-hidden group cursor-pointer rounded-[1rem] will-change-transform"
            style={getGridStyle(index)}
          >
            {/* TEXT CARD */}
            {item.type === 'text' && (
              <div className="w-full h-full p-6 md:p-8 lg:p-10 flex flex-col justify-between" style={{ backgroundColor: item.accentColor }}>
              <div>
                <span className="text-xs md:text-sm font-bold uppercase text-[#2C3E2E] block mb-6">
                  {item.title}
                </span>
                  <p className="text-lg md:text-2xl lg:text-3xl font-light leading-[1.3] tracking-tight text-[#2C3E2E]">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={scrollToFeatured}
                  className="self-start mt-6 px-6 py-3 rounded-full bg-[#2C3E2E] text-white flex items-center gap-3 hover:gap-5 transition-all duration-300"
                >
                  <span className="font-medium tracking-wide">{item.buttonText}</span>
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                    <ArrowIcon />
                  </div>
                </button>
              </div>
            )}

            {/* IMAGE CARD */}
            {item.type === 'image' && (
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-base font-bold uppercase tracking-wider">{item.title}</h3>
                  <p className="text-sm opacity-90 mt-1">{item.description}</p>
                </div>
              </div>
            )}

            {/* VIDEO CARD */}
            {item.type === 'video' && (
              <div className="relative w-full h-full">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src={item.videoSrc}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-base font-bold uppercase tracking-wider">{item.title}</h3>
                  <p className="text-sm opacity-90 mt-1">{item.description}</p>
                </div>
              </div>
            )}

            {/* BUTTON CARD */}
            {item.type === 'button' && (
              <Link
                to="/hikes/list"
                className="w-full h-full px-8 flex items-center justify-between bg-[#2C3E2E] hover:bg-[#3a4f3d] transition-colors duration-500 group rounded-lg"
              >
                <div className="text-left">
                  <span className="text-lg font-bold text-white block">{item.buttonText}</span>
                  <span className="text-sm text-white/80">{item.description}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowIcon />
                </div>
              </Link>
            )}

          </div>
        ))}
      </div>
    </section>
  );
};

export default InteractiveImageGrid;