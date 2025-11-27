'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './animations/SplitText';
import AnimatedWord from './animations/AnimatedWord';

gsap.registerPlugin(ScrollTrigger);

// Définition de la couleur pour référence
const SLATE_COLOR = '#4A4A4A';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!heroRef.current || !sectionRef.current || isMobile) return; // Skip sur mobile

    const ctx = gsap.context(() => {
      // Pin le hero pendant que la section monte
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
      });

      // Section animée seulement sur Desktop
      gsap.fromTo(
        sectionRef.current,
        {
          y: 100,
          scale: 0.95,
        },
        {
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
            // markers: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div className="w-full overflow-hidden">
      {/* Hero section */}
      <div ref={heroRef} className="relative w-full h-[100dvh] overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video/home-bg-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 sm:px-16">
          <div
            className="w-full font-bold uppercase tracking-tight text-[9vw] leading-none"
            style={{ color: 'var(--sand, #E8E4DD)' }}
          >
            <div className="text-left">
              <SplitText
                text="wander"
                tag="span"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                duration={1}
                delay={80}
                ease="power2.out"
                textAlign="left"
              />
              <br />
              <SplitText
                text="far"
                tag="span"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                duration={1}
                delay={80}
                ease="power2.out"
                textAlign="left"
              />
            </div>
            <div className="text-right">
              <SplitText
                text="and"
                tag="span"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                duration={1}
                delay={80}
                ease="power2.out"
                textAlign="right"
              />
              <br />
              <SplitText
                text="wide"
                tag="span"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                duration={1}
                delay={80}
                ease="power2.out"
                textAlign="right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section Hard Work */}
      <section
        ref={sectionRef}
        className="relative w-full pt-32 md:pt-44 pb-8 bg-[#F5F3EF] z-20 md:rounded-t-[48px]"
      >
        <div className="w-full font-bold uppercase tracking-tight" style={{ color: SLATE_COLOR }}>
          <div className="text-[9vw] leading-none text-right pr-8 md:pr-16">
            <SplitText
              text="we've done all"
              tag="span"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.8}
              delay={100}
              ease="power2.out"
              textAlign="right"
            />
          </div>
          <div className="text-[9vw] leading-none pl-8 md:pl-16">
            <SplitText
              text="the hard work"
              tag="span"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.8}
              delay={100}
              ease="power2.out"
              textAlign="left"
            />
          </div>
          <div className="text-[9vw] leading-none pl-8 md:pl-16 mb-6 md:mb-8">
            <SplitText
              text="for you."
              tag="span"
              splitType="words"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              duration={1.8}
              delay={100}
              ease="power2.out"
              textAlign="left"
            />
          </div>
        </div>

        <p className="text-left text-slate/90 px-8 md:px-16 max-w-2xl text-base md:text-lg leading-relaxed">
          Explore routes that have been sorted, tested, and carefully selected for you. We've simplified your preparation so you can focus solely on what matters most: enjoying the adventure.
        </p>
      </section>
    </div>
  );
}