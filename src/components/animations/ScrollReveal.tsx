'use client';
import React, { useEffect, useRef, RefObject, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: (string | { img: string; caption?: string })[];
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
                                                     children,
                                                     scrollContainerRef,
                                                     containerClassName = '',
                                                     textClassName = '',
                                                   }) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderParts = children.map((part, index) => {
    if (typeof part === 'string') {
      return part.split(/(\s+)/).map((word, i) => {
        if (word.match(/^\s+$/)) {
          return <span key={`space-${index}-${i}`}>&nbsp;</span>;
        }

        return (
          <span
            key={`${index}-${i}`}
            className="inline-block word px-[2px] leading-none"
          >
            {word}
          </span>
        );
      });
    }

    // IMAGE
    return (
      <span
        key={`img-${index}`}
        className="inline-flex flex-col items-center mx-2 md:mx-3 image-wrapper"
      >
        <img
          src={part.img}
          alt=""
          className="
            rounded-xl md:rounded-2xl
            object-cover
            image-inline
          "
        />
        {part.caption && (
          <span className="text-xs opacity-70 mt-1 tracking-tight caption">
            {part.caption}
          </span>
        )}
      </span>
    );
  });

  // GSAP reveal
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const elements = el.querySelectorAll('.word, .image-wrapper');
    const scroller = scrollContainerRef?.current ?? window;

    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 85%',
          end: 'bottom 10%',
          scrub: 1,
        },
      }
    );
  }, [scrollContainerRef]);

  return (
    <section
      className={`w-full px-8 sm:px-16 ${containerClassName}`}
      style={{ backgroundColor: '#1c1c1c' }}
    >
      <h2 ref={containerRef} className="my-12">
        <p
          className={`
            font-bold uppercase leading-[0.9] flex flex-wrap items-center gap-y-3 md:gap-y-4
            ${isMobile ? 'text-[12vw]' : 'text-[7vw]'}
            ${textClassName}
          `}
          style={{ color: '#E8E4DD' }}
        >
          {renderParts}
        </p>
      </h2>

      <style>{`
        .image-inline {
          width: clamp(80px, 14vw, 180px);
          height: clamp(40px, 7vw, 90px);
        }
      `}</style>
    </section>
  );
};

export default ScrollReveal;