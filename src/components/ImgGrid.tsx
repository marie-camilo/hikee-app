import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Types
type GridItem = {
  id: number;
  type: 'image' | 'text' | 'video' | 'button';
  imageSrc?: string;
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  accentColor?: string;
  span?: { cols: number; rows: number };
};

// Arrow Icon
const ArrowIcon: React.FC<{ color?: string }> = ({ color = '#FFFFFF' }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Grid Data - Layout moderne et épuré
const gridItems: GridItem[] = [
  {
    id: 1,
    type: 'text',
    title: 'ABOUT US',
    description: "We are a community of hikers committed to simplifying your adventures. Our mission: accessible, sustainable, and unforgettable routes.",
    buttonText: 'SEE OUR VALUES',
    accentColor: '#E8E4DD',
    span: { cols: 3, rows: 2 },
  },
  {
    id: 2,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    title: 'TESTED ROUTES',
    description: 'Every trail is verified by our team for safety and accuracy.',
    span: { cols: 2, rows: 2 },
  },
  {
    id: 3,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    title: 'COMMUNITY',
    description: 'Join thousands of passionate hikers sharing their experiences.',
    span: { cols: 1, rows: 1 },
  },
  {
    id: 4,
    type: 'video',
    videoSrc: '/images/home-bg-video.mp4',
    title: 'FOCUS ON THE VIEW',
    description: 'Less planning, more exploring. Let us handle the details.',
    span: { cols: 2, rows: 3 },
  },
  {
    id: 5,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    title: 'SHARE',
    description: 'Post photos and inspire the next adventurer.',
    span: { cols: 1, rows: 1 },
  },
  {
    id: 6,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80',
    title: 'DETAILED SPECS',
    description: 'Elevation, difficulty, and community tips at a glance.',
    span: { cols: 1, rows: 1 },
  },
  {
    id: 7,
    type: 'button',
    buttonText: 'FIND YOUR TRAIL',
    description: 'Start exploring now',
    accentColor: '#2C3E2E',
    span: { cols: 2, rows: 1 },
  },
  {
    id: 8,
    type: 'image',
    imageSrc: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80',
    title: 'DISCOVER',
    description: 'Find hidden gems and secret trails.',
    span: { cols: 2, rows: 1 },
  },
];

const InteractiveImageGrid: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initial entrance animation
  useEffect(() => {
    if (gridRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          itemsRef.current.filter(Boolean),
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, []);

  // Click interaction for images
  const handleClick = (id: number, type: string) => {
    if (type === 'image') {
      setActiveId(activeId === id ? null : id);
    }
  };

  return (
    <section
      className="relative w-full pt-16 md:pt-24 pb-16 md:pb-24 px-8 sm:px-16 z-20"
      style={{ backgroundColor: '#F5F3EF' }}
    >
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 auto-rows-[200px] gap-3 md:gap-4 w-full"
      >
        {gridItems.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => (itemsRef.current[index] = el)}
            className={`relative overflow-hidden group cursor-pointer transition-all duration-500 
              ${item.span ? `col-span-${Math.min(item.span.cols, 2)} md:col-span-${item.span.cols} row-span-${item.span.rows}` : 'col-span-1 row-span-1'}`}
            style={{
              borderRadius: '24px',
              transform: activeId === item.id ? 'scale(1.02)' : activeId && item.type === 'image' ? 'scale(0.98)' : 'scale(1)',
              opacity: activeId && activeId !== item.id && item.type === 'image' ? 0.6 : 1,
            }}
            onClick={() => handleClick(item.id, item.type)}
          >
            {/* TEXT CARD */}
            {item.type === 'text' && (
              <div
                className="w-full h-full p-6 md:p-8 flex flex-col justify-between"
                style={{ backgroundColor: item.accentColor }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#4A4A4A' }}>
                      {item.title}
                    </span>
                    <span className="text-xs font-normal" style={{ color: '#6B7280' }}>
                      {item.subtitle}
                    </span>
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl font-normal leading-relaxed" style={{ color: '#2C3E2E' }}>
                    {item.description}
                  </p>
                </div>
                <button
                  className="self-start mt-4 px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:gap-3"
                  style={{ backgroundColor: '#2C3E2E', color: '#FFFFFF' }}
                >
                  <span className="text-sm font-semibold">{item.buttonText}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                    <ArrowIcon color="#2C3E2E" />
                  </div>
                </button>
              </div>
            )}

            {/* IMAGE CARD */}
            {item.type === 'image' && (
              <div className="w-full h-full relative">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)',
                    opacity: activeId === item.id ? 0.5 : 1,
                  }}
                />
                {activeId === item.id && (
                  <div className="absolute inset-0 border-4 rounded-[24px]" style={{ borderColor: '#FFFFFF' }} />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-1 uppercase tracking-wide" style={{ color: '#FFFFFF' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm font-normal leading-relaxed" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            )}

            {/* VIDEO CARD */}
            {item.type === 'video' && (
              <div className="w-full h-full relative">
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  src={item.videoSrc}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-1 uppercase tracking-wide" style={{ color: '#FFFFFF' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm font-normal leading-relaxed" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            )}

            {/* BUTTON CARD */}
            {item.type === 'button' && (
              <button
                className="w-full h-full px-6 md:px-8 flex items-center justify-between transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: item.accentColor }}
              >
                <div className="text-left">
                  <span className="text-base md:text-lg lg:text-xl font-bold tracking-wide uppercase block" style={{ color: '#FFFFFF' }}>
                    {item.buttonText}
                  </span>
                  <span className="text-xs md:text-sm font-normal" style={{ color: '#FFFFFF', opacity: 0.85 }}>
                    {item.description}
                  </span>
                </div>
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <ArrowIcon color="#FFFFFF" />
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InteractiveImageGrid;